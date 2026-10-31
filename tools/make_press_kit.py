"""Builds assets/press/ for the press kit page (press.html): the full-size downloads, the
small previews the page shows, and one zip of everything.

Run from the site's folder after the screenshots or brand art change:
    python tools/make_press_kit.py .
It reads the game repository and the Steam screenshots folder, and replaces assets/press/.
"""
import shutil, sys, zipfile
from pathlib import Path
from PIL import Image

site = Path(sys.argv[1])
game = Path(r"C:\games\menlarger")
shots = Path(r"C:\games\builds\steam-screenshots")
brand = game / "docs/concept-art/brand"
studio = brand / "studio/png"

out = site / "assets/press"
if out.exists():
    shutil.rmtree(out)
(out / "screenshots").mkdir(parents=True)
(out / "art").mkdir()
(out / "previews").mkdir()

def preview(src: Path, name: str, width: int):
    im = Image.open(src)
    im.thumbnail((width, width * 4), Image.LANCZOS)
    im.save(out / "previews" / f"{name}.webp", "WEBP", quality=82, method=6)
    return im.size

# Screenshots: copied as they are, 1920x1080 JPG.
for f in sorted(shots.glob("[0-9][0-9]-*.jpg")):
    name = "ebens-puffoonery-" + f.stem
    shutil.copy(f, out / "screenshots" / f"{name}.jpg")
    preview(f, name, 640)

# Logos keep their transparency as PNG; art goes to high-quality JPG.
art = [
    (brand / "logo.png", "ebens-puffoonery-logo", "png"),
    (brand / "logo-one-colour.png", "ebens-puffoonery-logo-one-colour", "png"),
    (brand / "app-icon.png", "ebens-puffoonery-icon", "png"),
    (brand / "capsule-wide.png", "ebens-puffoonery-key-art-wide", "jpg"),
    (brand / "capsule-tall.png", "ebens-puffoonery-key-art-tall", "jpg"),
    (game / "art/steam/out/library-hero.png", "ebens-puffoonery-banner", "jpg"),
    (studio / "logo-horizontal-games-2000.png", "zarondo-games-logo", "png"),
    (studio / "logo-horizontal-games-dark-2000.png", "zarondo-games-logo-for-dark", "png"),
    (studio / "icon-1024.png", "zarondo-games-icon", "png"),
    (site / "assets/about/charlie-sexton.webp", "charlie-sexton", "jpg"),
]
for src, name, kind in art:
    im = Image.open(src)
    if kind == "png":
        im.save(out / "art" / f"{name}.png", optimize=True)
    else:
        im.convert("RGB").save(out / "art" / f"{name}.jpg", "JPEG", quality=92, optimize=True)
    preview(src, name, 640)
    print(name, im.size)

with zipfile.ZipFile(out / "ebens-puffoonery-press-kit.zip", "w", zipfile.ZIP_STORED) as z:
    for folder, inside in (("screenshots", "Screenshots"), ("art", "Logos and art")):
        for f in sorted((out / folder).iterdir()):
            z.write(f, f"Ebens Puffoonery press kit/{inside}/{f.name}")

total = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
print(f"total {total / 1e6:.1f} MB, zip {(out / 'ebens-puffoonery-press-kit.zip').stat().st_size / 1e6:.1f} MB")
