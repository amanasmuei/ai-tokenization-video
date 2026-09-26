"""Generate the English voiceover offline with Kokoro TTS (Apache-2.0, runs on CPU).

For each scene in script/narration.json the `say` text is split into sentences,
synthesised one sentence at a time and joined with short pauses. Output:
  public/voiceover/<scene>.wav   – audio per scene
  src/data/voiceover.json        – per-scene duration + per-sentence start times,
                                   used by the Remotion scenes to sync animation beats.
Usage: python3 scripts/voiceover.py [--voice af_heart] [--speed 1.0]
"""
import argparse, json, os, re, urllib.request
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache", "kokoro")
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = {"model": "kokoro-v1.0.int8.onnx", "voices": "voices-v1.0.bin"}
SENTENCE_GAP = 0.28  # seconds of silence between sentences
TAIL = 0.6           # silence at end of each scene


def ensure_models():
    os.makedirs(CACHE, exist_ok=True)
    for name in FILES.values():
        path = os.path.join(CACHE, name)
        if not os.path.exists(path):
            print("downloading", name)
            urllib.request.urlretrieve(BASE + name, path)
    return [os.path.join(CACHE, FILES[k]) for k in ("model", "voices")]


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", help="regenerate a single scene id")
    args = ap.parse_args()

    kokoro = Kokoro(*ensure_models())
    scenes = json.load(open(os.path.join(ROOT, "script", "narration.json")))
    out_dir = os.path.join(ROOT, "public", "voiceover")
    os.makedirs(out_dir, exist_ok=True)
    meta_path = os.path.join(ROOT, "src", "data", "voiceover.json")
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}

    for scene in scenes:
        if args.only and scene["id"] != args.only:
            continue
        chunks, starts, t, sr = [], [], 0.0, 24000
        for s in sentences(scene["say"]):
            audio, sr = kokoro.create(s, voice=args.voice, speed=args.speed, lang="en-us")
            starts.append(round(t, 3))
            chunks += [audio, np.zeros(int(SENTENCE_GAP * sr), dtype=audio.dtype)]
            t += len(audio) / sr + SENTENCE_GAP
        chunks.append(np.zeros(int(TAIL * sr), dtype=chunks[0].dtype))
        wav = np.concatenate(chunks)
        sf.write(os.path.join(out_dir, f"{scene['id']}.wav"), wav, sr)
        meta[scene["id"]] = {"duration": round(len(wav) / sr, 3), "sentences": starts}
        print(f"{scene['id']:10s} {len(wav)/sr:6.1f}s  {len(starts)} sentences")

    json.dump(meta, open(meta_path, "w"), indent=2)
    print("total", round(sum(m["duration"] for m in meta.values()), 1), "s")


if __name__ == "__main__":
    main()
