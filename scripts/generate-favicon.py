from pathlib import Path

import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "favicon.ico"
SIZES = [(16, 16), (32, 32), (48, 48), (64, 64)]
BLUE = "#1536f1"
WHITE = "#ffffff"

# Package the supplied profile image unchanged in composition. The SVG uses
# the exact official vector path, including its contour and internal cutouts.
image = Image.open(ROOT / "public" / "brand" / "lpm-profile.png").convert("RGBA")
vector = ET.parse(ROOT / "public" / "brand" / "lpm-logo.svg").getroot()
path = vector.find("{http://www.w3.org/2000/svg}path").attrib["d"]
favicon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" role="img" aria-labelledby="title">
  <title id="title">La Plata Marketing</title>
  <rect width="1080" height="1080" fill="{BLUE}"/>
  <svg x="162" y="294" width="756" height="492" viewBox="0 0 1154 752">
    <path fill="{WHITE}" fill-rule="evenodd" d="{path}"/>
  </svg>
</svg>
'''
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.with_suffix(".svg").write_text(favicon, encoding="utf-8")
image.save(OUTPUT, format="ICO", sizes=SIZES, bitmap_format="png")
print(f"Generated {OUTPUT} and favicon.svg from the official LPM assets")
