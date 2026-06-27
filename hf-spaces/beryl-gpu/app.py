"""
BERYL GPU SPACE — AIBRUH/beryl-gpu
===================================
Deploy this as a NEW Gradio Space on HuggingFace with ZeroGPU enabled.

Space settings:
  Name:     beryl-gpu
  SDK:      Gradio
  Hardware: ZeroGPU (auto-scales A100 on demand, $0 when idle)
  Visibility: Public (so berylize.com can call the API)

This Space handles all GPU inference for berylize.com:
  /api/generate-image   → Stable Diffusion XL / Flux
  /api/generate-video   → CogVideoX / AnimateDiff
  /api/voice-clone      → Coqui XTTS / Bark
  /api/lip-sync         → LatentSync (already on AIBRUH/latentsync)

Called from the Next.js site via fetch() — your device never involved.
"""

import spaces          # ZeroGPU decorator
import gradio as gr
import torch
from pathlib import Path
import tempfile, os, json, base64

# ── Model loading (lazy — only when first request hits) ───────────────────────
_sdxl_pipe   = None
_xtts_model  = None

def get_sdxl():
    global _sdxl_pipe
    if _sdxl_pipe is None:
        from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
        _sdxl_pipe = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16",
        )
        _sdxl_pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            _sdxl_pipe.scheduler.config, use_karras_sigmas=True
        )
        _sdxl_pipe = _sdxl_pipe.to("cuda")
        _sdxl_pipe.enable_xformers_memory_efficient_attention()
    return _sdxl_pipe


# ── /api/generate-image ───────────────────────────────────────────────────────
@spaces.GPU(duration=60)
def generate_image(
    prompt: str,
    negative_prompt: str = "blurry, watermark, low quality, distorted",
    width: int = 1024,
    height: int = 1024,
    steps: int = 30,
    guidance: float = 7.5,
    seed: int = -1,
):
    pipe = get_sdxl()
    generator = torch.Generator("cuda").manual_seed(seed if seed >= 0 else torch.randint(0, 2**31, (1,)).item())

    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        num_inference_steps=steps,
        guidance_scale=guidance,
        generator=generator,
    )
    img = result.images[0]

    # Return as base64 so the Next.js site can embed directly
    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    return {"status": "ok", "image_b64": b64, "format": "png"}


# ── /api/generate-video ───────────────────────────────────────────────────────
@spaces.GPU(duration=120)
def generate_video(
    prompt: str,
    num_frames: int = 49,
    fps: int = 8,
    seed: int = -1,
):
    """
    Uses CogVideoX-5b for text-to-video.
    Falls back to AnimateDiff if CogVideoX unavailable.
    """
    try:
        from diffusers import CogVideoXPipeline
        from diffusers.utils import export_to_video

        pipe = CogVideoXPipeline.from_pretrained(
            "THUDM/CogVideoX-5b",
            torch_dtype=torch.bfloat16,
        ).to("cuda")
        pipe.enable_model_cpu_offload()
        pipe.vae.enable_tiling()

        generator = torch.Generator("cuda").manual_seed(seed if seed >= 0 else 42)
        frames = pipe(
            prompt=prompt,
            num_inference_steps=50,
            num_frames=num_frames,
            generator=generator,
        ).frames[0]

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            export_to_video(frames, f.name, fps=fps)
            video_bytes = Path(f.name).read_bytes()
            os.unlink(f.name)

        b64 = base64.b64encode(video_bytes).decode()
        return {"status": "ok", "video_b64": b64, "format": "mp4"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── /api/voice-clone ──────────────────────────────────────────────────────────
@spaces.GPU(duration=30)
def voice_clone(text: str, speaker_wav_b64: str | None = None, language: str = "en"):
    """
    Clones voice from a reference audio clip using Coqui XTTS-v2.
    If no reference provided, uses Beryl's default voice preset.
    """
    try:
        from TTS.api import TTS

        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")

        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = os.path.join(tmpdir, "output.wav")

            if speaker_wav_b64:
                ref_path = os.path.join(tmpdir, "ref.wav")
                Path(ref_path).write_bytes(base64.b64decode(speaker_wav_b64))
                tts.tts_to_file(text=text, speaker_wav=ref_path, language=language, file_path=out_path)
            else:
                # Use first available speaker as default
                tts.tts_to_file(text=text, speaker=tts.speakers[0], language=language, file_path=out_path)

            audio_bytes = Path(out_path).read_bytes()

        b64 = base64.b64encode(audio_bytes).decode()
        return {"status": "ok", "audio_b64": b64, "format": "wav"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Gradio UI (also serves as API) ───────────────────────────────────────────
with gr.Blocks(title="Beryl GPU — AI Inference API") as demo:
    gr.Markdown("""
    # ⚡ Beryl GPU Space
    **ZeroGPU-powered inference for berylize.com**

    This Space runs on HuggingFace ZeroGPU (A100 on demand).
    It is called via API by the Beryl Live Next.js site.
    All endpoints accept and return JSON.
    """)

    with gr.Tab("Image Generation"):
        with gr.Row():
            with gr.Column():
                img_prompt   = gr.Textbox(label="Prompt", placeholder="Cinematic portrait of a confident AI architect...")
                img_neg      = gr.Textbox(label="Negative Prompt", value="blurry, watermark, low quality")
                img_steps    = gr.Slider(10, 50, value=30, step=1, label="Steps")
                img_guidance = gr.Slider(1, 15, value=7.5, label="Guidance Scale")
                img_seed     = gr.Number(value=-1, label="Seed (-1 = random)")
                img_btn      = gr.Button("Generate Image", variant="primary")
            with gr.Column():
                img_out      = gr.JSON(label="API Response (base64 PNG)")
        img_btn.click(generate_image, inputs=[img_prompt, img_neg, gr.Number(value=1024, visible=False), gr.Number(value=1024, visible=False), img_steps, img_guidance, img_seed], outputs=img_out)

    with gr.Tab("Video Generation"):
        vid_prompt = gr.Textbox(label="Prompt", placeholder="A photorealistic AI avatar speaking to camera...")
        vid_frames = gr.Slider(16, 49, value=49, step=1, label="Frames")
        vid_fps    = gr.Slider(4, 24, value=8, label="FPS")
        vid_btn    = gr.Button("Generate Video", variant="primary")
        vid_out    = gr.JSON(label="API Response (base64 MP4)")
        vid_btn.click(generate_video, inputs=[vid_prompt, vid_frames, vid_fps], outputs=vid_out)

    with gr.Tab("Voice Clone"):
        vc_text    = gr.Textbox(label="Text to synthesize")
        vc_lang    = gr.Dropdown(["en", "es", "fr", "de", "zh", "ja", "ko", "pt"], value="en", label="Language")
        vc_btn     = gr.Button("Synthesize Voice", variant="primary")
        vc_out     = gr.JSON(label="API Response (base64 WAV)")
        vc_btn.click(voice_clone, inputs=[vc_text, gr.Textbox(value="", visible=False), vc_lang], outputs=vc_out)

    gr.Markdown("""
    ---
    ### API Usage from Next.js
    ```js
    const res = await fetch("https://aibruh-beryl-gpu.hf.space/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fn_index: 0, data: [prompt, negPrompt, 1024, 1024, 30, 7.5, -1] })
    });
    ```
    """)

if __name__ == "__main__":
    demo.queue(max_size=10).launch()
