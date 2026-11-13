# Comercial do site

Video: comercial-corre-que-da-tempo.mp4 (60 s, 1920x1080, locucao pt-BR + batida 128 BPM).

Arquivos em `fonte/` regeneram tudo:

1. `python tts.py` - locucao (edge-tts, voz pt-BR-AntonioNeural). Edite o texto em SCENES.
2. `python beat.py 64` - batida 128 BPM sintetizada (beat.wav).
3. `node record.mjs` - grava o site rodando em http://localhost:3001 (precisa de `npm i puppeteer` e ffmpeg).
4. Montagem final com ffmpeg (comando no historico da sessao / README).
