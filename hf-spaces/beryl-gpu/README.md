---
title: Beryl GPU
emoji: ⚡
colorFrom: green
colorTo: indigo
sdk: gradio
sdk_version: "4.44.0"
app_file: app.py
pinned: true
license: mit
---

# Beryl GPU — ZeroGPU Inference Space

Powers all AI generation on [berylize.com](https://berylize.com).

- **Image**: Stable Diffusion XL (1024×1024, DPM++ scheduler)
- **Video**: CogVideoX-5b (text-to-video, up to 49 frames)
- **Voice**: Coqui XTTS-v2 (multilingual, voice cloning)

All endpoints return base64-encoded results for direct embedding.
Runs on ZeroGPU A100 — $0 when idle, instant on demand.
