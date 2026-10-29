// The site's movement: the studio logo building itself, the game logo's wobble, the
// key art's depth, and sections that bounce in as they scroll into view.

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

// The logo wobbles as the mouse comes on, and settles with a smaller wobble as it
// goes off. Each always plays to the end; one asked for mid-wobble waits its turn.
function startWobble(heading) {
  let playing = null;
  let next = null;
  function play(kind) {
    if (playing) {
      next = kind;
      return;
    }
    playing = kind;
    heading.classList.add(kind);
  }
  heading.addEventListener("mouseenter", () => play("wobble"));
  heading.addEventListener("mouseleave", () => play("settle"));
  heading.addEventListener("animationend", (event) => {
    if (event.target !== heading) return;
    heading.classList.remove(playing);
    playing = null;
    if (next) {
      const kind = next;
      next = null;
      requestAnimationFrame(() => play(kind));
    }
  });
}

// A section comes in once its top is near the bottom of the screen. Sections
// already scrolled past (after a reload, say) come in straight away.
function startReveals(sections) {
  let waiting = [...sections];
  waiting.forEach((section, i) => {
    if (section.classList.contains("feature")) section.style.transitionDelay = `${(i % 4) * 90}ms`;
  });

  function check() {
    waiting = waiting.filter((section) => {
      if (section.getBoundingClientRect().top > innerHeight * 0.9) return true;
      section.classList.add("in");
      // The stagger is only for coming in.
      setTimeout(() => { section.style.transitionDelay = ""; }, 1000);
      return false;
    });
    if (!waiting.length) {
      removeEventListener("scroll", check);
      removeEventListener("resize", check);
    }
  }

  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  check();
}

// The key art (and the gameplay over it) moves a little slower than the page, for a
// bit of depth.
function startParallax(layers) {
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const shift = `translateY(${Math.min(scrollY, innerHeight) * 0.3}px)`;
      layers.forEach((layer) => { layer.style.transform = shift; });
      ticking = false;
    });
  }, { passive: true });
}

// The gameplay loop plays over the key art on landscape screens, unless the visitor
// asked to save data. It fades in once it's actually playing, so a slow load just
// shows the key art, and it rests while the hero is scrolled out of sight.
function startGameplay(video) {
  if (matchMedia("(max-aspect-ratio: 4/5)").matches) return;
  if (navigator.connection?.saveData) return;
  video.addEventListener("playing", () => video.classList.add("playing"), { once: true });
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }).observe(video);
}

// The studio logo builds itself when the site is first opened or the page is
// refreshed (not on every click between its pages), as the game's splash does
// (View/StudioSplash.cs in the game, without its sound): the Z starts as two code
// tags, < and >, that reshape and lock into it with a few sparks and a glint; the
// ring's arcs comet round into place; then the icon glides left as "Zarondo" is
// uncovered after it and "Games" fades in. The times, points and easings are the
// game's, in the logo drawing's own units (480 across, the icon's group y down).
// With the mouse on it afterwards, the ring spins round once and the Z glints.
function startSplash(link) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = link.querySelector(".studio-logo");
  const icon = svg.querySelector(".icon");
  const staticZ = svg.querySelector(".z");
  const words = svg.querySelector(".words");
  const zarondo = svg.querySelector(".zarondo");
  const games = svg.querySelector(".games");
  const wipe = svg.querySelector("#studio-wipe rect");
  const cream = "#F6F3EC";

  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    parent.append(el);
    return el;
  };
  const clamp = (k) => Math.min(Math.max(k, 0), 1);
  const between = (a, b, t) => clamp((t - a) / (b - a));
  const ease = (k) => k * k * (3 - 2 * k);
  const out = (k) => 1 - (1 - k) ** 3;
  const inOut = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

  // The timeline, in seconds.
  const lessIn = 0.1, moreIn = 0.16, lessLocks = 0.8, moreLocks = 0.95, tagGrow = 0.25;
  const lessFrom = 0.45, moreFrom = 0.58, glintFrom = 1.05, glintEnd = 1.4;
  const arcsFrom = 1, arcsEnd = 1.8, glideFrom = 1.85, glideEnd = 2.45, gamesFrom = 2.47, gamesEnd = 2.77;

  // Each tag as an end, a point and an end, and the same three as its half of the Z.
  const lessTag = [[50, 45], [31, 60], [50, 75]], lessZ = [[53.3, 65.3], [36, 79], [76, 79]];
  const moreTag = [[70, 45], [89, 60], [70, 75]], moreZ = [[44, 41], [84, 41], [66.7, 54.7]];

  // The ring: each arc's fill starts 15 degrees before its yellow end and grows
  // anticlockwise over 0.42 of a turn, while the arc turns clockwise into place from
  // 140 degrees round. Its colour runs yellow, rose, blue.
  const arcs = [...svg.querySelectorAll(".arc")].map((group, i) => ({
    group,
    origin: i === 0 ? 60 : 240,
    ends: group.querySelectorAll("circle"),
    slices: [...group.querySelectorAll("path")],
    head: make("circle", { r: 5.5 }, group),
  }));
  const swept = (t) => {
    const k = between(arcsFrom, arcsEnd, t);
    return k + 0.35 * k * (1 - k);
  };
  const shade = (f) => {
    const yellow = [255, 193, 2], rose = [255, 64, 108], blue = [38, 132, 255];
    const c = f < 0.48 ? mix(yellow, rose, f / 0.48) : mix(rose, blue, (f - 0.48) / 0.52);
    return `rgb(${c.map(Math.round).join(" ")})`;
  };
  const onRing = (degrees) => [60 + 46 * Math.cos((degrees * Math.PI) / 180), 60 - 46 * Math.sin((degrees * Math.PI) / 180)];

  // The moving parts, made on the first play: the tags' four arms, the glint at the
  // tip of the Z's top bar, and the sparks (behind everything, so they peel away).
  let arms, glint, sparks;
  function build() {
    const sparkLayer = make("g", {}, icon);
    icon.prepend(sparkLayer);
    arms = [0, 1, 2, 3].map(() => make("line", { stroke: cream, "stroke-linecap": "round" }, icon));
    glint = make("g", { fill: "white" }, icon);
    make("path", { d: "M0-13L1.6-1.6L13 0L1.6 1.6L0 13L-1.6 1.6L-13 0L-1.6-1.6Z" }, glint);
    make("circle", { r: 3.7 }, glint);
    // Fixed random numbers, so every showing is the same.
    let seed = 151;
    const random = (a, b) => {
      seed = (seed * 16807) % 2147483647;
      return a + ((seed - 1) / 2147483646) * (b - a);
    };
    sparks = [];
    for (const [born, at] of [[lessLocks, lessZ[0]], [moreLocks, moreZ[2]]]) {
      for (let i = 0; i < 8; i++) {
        const angle = random(0, Math.PI * 2), speed = random(70, 122);
        const length = random(6, 9.6), thick = random(1.75, 2.2);
        sparks.push({
          born, at, life: random(0.2, 0.32), v: [Math.cos(angle) * speed, Math.sin(angle) * speed],
          el: make("rect", { x: -length / 2, y: -thick / 2, width: length, height: thick, rx: thick / 2, fill: cream }, sparkLayer),
        });
      }
    }
  }

  function tag(first, from, to, t, growsAt, reshapes, locks) {
    const grow = out(between(growsAt, growsAt + tagGrow, t));
    const point = inOut(between(reshapes, locks - 0.06, t));
    const ends = inOut(between(reshapes + 0.06, locks, t));
    const middle = [0, 1].map((k) => (from[0][k] + from[1][k] + from[2][k]) / 3);
    const at = (i, k) => mix(from[i], to[i], k).map((v, j) => middle[j] + (v - middle[j]) * grow);
    const [a, tip, b] = [at(0, ends), at(1, point), at(2, ends)];
    [[a, tip], [tip, b]].forEach(([p, q], i) => {
      const arm = arms[first + i];
      arm.setAttribute("x1", p[0]); arm.setAttribute("y1", p[1]);
      arm.setAttribute("x2", q[0]); arm.setAttribute("y2", q[1]);
      arm.setAttribute("stroke-width", 11 * Math.max(grow, 0.01));
      arm.style.display = grow > 0 ? "" : "none";
    });
  }

  function pose(t) {
    tag(0, lessTag, lessZ, t, lessIn, lessFrom, lessLocks);
    tag(2, moreTag, moreZ, t, moreIn, moreFrom, moreLocks);

    const g = between(glintFrom, glintEnd, t), gs = Math.sin(g * Math.PI);
    glint.setAttribute("transform", `translate(84 41) rotate(${45 * g}) scale(${gs})`);
    glint.setAttribute("opacity", gs);

    for (const s of sparks) {
      const age = t - s.born, k = age / s.life;
      s.el.style.display = k >= 0 && k < 1 ? "" : "none";
      if (k < 0 || k >= 1) continue;
      const x = s.at[0] + s.v[0] * age * (1 - 0.5 * k), y = s.at[1] + s.v[1] * age * (1 - 0.5 * k);
      const turn = (Math.atan2(s.v[1], s.v[0]) * 180) / Math.PI;
      s.el.setAttribute("transform", `translate(${x} ${y}) rotate(${turn}) scale(${0.4 + 0.6 * (1 - k)} ${1 - 0.5 * k})`);
      s.el.setAttribute("opacity", 0.9 * (1 - k) ** 1.4);
    }

    const done = t >= arcsEnd, sweep = swept(t);
    const grown = 151.2 * sweep, turned = 140 * (1 - sweep);
    for (const arc of arcs) {
      arc.group.setAttribute("transform", done ? "" : `rotate(${-turned} 60 60)`);
      arc.slices.forEach((slice, i) => { slice.style.display = done || grown >= 15 + 2.5 * (i + 1) ? "" : "none"; });
      arc.ends[0].style.display = done || grown >= 10 ? "" : "none";
      arc.ends[1].style.display = done || grown >= 135 ? "" : "none";
      // The trailing end of the growing arc is rounded off with a dot of its colour.
      const reach = Math.min(grown, 135);
      const [hx, hy] = onRing(arc.origin + reach);
      arc.head.setAttribute("cx", hx);
      arc.head.setAttribute("cy", hy);
      arc.head.setAttribute("fill", shade(clamp((reach - 15) / 120)));
      arc.head.style.display = t > arcsFrom && !done && reach > 15 && grown < 143 ? "" : "none";
    }

    // The icon starts in the middle of the logo and glides to its place; the words
    // travel with it, uncovered from its right edge by a wipe moving right.
    const away = 172 * (1 - ease(between(glideFrom, glideEnd, t)));
    icon.setAttribute("transform", `translate(${8 + away} 8)`);
    const edge = 68 + away + 63;
    wipe.setAttribute("x", edge);
    wipe.setAttribute("width", 349 * out(between(glideFrom + 0.05, glideEnd, t)));
    const drift = 26.2 * (1 - out(between(glideFrom, glideEnd + 0.1, t)));
    zarondo.setAttribute("transform", `translate(${away - drift} 0)`);
    games.setAttribute("transform", `translate(${away} 0)`);
    games.setAttribute("opacity", ease(between(gamesFrom, gamesEnd, t)));
  }

  function rest() {
    staticZ.style.display = "";
    for (const el of [...arms, glint, ...sparks.map((s) => s.el), ...arcs.map((a) => a.head)]) el.style.display = "none";
    for (const arc of arcs) {
      arc.group.removeAttribute("transform");
      [...arc.slices, ...arc.ends].forEach((el) => { el.style.display = ""; });
    }
    icon.setAttribute("transform", "translate(8,8)");
    words.removeAttribute("clip-path");
    zarondo.removeAttribute("transform");
    games.removeAttribute("transform");
    games.removeAttribute("opacity");
  }

  let playing = false;
  function play() {
    if (playing) return;
    playing = true;
    svg.classList.add("ready");
    staticZ.style.display = "none";
    glint.style.display = "";
    words.setAttribute("clip-path", "url(#studio-wipe)");
    const start = performance.now();
    const frame = (now) => {
      const t = (now - start) / 1000;
      if (t >= gamesEnd) {
        rest();
        playing = false;
        return;
      }
      pose(t);
      requestAnimationFrame(frame);
    };
    pose(0);
    requestAnimationFrame(frame);
  }

  // The hover: both arcs spin one turn clockwise, easing in and out, as the glint
  // grows and fades at the tip of the Z's top bar.
  function spin() {
    if (playing) return;
    playing = true;
    glint.style.display = "";
    const start = performance.now();
    const frame = (now) => {
      const k = Math.min((now - start) / 900, 1);
      const turn = 360 * inOut(k);
      for (const arc of arcs) arc.group.setAttribute("transform", k < 1 ? `rotate(${turn} 60 60)` : "");
      const g = between(0.15, 0.75, k), gs = Math.sin(g * Math.PI);
      glint.setAttribute("transform", `translate(84 41) rotate(${45 * g}) scale(${gs})`);
      glint.setAttribute("opacity", gs);
      if (k < 1) {
        requestAnimationFrame(frame);
        return;
      }
      glint.style.display = "none";
      playing = false;
    };
    requestAnimationFrame(frame);
  }

  build();
  rest();
  link.addEventListener("mouseenter", spin);
  link.addEventListener("focus", spin);
  if (freshLoad()) play();
  else svg.classList.add("ready");
}

// A refresh, or arriving from somewhere else; not a click from another of our own
// pages, or going back and forward.
function freshLoad() {
  const how = performance.getEntriesByType("navigation")[0]?.type;
  if (how === "reload") return true;
  if (how === "back_forward") return false;
  try {
    return !document.referrer || new URL(document.referrer).origin !== location.origin;
  } catch {
    return true;
  }
}

const studio = document.querySelector(".studio");
const heading = document.querySelector(".hero h1");
const art = document.querySelector(".hero-art");
const gameplay = document.querySelector(".hero-video");
if (studio && !calm) startSplash(studio);
else studio?.querySelector(".studio-logo").classList.add("ready");
if (heading && !calm) startWobble(heading);
if (art && !calm) startParallax([art, gameplay].filter(Boolean));
if (gameplay && !calm) startGameplay(gameplay);
startReveals(document.querySelectorAll(".reveal"));
