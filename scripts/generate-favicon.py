from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "favicon.ico"
MASTER_SIZE = 512
VIEWBOX_SIZE = 64
SIZES = [(16, 16), (32, 32), (48, 48), (64, 64)]

BLUE = "#1536F1"
WHITE = "#FFFFFF"
SIGNAL = "#F4C430"


def scale(value: float) -> int:
    return round(value * MASTER_SIZE / VIEWBOX_SIZE)


def point(x: float, y: float) -> tuple[int, int]:
    return scale(x), scale(y)


image = Image.new("RGBA", (MASTER_SIZE, MASTER_SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle(
    (0, 0, MASTER_SIZE - 1, MASTER_SIZE - 1),
    radius=scale(8),
    fill=BLUE,
)

# Same L and forward-slash geometry as public/favicon.svg.
draw.polygon(
    [point(14, 14), point(24, 14), point(24, 41), point(39, 41), point(39, 50), point(14, 50)],
    fill=WHITE,
)
draw.polygon(
    [point(42, 14), point(50, 14), point(44, 31), point(34, 31)],
    fill=WHITE,
)
draw.ellipse(
    (scale(43), scale(41), scale(53), scale(51)),
    fill=SIGNAL,
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
image.save(OUTPUT, format="ICO", sizes=SIZES, bitmap_format="png")
print(f"Generated {OUTPUT}")
