# zarondo.com

The Zarondo Games website, served by GitHub Pages at https://zarondo.com. GitHub Pages
builds it with Jekyll, so every page shares one header and footer.

- `_layouts/default.html` is the page shell; `_includes/` holds the header, the footer
  (with the social icons) and the Steam button.
- `index.html` is the home page, which is the Ebens Puffoonery page.
- `about.html`, `privacy.html` and `terms.html` are the other pages.
- `style.css` styles every page; `assets/site.js` is the movement: the studio logo building
  itself as the game's splash does, the game logo's wobble, the key art's depth, and sections
  bouncing in.
- `assets/` holds the studio logo, icons, link preview picture and the Quicksand font (the
  TTF is the master; the WOFF2 the pages load is cut from it with fontTools' `pyftsubset`);
  `assets/puffoonery/` holds the game's logo and key art.
- `CNAME` tells GitHub Pages which domain to serve.

**Page day:** put the Steam store link in `steam_url` in `_config.yml`. Every "Coming soon
to Steam" turns into a Wishlist on Steam button.

**Previewing:** the `site` entry in `.claude/launch.json` runs GitHub Pages' version of Jekyll
in Docker at http://localhost:4000. The first time, install the gems into the Docker volume:

```
docker run --rm -v zarondo-jekyll-gems:/usr/local/bundle ruby:3.3-slim sh -c "apt-get update && apt-get install -y build-essential && gem install github-pages webrick --no-document"
```

The studio logo files are generated in the game repository, under
`docs/concept-art/brand/studio`. The game's logo and key art come from
`docs/concept-art/brand` there, resized to WebP. Copy new versions from there; do not edit
them here.

The social icons are from Simple Icons (simpleicons.org), released under CC0.
Quicksand is under the SIL Open Font Licence; see `assets/quicksand-licence.txt`.
