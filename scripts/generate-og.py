from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
INK = "#17292D"
MUTED = "#4B5B5E"
PAPER = "#F3EEE6"
SURFACE = "#FFF9F0"
PRIMARY = "#1D62A8"
PRIMARY_STRONG = "#154C86"
HIGHLIGHT = "#F2D31B"
SECONDARY = "#8EC5E6"
SIGNAL = "#FC4C5A"

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-la-plata-marketing.png"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

font_dir = Path("C:/Windows/Fonts")
display_path = font_dir / "impact.ttf"
body_path = font_dir / "arial.ttf"
bold_path = font_dir / "arialbd.ttf"


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


image = Image.new("RGB", (WIDTH, HEIGHT), INK)
draw = ImageDraw.Draw(image)

# Original editorial frame: warm stock with offset signal and marker rules.
draw.rectangle((20, 20, WIDTH - 20, HEIGHT - 20), outline=SURFACE, width=7)
draw.line((46, 45, WIDTH - 46, 45), fill=PRIMARY, width=18)
draw.line((46, HEIGHT - 45, 430, HEIGHT - 45), fill=PRIMARY, width=18)
draw.line((430, HEIGHT - 45, 800, HEIGHT - 45), fill=SIGNAL, width=18)
draw.line((800, HEIGHT - 45, WIDTH - 46, HEIGHT - 45), fill=HIGHLIGHT, width=18)
draw.rectangle((74, 72, 734, 555), fill=PAPER, outline=INK, width=5)

# Header marker.
draw.rectangle((98, 96, 226, 138), fill=HIGHLIGHT, outline=INK, width=3)
draw.text((108, 102), "LA PLATA", font=font(bold_path, 22), fill=INK)
draw.text((260, 104), "MARKETING + TECNOLOGÍA", font=font(bold_path, 20), fill=INK)

# Main statement with a deliberate registration offset.
draw.text((96, 167), "MÁS", font=font(display_path, 116), fill=INK, stroke_width=1)
draw.text((96, 276), "CONSULTAS.", font=font(display_path, 102), fill=PRIMARY_STRONG)
draw.line((98, 379, 642, 379), fill=SIGNAL, width=10)
draw.text((99, 399), "MENOS TAREAS MANUALES.", font=font(display_path, 43), fill=INK)
draw.line((98, 462, 707, 462), fill=INK, width=3)
draw.text(
    (99, 480),
    "SOCIAL  /  WEB  /  CRM  /  AUTOMATIZACIONES",
    font=font(bold_path, 21),
    fill=INK,
)

# Browser window.
draw.rectangle((705, 92, 1112, 309), fill=SURFACE, outline=INK, width=5)
draw.rectangle((705, 92, 1112, 127), fill=SECONDARY, outline=INK, width=3)
for x, color in ((724, SIGNAL), (747, HIGHLIGHT), (770, PRIMARY)):
    draw.ellipse((x, 103, x + 12, 115), fill=color, outline=INK, width=1)
draw.text((800, 100), "tu-sitio.com", font=font(body_path, 15), fill=INK)
draw.rectangle((728, 150, 1086, 278), fill=SECONDARY, outline=INK, width=3)
draw.text((750, 166), "UNA PROPUESTA", font=font(bold_path, 16), fill=INK)
draw.text((750, 196), "CLARA.", font=font(display_path, 58), fill=INK)
draw.rectangle((944, 223, 1071, 261), fill=HIGHLIGHT, outline=INK, width=2)
draw.text((961, 231), "HABLEMOS +", font=font(bold_path, 15), fill=INK)
draw.rectangle((1038, 140, 1098, 202), fill=SIGNAL, outline=INK, width=2)
draw.text((1054, 152), "+", font=font(display_path, 38), fill=INK)

# CRM board.
draw.rectangle((762, 337, 1125, 520), fill=SURFACE, outline=INK, width=5)
draw.text((784, 353), "CRM / OPORTUNIDADES", font=font(bold_path, 17), fill=INK)
draw.line((784, 381, 1102, 381), fill=INK, width=2)
for x, color, label in (
    (785, SECONDARY, "NUEVA"),
    (889, HIGHLIGHT, "EN CURSO"),
    (993, SIGNAL, "PRÓXIMO"),
):
    draw.rectangle((x, 397, x + 91, 496), fill=color, outline=INK, width=2)
    draw.text((x + 8, 407), label, font=font(bold_path, 12), fill=INK)
    draw.rectangle((x + 8, 435, x + 83, 484), fill=PAPER, outline=INK, width=1)
    draw.text((x + 15, 447), "Consulta", font=font(body_path, 12), fill=INK)

# Connector stamp.
stamp = Image.new("RGBA", (430, 62), (0, 0, 0, 0))
stamp_draw = ImageDraw.Draw(stamp)
stamp_draw.rectangle((2, 2, 428, 60), fill=HIGHLIGHT, outline=INK, width=4)
stamp_draw.text((24, 17), "CONTENIDO  →  CONSULTA  →  SEGUIMIENTO", font=font(bold_path, 16), fill=INK)
stamp = stamp.rotate(-3, expand=True, resample=Image.Resampling.BICUBIC)
image.paste(stamp, (688, 518), stamp)

# Footer signature.
draw.text((99, 526), "LA PLATA MARKETING", font=font(bold_path, 16), fill=INK)

image.save(OUTPUT, format="PNG", optimize=True)
print(OUTPUT)
