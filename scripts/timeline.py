"""Shared timeline maths (mirrors src/timeline.ts). Scene lengths come from the voiceover."""
import json, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ["hook", "silicon", "cluster", "gpuaas", "tokens", "phases", "kvcache", "serving", "economics", "stack", "outro"]


def load():
    t = json.load(open(os.path.join(ROOT, "src", "data", "timing.json")))
    vo = json.load(open(os.path.join(ROOT, "src", "data", "voiceover.json")))
    fps, frm, out = t["fps"], 0, []
    for i, sid in enumerate(ORDER):
        v = vo[sid]
        lead = t["leadIn"] + (t["intro"] if i == 0 else 0)
        dur = math.ceil(v["duration"] * fps) + lead + (t["outroHold"] if i == len(ORDER) - 1 else 0)
        out.append({"id": sid, "from": frm, "duration": dur, "lead": lead,
                    "beats": [round(s * fps) + lead for s in v["sentences"]]})
        frm += dur
    return t, out, frm
