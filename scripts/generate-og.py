from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
BG = "#F3EFE5"
SURFACE = "#FFFDF7"
INK = "#111318"
MUTED = "#56595F"
BLUE = "#1536F1"
SKY = "#B7D7EE"
SIGNAL = "#F4C430"
PULSE = "#F0442D"
GRID = "#DED9CF"

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-la-plata-marketing.png"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

font_dir = Path("C:/Windows/Fonts")
display_path = font_dir / "impact.ttf"
body_path = font_dir / "arial.ttf"
bold_path = font_dir / "arialbd.ttf"
editorial_path = font_dir / "georgiai.ttf"
mono_path = font_dir / "consola.ttf"


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


image = Image.new("RGB", (WIDTH, HEIGHT), BG)
draw = ImageDraw.Draw(image)

# Quiet graph-paper field from the production background.
for x in range(0, WIDTH, 48):
    draw.line((x, 0, x, HEIGHT), fill=GRID, width=1)
for y in range(0, HEIGHT, 48):
    draw.line((0, y, WIDTH, y), fill=GRID, width=1)

# Header signature.
draw.rounded_rectangle((46, 38, 90, 82), radius=5, fill=BLUE)
draw.text((56, 46), "L/", font=font(mono_path, 18), fill="white")
draw.text((104, 42), "LPM", font=font(bold_path, 29), fill=INK)
draw.text((46, 102), "MARKETING × TECNOLOGÍA × VENTAS", font=font(mono_path, 17), fill=INK)
draw.rectangle((46, 129, 56, 139), fill=SIGNAL, outline=INK, width=1)

# Main proposition.
draw.text((44, 164), "HACEMOS QUE", font=font(display_path, 92), fill=INK)
draw.text((44, 251), "TODO TRABAJE COMO", font=font(display_path, 80), fill=INK)
draw.text((45, 345), "UN SISTEMA.", font=font(editorial_path, 92), fill=BLUE)

# Compact system diagram on the right.
draw.rounded_rectangle((820, 145, 1152, 460), radius=8, fill=SURFACE, outline=INK, width=3)
draw.text((846, 170), "UN RECORRIDO CONECTADO", font=font(mono_path, 15), fill=INK)
flow = [
    ("01", "ATRAER", SKY),
    ("02", "CONVERTIR", BLUE),
    ("03", "SEGUIR", SIGNAL),
    ("04", "CRECER", PULSE),
]
for index, (number, label, color) in enumerate(flow):
    top = 210 + index * 57
    text_color = "white" if color == BLUE else INK
    draw.rounded_rectangle((846, top, 1126, top + 43), radius=4, fill=color, outline=INK, width=2)
    draw.text((859, top + 11), number, font=font(mono_path, 13), fill=text_color)
    draw.text((908, top + 8), label, font=font(bold_path, 18), fill=text_color)
    if index < len(flow) - 1:
        draw.text((975, top + 42), "↓", font=font(mono_path, 15), fill=INK)

# Outcome band and location signature.
draw.line((46, 493, 1152, 493), fill=INK, width=2)
outcomes = [
    "PRESENCIA QUE REPRESENTA",
    "CONSULTAS QUE SE MIDEN",
    "PROCESOS QUE SE ORDENAN",
]
cell_width = 1106 // 3
for index, outcome in enumerate(outcomes):
    left = 46 + index * cell_width
    if index:
        draw.line((left, 493, left, 558), fill=INK, width=1)
    draw.text((left + 12, 512), f"0{index + 1}", font=font(mono_path, 13), fill=BLUE)
    draw.text((left + 45, 512), outcome, font=font(bold_path, 14), fill=INK)

draw.text((46, 586), "LA PLATA MARKETING / 2026", font=font(mono_path, 14), fill=MUTED)
draw.text((878, 584), "LAPLATAMARKETING.COM", font=font(mono_path, 14), fill=MUTED)

image.save(OUTPUT, format="PNG", optimize=True)
print(OUTPUT)
