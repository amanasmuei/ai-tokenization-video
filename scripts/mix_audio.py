"""Build the final soundtrack: voiceover + generated ambient music bed + subtle SFX.

Everything is synthesised here (no third-party audio), so the soundtrack is royalty-free.
  voice   public/voiceover/<scene>.wav placed on the video timeline
  music   additive-synthesis pads, sub bass, soft plucked arpeggio, light pulse, reverb
  sfx     brand-wipe whooshes at chapter changes, token ticks, low impacts on title/logo
The music is side-chain ducked under the voice and the master is peak-limited.
Output: public/audio/soundtrack.m4a (AAC 320k, 48 kHz stereo) — used by src/Video.tsx.
Usage: python3 scripts/mix_audio.py
"""
import os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt, sosfiltfilt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from timeline import ROOT, load  # noqa: E402

SR = 48000
rng = np.random.default_rng(7)


def db(x):
    return 10 ** (x / 20)


def note(n):
    """MIDI note → Hz."""
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x, axis=0)


def highpass(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x, axis=0)


# ---------------------------------------------------------------- music
BPM = 92
BEAT = 60 / BPM
CHORD_LEN = 8 * BEAT  # two bars per chord
# D minor 9 → B♭maj9 → Fmaj7 → C6/9  (MIDI notes)
PROG = [
    [50, 57, 60, 64, 65],
    [46, 53, 57, 60, 62],
    [41, 53, 57, 60, 64],
    [48, 55, 57, 62, 64],
]


def pad_tone(freq, n):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for detune in (-0.07, 0.0, 0.07):  # ±7 cents chorus
        f = freq * 2 ** (detune / 12)
        ph = rng.uniform(0, 2 * np.pi)
        for h in range(1, 10):
            if f * h > 6000:
                break
            out += np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.6
    return out / 3


def music(total_s):
    n = int(total_s * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    chord_n = int(CHORD_LEN * SR)
    fade = int(1.8 * SR)
    # pads with long cross-fades
    k = 0
    start = 0
    while start < n:
        chord = PROG[k % len(PROG)]
        seg = min(chord_n + fade, n - start)
        env = np.ones(seg)
        a = min(fade, seg)
        env[:a] = np.linspace(0, 1, a) ** 1.5
        env[-a:] *= np.linspace(1, 0, a) ** 1.5
        for i, m in enumerate(chord):
            tone = pad_tone(note(m + 12), seg) * env * 0.16
            pan = 0.5 + (i - 2) * 0.12
            L[start:start + seg] += tone * (1 - pan)
            R[start:start + seg] += tone * pan
        # sub bass on the root
        t = np.arange(seg) / SR
        sub = np.sin(2 * np.pi * note(chord[0] - 12) * t) * env * 0.22
        L[start:start + seg] += sub
        R[start:start + seg] += sub
        start += chord_n
        k += 1

    # plucked arpeggio (8th notes), ping-pong panned
    step = BEAT / 2
    pl_n = int(0.5 * SR)
    tt = np.arange(pl_n) / SR
    pat = [0, 2, 3, 4, 1, 3, 2, 4]
    i = 0
    t0 = 0.0
    while t0 < total_s - 1:
        chord = PROG[int(t0 // CHORD_LEN) % len(PROG)]
        m = chord[pat[i % len(pat)]] + 24
        f = note(m)
        pl = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 9) * 0.05
        s = int(t0 * SR)
        e = min(n, s + pl_n)
        pan = 0.3 if i % 2 == 0 else 0.7
        L[s:e] += pl[: e - s] * (1 - pan)
        R[s:e] += pl[: e - s] * pan
        i += 1
        t0 += step

    # soft pulse on beats 1 and 3
    kn = int(0.35 * SR)
    kt = np.arange(kn) / SR
    kick = np.sin(2 * np.pi * (48 + 60 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 11) * 0.18
    b = 0.0
    while b < total_s - 1:
        s = int(b * SR)
        e = min(n, s + kn)
        L[s:e] += kick[: e - s]
        R[s:e] += kick[: e - s]
        b += 2 * BEAT

    mix = np.stack([L, R], axis=1)
    mix = lowpass(mix, 7000)
    mix = reverb(mix, 3.2, 0.28)
    return mix


def reverb(x, seconds, wet):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * 6.9 / seconds)[:, None]
    ir = lowpass(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + y * wet * 1.8


# ---------------------------------------------------------------- sfx
def whoosh(dur=0.9):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    # sweep a band-pass by blending three fixed bands over time
    lo = lowpass(noise, 600)
    mid = sosfilt(butter(2, [900, 2500], "band", fs=SR, output="sos"), noise)
    hi = highpass(noise, 3500)
    x = np.linspace(0, 1, n)
    sig = lo * (1 - x) + mid * np.sin(np.pi * x) + hi * x * 0.6
    sig *= env
    pan = np.linspace(0.15, 0.85, n)  # left → right with the wipe
    return np.stack([sig * (1 - pan), sig * pan], axis=1) * 0.35


def tick():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 90) * 0.12
    return np.stack([s, s], axis=1)


def impact():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 50 * np.exp(-t * 8)) * t) * np.exp(-t * 2.2)
    air = lowpass(rng.standard_normal(n), 1800) * np.exp(-t * 5) * 0.25
    s = (boom + air) * 0.5
    return reverb(np.stack([s, s], axis=1), 2.5, 0.3)


def place(buf, clip, at_s, gain=1.0):
    s = int(at_s * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(clip))
    buf[s:e] += clip[: e - s] * gain


# ---------------------------------------------------------------- mix
def main():
    t, scenes, total_frames = load()
    fps = t["fps"]
    total_s = total_frames / fps
    n = int(total_s * SR)

    # voice
    voice = np.zeros((n, 2))
    for sc in scenes:
        v, sr = sf.read(os.path.join(ROOT, "public", "voiceover", f"{sc['id']}.wav"))
        v = resample_poly(v, SR, sr) if sr != SR else v
        v = highpass(v, 70)
        place(voice, np.stack([v, v], axis=1), (sc["from"] + sc["lead"]) / fps)
    active = np.abs(voice[:, 0]) > 1e-4
    rms = np.sqrt((voice[active, 0] ** 2).mean())
    voice *= db(-19) / rms

    # side-chain envelope from voice (smoothed)
    env = np.abs(voice[:, 0])
    env = sosfiltfilt(butter(1, 1.2, "low", fs=SR, output="sos"), env)
    env = np.clip(env / (env.max() * 0.25), 0, 1)
    duck = db(-9) + (1 - db(-9)) * (1 - env)

    # music
    mus = music(total_s)
    mus *= db(-27) / np.sqrt((mus ** 2).mean())
    fade_in = np.clip(np.arange(n) / (2.5 * SR), 0, 1)
    fade_out = np.clip((n - np.arange(n)) / (5.0 * SR), 0, 1)
    mus *= (duck * fade_in * fade_out)[:, None]

    # sfx
    sfx = np.zeros((n, 2))
    w = whoosh()
    half_wipe = t["wipe"] / 2 / fps
    for sc in scenes[1:]:
        place(sfx, w, sc["from"] / fps - half_wipe - 0.1, db(-6))
    hook = scenes[0]
    for i in range(11):  # token chips streaming in the hook (S01Hook: 14 + i*5 frames after lead-in)
        place(sfx, tick(), (hook["from"] + hook["lead"] + 14 + i * 5) / fps, db(-4))
    imp = impact()
    place(sfx, imp, (hook["from"] + hook["beats"][2]) / fps, db(-5))  # title card
    outro = scenes[-1]
    place(sfx, imp, (outro["from"] + outro["beats"][1] + 8) / fps, db(-5))  # logo

    master = voice + mus + sfx
    peak = np.abs(master).max()
    master = master / peak * db(-1.0) if peak > db(-1.0) else master
    master = np.tanh(master * 1.05) / np.tanh(1.05)

    out_dir = os.path.join(ROOT, "public", "audio")
    os.makedirs(out_dir, exist_ok=True)
    tmp = os.path.join(ROOT, ".cache", "soundtrack.wav")
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    sf.write(tmp, master.astype(np.float32), SR, subtype="PCM_24")
    dst = os.path.join(out_dir, "soundtrack.m4a")
    subprocess.run(
        ["npx", "remotion", "ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", tmp, "-c:a", "libfdk_aac", "-b:a", "320k", "-f", "mp4", dst],
        check=True,
        cwd=ROOT,
    )
    print(f"soundtrack {total_s:.1f}s → {dst}")


if __name__ == "__main__":
    main()
