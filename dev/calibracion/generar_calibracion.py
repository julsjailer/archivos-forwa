#!/usr/bin/env python3
"""Genera calibracion_desfase.mp4: contador de milisegundos con un pitido en cada "0".

Sirve para medir el desfase entre audio e imagen de un sticker en un celular:
se crea un sticker con este video (compensación 0) y se mira qué número aparece al oír el pitido.

Uso: python3 generar_calibracion.py FUENTE.ttf [salida.mp4]   (requiere ffmpeg)
"""
import subprocess, sys, tempfile, os

font = sys.argv[1] if len(sys.argv) > 1 else "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"
out = sys.argv[2] if len(sys.argv) > 2 else "calibracion_desfase.mp4"
parts = []
for k in range(10):
    x = 12 + k * 49
    parts.append(f"drawbox=x={x}:y=330:w=43:h=70:color={'red' if k == 0 else 'gray'}:t=4")
    parts.append(f"drawbox=x={x}:y=330:w=43:h=70:color={'red' if k == 0 else 'lime'}:t=fill:enable='eq(floor(mod(t,1)*10),{k})'")
    parts.append(f"drawtext=fontfile={font}:text='{k}':x={x + 14}:y=410:fontsize=26:fontcolor=white")
parts += [
    rf"drawtext=fontfile={font}:text='%{{eif\:floor(mod(t,1)*10)*100\:d}}':x=(w-tw)/2:y=110:fontsize=150:fontcolor=white",
    rf"drawtext=fontfile={font}:text='ms':x=(w-tw)/2:y=265:fontsize=40:fontcolor=white",
    rf"drawtext=fontfile={font}:text='Al oir el pitido mira el numero':x=(w-tw)/2:y=30:fontsize=26:fontcolor=yellow",
    rf"drawtext=fontfile={font}:text='(x100 ms)':x=(w-tw)/2:y=455:fontsize=22:fontcolor=gray",
]
graph = ("color=c=black:s=512x512:r=30:d=5,format=yuv420p," + ",".join(parts) +
         "[v];aevalsrc=exprs='0.8*sin(2*PI*1000*t)*lt(mod(t,1),0.06)':s=48000:d=5[a]")
with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
    f.write(graph)
try:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-/filter_complex", f.name, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "aac", "-b:a", "128k",
                    "-movflags", "+faststart", out], check=True)
finally:
    os.unlink(f.name)
print("Creado", out)
