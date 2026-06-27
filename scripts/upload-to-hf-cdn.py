"""
upload-to-hf-cdn.py
====================
Uploads all static assets (videos, character images, use-case images)
from /public to the AIBRUH/beryl-assets HuggingFace Dataset repo.

Once uploaded, berylize.com serves them from HF's global CDN edge —
not from your device, not from the Docker container disk.

Usage:
    pip install huggingface_hub
    python scripts/upload-to-hf-cdn.py

Requires: HF token with write access to AIBRUH/beryl-assets
Set it as env var:  set HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
Or pass directly:   python scripts/upload-to-hf-cdn.py --token hf_xxx
"""

import os
import sys
import argparse
from pathlib import Path
from huggingface_hub import HfApi, CommitOperationAdd

REPO_ID   = "AIBRUH/beryl-assets"
REPO_TYPE = "dataset"

# Folders under /public to upload
UPLOAD_DIRS = [
    "videos",
    "characters",
    "use-cases",
]

# Individual files to upload from /public root
UPLOAD_FILES = [
    "kizzy-sofa.png",
    "voice-agent-model.jpeg",
    "beryl-logo.png",
    "favicon.ico",
]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--token", default=os.getenv("HF_TOKEN"), help="HuggingFace write token")
    parser.add_argument("--dry-run", action="store_true", help="List files without uploading")
    args = parser.parse_args()

    if not args.token:
        print("ERROR: Set HF_TOKEN env var or pass --token hf_xxx")
        sys.exit(1)

    api   = HfApi(token=args.token)
    root  = Path(__file__).parent.parent / "public"
    ops   = []

    # Collect all files from target directories
    for d in UPLOAD_DIRS:
        dir_path = root / d
        if not dir_path.exists():
            print(f"  SKIP (not found): {dir_path}")
            continue
        for f in sorted(dir_path.rglob("*")):
            if f.is_file():
                repo_path = str(f.relative_to(root)).replace("\\", "/")
                ops.append((f, repo_path))

    # Collect individual root files
    for name in UPLOAD_FILES:
        f = root / name
        if f.exists():
            ops.append((f, name))

    print(f"\n{'DRY RUN — ' if args.dry_run else ''}Uploading {len(ops)} files to {REPO_ID}\n")
    for local, remote in ops:
        size_kb = local.stat().st_size // 1024
        print(f"  {'[would upload]' if args.dry_run else '[uploading]'} {remote}  ({size_kb} KB)")

    if args.dry_run:
        print("\nDry run complete. Run without --dry-run to upload.")
        return

    # Create repo if it doesn't exist
    try:
        api.create_repo(repo_id=REPO_ID, repo_type=REPO_TYPE, exist_ok=True, private=False)
    except Exception as e:
        print(f"Repo check: {e}")

    # Upload in a single commit for efficiency
    commit_ops = [
        CommitOperationAdd(path_in_repo=remote, path_or_fileobj=str(local))
        for local, remote in ops
    ]

    api.create_commit(
        repo_id=REPO_ID,
        repo_type=REPO_TYPE,
        operations=commit_ops,
        commit_message=f"Upload {len(ops)} Beryl Live static assets",
    )

    print(f"\n✅ Done! {len(ops)} files live at:")
    print(f"   https://huggingface.co/datasets/{REPO_ID}/resolve/main/")
    print(f"\nExample video URL:")
    print(f"   https://huggingface.co/datasets/{REPO_ID}/resolve/main/videos/beryl-banner.mp4")
    print(f"\nNext step: set NEXT_PUBLIC_USE_HF_CDN=true in your Space environment variables.")

if __name__ == "__main__":
    main()
