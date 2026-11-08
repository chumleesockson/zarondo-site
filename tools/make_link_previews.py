"""Makes the link preview pictures for the About, press kit, privacy, terms and data deletion
pages: the picture Facebook, X, Bluesky, Discord, WhatsApp and the rest show when someone
shares the page. Each is 1200x630 and goes in assets/link-previews/.

Run from the site's folder after the photo, the art, the screenshots or a page's wording
changes:
    python tools/make_link_previews.py .
Each picture is laid out as a small web page in the site's font and colours, and Chrome,
running without a window, saves it as a picture.

The home page's picture (assets/puffoonery/link-preview.jpg, the key art with the logo)
comes from the game's brand art and isn't made here.
"""
import subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

site = Path(sys.argv[1]).resolve()
game = Path(r"C:\games\menlarger")
chrome = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
out = site / "assets/link-previews"
W, H = 1200, 630

def uri(p: Path) -> str:
    return p.resolve().as_uri()

font = uri(site / "assets/quicksand-variable.ttf")
studio_logo = uri(site / "assets/press/art/zarondo-games-logo-for-dark.png")
game_logo = uri(site / "assets/press/art/ebens-puffoonery-logo.png")
photo = uri(site / "assets/press/art/charlie-sexton.jpg")
shots = site / "assets/press/screenshots"
# The game's own peeking Eben, at full size (the site's copy is cut down for the menu).
eben = uri(game / "game/Assets/Art/UI/Part_EbenPeek.png")

BASE = f"""
@font-face {{ font-family: Quicksand; src: url("{font}") format("truetype"); font-weight: 300 700; }}
html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; }}
body {{
  position: relative;
  background: radial-gradient(circle at 76% 45%, #26316B 0%, #141B3A 52%, #0D1229 100%);
  color: #F6F3EC;
  font-family: Quicksand, sans-serif;
  font-weight: 500;
}}
.logo {{ position: absolute; left: 72px; top: 62px; width: 290px; }}
.text {{ position: absolute; left: 72px; top: 205px; width: 590px; }}
h1 {{ margin: 0; font-size: 92px; font-weight: 700; line-height: 1.05; color: #FFC400; }}
p {{ margin: 26px 0 0; font-size: 34px; line-height: 1.35; }}
.site {{ position: absolute; left: 72px; bottom: 54px; font-size: 26px; font-weight: 700; color: #B9BDD0; }}
"""

# A paper page on the right, with the Eben peeking over its top, for the legal pages.
DOC = """
.doc {
  position: absolute; left: 760px; top: 190px; width: 330px; height: 400px;
  padding: 44px 40px; box-sizing: border-box;
  background: #F6F3EC; border-radius: 30px;
  box-shadow: 0 22px 44px rgb(0 0 0 / 0.45);
  rotate: 4deg;
}
.doc i { display: block; height: 16px; margin-bottom: 22px; border-radius: 8px; background: rgb(20 27 58 / 0.16); }
.doc i:first-child { height: 26px; width: 62%; margin-bottom: 34px; background: var(--accent); }
.eben { position: absolute; left: 905px; top: 34px; width: 190px; rotate: 14deg; }
"""

def legal(title: str, line: str, accent: str, path: str) -> str:
    widths = [62, 100, 92, 100, 74, 100, 86, 58]
    lines = "".join(f'<i style="width:{w}%"></i>' for w in widths)
    return f"""<style>{BASE}{DOC} body {{ --accent: {accent}; }}</style>
<img class="logo" src="{studio_logo}" alt="">
<div class="text"><h1>{title}</h1><p>{line}</p></div>
<div class="site">zarondo.com/{path}</div>
<img class="eben" src="{eben}" alt="">
<div class="doc">{lines}</div>"""

pages = {
    # As on the About page: the photo, tilted, with the Eben peeking out from behind it.
    "about": f"""<style>{BASE}
.photo {{
  position: absolute; left: 650px; top: 118px; width: 380px; height: 380px; object-fit: cover;
  border: 10px solid #F6F3EC; border-radius: 40px;
  box-shadow: 0 22px 44px rgb(0 0 0 / 0.45);
  rotate: -2deg;
}}
.eben {{ position: absolute; left: 985px; top: 190px; width: 150px; scale: -1 1; rotate: 10deg; }}
</style>
<img class="logo" src="{studio_logo}" alt="">
<div class="text"><h1>Hi, I'm Charlie.</h1><p>Zarondo Games is my studio. Ebens Puffoonery is coming to Steam.</p></div>
<div class="site">zarondo.com/about</div>
<img class="eben" src="{eben}" alt="">
<img class="photo" src="{photo}" alt="">""",

    # The game's logo, and the first three Steam screenshots fanned out.
    "press": f"""<style>{BASE}
.glogo {{ position: absolute; left: 60px; top: 40px; width: 330px; }}
.text {{ top: 245px; width: 520px; }}
.shot {{
  position: absolute; width: 470px; aspect-ratio: 16 / 9;
  border: 8px solid #F6F3EC; border-radius: 22px;
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.45);
}}
.s1 {{ left: 640px; top: 44px; rotate: -5deg; }}
.s2 {{ left: 680px; top: 186px; rotate: 3deg; }}
.s3 {{ left: 630px; top: 328px; rotate: -2deg; }}
</style>
<img class="glogo" src="{game_logo}" alt="">
<div class="text"><h1>Press kit</h1><p>Facts, screenshots, logos and key art.</p></div>
<div class="site">zarondo.com/press</div>
<img class="shot s1" src="{uri(shots / 'ebens-puffoonery-02-mars-ram.jpg')}" alt="">
<img class="shot s2" src="{uri(shots / 'ebens-puffoonery-03-snow-snowball.jpg')}" alt="">
<img class="shot s3" src="{uri(shots / 'ebens-puffoonery-01-funfair-players-view.jpg')}" alt="">""",

    "privacy": legal("Privacy", "What we collect, why, and what you can ask us to do with it.", "#2FC6B4", "privacy"),
    "terms": legal("Terms", "For our website, our social media and the tools we run them with.", "#A77BE8", "terms"),
    "data-deletion": legal("Deleting your data", "It takes one email.", "#EC3F7C", "data-deletion"),
}

out.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    for name, body in pages.items():
        html = tmp / f"{name}.html"
        html.write_text(f'<!doctype html><meta charset="utf-8">{body}', encoding="utf-8")
        png = tmp / f"{name}.png"
        subprocess.run([
            str(chrome), "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--force-device-scale-factor=1", f"--window-size={W},{H}",
            f"--user-data-dir={tmp / 'chrome'}", "--allow-file-access-from-files",
            "--virtual-time-budget=5000", f"--screenshot={png}", html.as_uri(),
        ], check=True, capture_output=True)
        im = Image.open(png).convert("RGB").crop((0, 0, W, H))
        im.save(out / f"{name}.jpg", "JPEG", quality=88, optimize=True, progressive=True)
        print(name, im.size, (out / f"{name}.jpg").stat().st_size // 1024, "KB")
