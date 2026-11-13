"""Sintetiza uma batida eletrônica de 128 BPM (kick, snare/clap, hi-hat, baixo e um pad) em WAV estéreo."""
import math, random, struct, wave, os, sys

SR = 44100
BPM = 128
BEAT = 60 / BPM                 # 0.46875 s
BAR = BEAT * 4
DURATION = float(sys.argv[1]) if len(sys.argv) > 1 else 64.0
N = int(SR * DURATION)
random.seed(7)

def env(t, a, d):               # ataque/decaimento simples
    if t < 0: return 0.0
    if t < a: return t / a
    return max(0.0, 1 - (t - a) / d)

# Progressão de baixo (notas MIDI) por compasso: Am - F - C - G (estilo corrida/energia)
ROOTS = [45, 41, 36, 43]
def midi_hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def render():
    L = [0.0] * N
    R = [0.0] * N

    # Eventos por batida
    total_beats = int(DURATION / BEAT) + 1
    for b in range(total_beats):
        t0 = b * BEAT
        bar = b // 4
        step = b % 4
        i0 = int(t0 * SR)
        # intro suave nos 2 primeiros compassos, sem kick no último compasso (fade)
        intro = bar < 2
        # KICK em todo tempo (four on the floor)
        if not intro or step == 0:
            for i in range(i0, min(N, i0 + int(0.35 * SR))):
                t = (i - i0) / SR
                f = 50 + 120 * math.exp(-t * 28)
                s = math.sin(2 * math.pi * f * t) * env(t, 0.002, 0.3) * 0.9
                L[i] += s; R[i] += s
        # SNARE/CLAP nos tempos 2 e 4
        if step in (1, 3) and not intro:
            for i in range(i0, min(N, i0 + int(0.22 * SR))):
                t = (i - i0) / SR
                s = (random.random() * 2 - 1) * env(t, 0.001, 0.16) * 0.45
                s += math.sin(2 * math.pi * 190 * t) * env(t, 0.001, 0.08) * 0.3
                L[i] += s; R[i] += s
        # HI-HAT em colcheias (fechado) + aberto no contratempo a cada 2 compassos
        for sub in (0, 0.5):
            ih = int((t0 + sub * BEAT) * SR)
            dur = 0.12 if (sub == 0.5 and bar % 2 == 1 and step == 3) else 0.045
            gain = 0.22 if sub == 0 else 0.16
            for i in range(ih, min(N, ih + int(dur * SR))):
                t = (i - ih) / SR
                s = (random.random() * 2 - 1) * env(t, 0.0005, dur) * gain
                L[i] += s * 0.8; R[i] += s * 1.0
        # BAIXO: colcheias off-beat, nota do compasso
        root = ROOTS[bar % 4]
        for sub, octv in ((0.5, 0), (0.75, 12)):
            ib = int((t0 + sub * BEAT) * SR)
            f = midi_hz(root + octv)
            for i in range(ib, min(N, ib + int(0.2 * SR))):
                t = (i - ib) / SR
                saw = 2 * ((f * t) % 1) - 1
                s = (0.6 * saw + 0.4 * math.sin(2 * math.pi * f * t)) * env(t, 0.004, 0.18) * 0.35
                L[i] += s; R[i] += s

    # PAD: acorde sustentado, estéreo, bem ao fundo
    for i in range(N):
        t = i / SR
        bar = int(t / BAR)
        root = ROOTS[bar % 4] + 12
        chord = (root, root + 3 if bar % 4 == 0 else root + 4, root + 7)
        s = 0.0
        for k, m in enumerate(chord):
            f = midi_hz(m)
            s += math.sin(2 * math.pi * f * t + 0.3 * k) * 0.05
        lfo = 0.5 + 0.5 * math.sin(2 * math.pi * 0.25 * t)
        L[i] += s * (0.6 + 0.4 * lfo)
        R[i] += s * (1.0 - 0.4 * lfo)

    # Fade-in 1 s e fade-out 3 s
    fi, fo = int(1 * SR), int(3 * SR)
    for i in range(N):
        g = 1.0
        if i < fi: g = i / fi
        if i > N - fo: g = (N - i) / fo
        L[i] *= g; R[i] *= g

    # Normalização + soft clip
    peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "beat.wav")
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        frames = bytearray()
        for i in range(N):
            l = math.tanh(L[i] / peak * 1.4) * 0.95
            r = math.tanh(R[i] / peak * 1.4) * 0.95
            frames += struct.pack("<hh", int(l * 32767), int(r * 32767))
        w.writeframes(bytes(frames))
    print("ok", out, DURATION, "s")

render()
