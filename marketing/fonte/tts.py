import asyncio, json, subprocess, sys, os
import edge_tts

VOICE = "pt-BR-AntonioNeural"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voz")
os.makedirs(OUT, exist_ok=True)

# Um trecho por cena do vídeo
SCENES = [
    ("hero", "Seu grupo de corrida merece um site à altura da sua galera. Apresentamos o modelo Corre que dá Tempo: uma landing page completa, feita para quem corre na rua."),
    ("ranking", "Ranking semanal e mensal, com pódio animado e gráficos dos melhores corredores."),
    ("cadastro", "Cadastro de corredores que chega direto no seu WhatsApp, sem complicação."),
    ("galeria", "Galeria dos treinos para mostrar a energia da sua equipe."),
    ("percurso", "Percurso em mapa real, com o trajeto desenhado rua por rua."),
    ("loja", "Uma loja pronta para vender camisas, bonés e acessórios do seu grupo."),
    ("anuncios", "Espaço para anúncios de fornecedores e as logos dos seus patrocinadores."),
    ("fim", "Rápido, responsivo e com a identidade visual do seu time. Chame no WhatsApp e leve esse modelo para a sua corrida."),
]

async def main():
    meta = []
    for name, text in SCENES:
        path = os.path.join(OUT, f"{name}.mp3")
        await edge_tts.Communicate(text, VOICE, rate="+5%").save(path)
        meta.append({"name": name, "file": path, "text": text})
    json.dump(meta, open(os.path.join(OUT, "scenes.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("ok", len(meta))

asyncio.run(main())
