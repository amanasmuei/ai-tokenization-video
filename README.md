# From GPU to Token — TM GPUaaS technical explainer

A 6-minute, 1080p English explainer video for an expert AI audience. It follows the path
from accelerator hardware, through GPU-as-a-Service, to tokenization and the unit economics
of LLM inference. Built with [Remotion](https://remotion.dev) (React) using the TM Global / TM GPUaaS brand
system. The voiceover is generated offline with [Kokoro TTS](https://github.com/thewh1teagle/kokoro-onnx)
(full-precision model), and the music bed and sound effects are synthesised in code, so the whole soundtrack is royalty-free.

Production details: cinematic cold open, TM diagonal-stripe chapter transitions, mask-reveal titles,
slow camera push-in, animated perspective grid and particles, film grain against banding, a music bed
ducked under the voice, and a master encode at CRF 16 (x264 slow, BT.709, AAC 320k).

## Chapters

| # | Chapter | Key technical content |
|---|---------|-----------------------|
| — | Intro | Streaming a real BPE token sequence; silicon → memory → network → power → token |
| 01 | The silicon | H100: 132 SMs, ~989 TFLOPS BF16 / ~1,979 FP8 (dense), 80 GB HBM3 @ 3.35 TB/s; H200 / B200 bandwidth; FP4 |
| 02 | Scale-up & scale-out | HGX 8-GPU NVLink/NVSwitch (900 GB/s per GPU); rail-optimised 400G InfiniBand/RoCE; ~10 kW node, ~120 kW NVL72 rack |
| 03 | GPU-as-a-Service | Bare metal / passthrough VMs, MIG (7× 1g.10gb), Kubernetes + GPU Operator / Slurm, DCGM, per GPU-hour; TM GPUaaS sovereign positioning |
| 04 | Tokenization | BPE, cl100k vs o200k, token IDs → embeddings; **real** EN vs Bahasa Melayu token counts (+36% o200k, +82% cl100k) |
| 05 | Prefill vs decode | Compute- vs memory-bound phases, TTFT; roofline: 16 GB ÷ 3.35 TB/s ≈ 4.8 ms → ~200 tok/s; arithmetic intensity vs ridge point |
| 06 | KV cache | 2 × 80 × 8 × 128 × 2 B = 320 KiB/token (Llama 3.1 70B); 40 GiB per 128K context; ≤11 sequences per 8× H100 node |
| 07 | Serving stack | Continuous batching, PagedAttention, FlashAttention, FP8/FP4, speculative decoding, prefix caching, disaggregated serving; vLLM / SGLang / TensorRT-LLM |
| 08 | Token economics | Cost/1M tokens = GPU-hour ÷ (tok/s × 3600) × 10⁶; illustrative 200 vs 5,000 tok/s → 25× |
| 09 | Value stack | Hardware → GPU-hours → tokens (MaaS, OpenAI-compatible, usage metering); tokens/s/GPU → tokens/watt |
| — | Outro | TM GPUaaS — Sovereign GPU cloud for AI |

## Project layout

```
script/narration.json   Narration per scene: `text` (display / captions) and `say` (TTS-friendly spelling)
script/captions.srt     English subtitles generated from the narration timing
scripts/tokenize.mjs    Computes the real token splits shown on screen → src/data/tokens.json
scripts/voiceover.py    Offline Kokoro TTS → public/voiceover/*.wav + src/data/voiceover.json (sentence timings)
scripts/mix_audio.py    Music bed + SFX + voice → public/audio/soundtrack.m4a (the audio used in the render)
scripts/timeline.py     Scene timing shared with src/timeline.ts (both read src/data/timing.json)
scripts/captions.mjs    Builds script/captions.srt
src/Video.tsx           Timeline: scene lengths and animation beats are driven by the voiceover timings
src/scenes/             One component per chapter
src/components/         Brand UI primitives (eyebrow, headings, panels, chevron) and the frame chrome
public/brand, fonts     TM Global logo, CTA element, HK Grotesk Wide, Roboto, JetBrains Mono
```

## Build

```bash
npm install
pip install kokoro-onnx soundfile scipy  # voiceover + soundtrack only

npm run tokens                           # optional: recompute token splits
npm run voiceover                        # regenerate narration (downloads Kokoro model on first run)
python3 scripts/mix_audio.py             # rebuild the soundtrack (always after a voiceover change)
node scripts/captions.mjs                # regenerate subtitles
npm run studio                           # preview / scrub in the browser
npm run render                           # → out/gpu-to-token.mp4 (master quality)
```

Editing the narration: change `text` and `say` in `script/narration.json`, then run
`python3 scripts/voiceover.py --only <scene-id>` followed by `python3 scripts/mix_audio.py`. Every animation beat is keyed to a
sentence index, so the visuals re-time themselves automatically. To change the voice, pass
`--voice am_michael` (or any other Kokoro voice) and `--speed`.

## Accuracy notes for presenters

- Hardware figures are vendor datasheet peaks (SXM, dense, no sparsity). B200 capacity is shown at its maximum configuration.
- Token counts are computed with OpenAI `tiktoken` vocabularies (`cl100k_base`, `o200k_base`). Other tokenizers (e.g. Llama 3) give different counts.
- The cost-per-token example is **illustrative** ($10/GPU-hour, 200 vs 5,000 tok/s). It is not TM GPUaaS pricing.
- TM GPUaaS claims shown (sovereign, Malaysia-hosted, 100% data residency, Tier-III) come from the TM GPUaaS landing page. The video does not name the GPU SKUs TM offers; confirm them with the product team before adding any.
