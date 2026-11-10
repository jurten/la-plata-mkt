from pathlib import Path
from io import BytesIO
import subprocess

import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "favicon.ico"
SIZES = [(16, 16), (32, 32), (48, 48), (64, 64)]
WHITE = "#ffffff"

# Preserve the official vector, filling the available width on a transparent canvas.
vector = ET.parse(ROOT / "public" / "brand" / "lpm-logo.svg").getroot()
path = vector.find("{http://www.w3.org/2000/svg}path").attrib["d"]
favicon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" role="img" aria-labelledby="title">
  <title id="title">La Plata Marketing</title>
  <svg x="0" y="188.11" width="1080" height="703.78" viewBox="0 0 1154 752">
    <path fill="{WHITE}" fill-rule="evenodd" d="{path}"/>
  </svg>
</svg>
'''
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.with_suffix(".svg").write_text(favicon, encoding="utf-8")
rendered = subprocess.run(
    ["node", "--input-type=module", "-e",
     "import sharp from 'sharp'; process.stdout.write(await sharp(process.argv[1]).resize(1080, 1080).png().toBuffer());",
     str(OUTPUT.with_suffix(".svg"))],
    cwd=ROOT, check=True, capture_output=True,
)
image = Image.open(BytesIO(rendered.stdout)).convert("RGBA")
image.save(OUTPUT, format="ICO", sizes=SIZES, bitmap_format="png")
print(f"Generated {OUTPUT} and favicon.svg from the official LPM assets")
