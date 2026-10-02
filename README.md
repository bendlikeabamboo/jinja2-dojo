# jinja2-dojo

Full client-side Jinja2 drill game. Predict-the-output rounds (multiple choice +
typed answers) across self-describing categories — filters, control flow, tests
and operators, built-in globals, whitespace control — plus a mixed mode. Strict
black-and-white, keyboard-first, no servers, no web fonts, no images.

## Play

Shipped on GitHub Pages at `/jinja2-dojo/`. Keys: number keys pick a drill
(mixed is the last one) · `1-4` answer ·
`Enter` submit (typed rounds) · `Space` next · `t` toggle light/dark · `q` home ·
`r` reset stats (press twice).

## Develop

```sh
pnpm install
pnpm dev        # vite dev server
pnpm test       # vitest generator-invariant harness (200 seeded rounds per generator)
pnpm build      # production build to dist/
```

Stack: Vite + Preact + @preact/signals. Round answers are computed by generator JS
mirroring Jinja 3.x semantics — no Jinja engine in the browser. Deploy is a static
GitHub Pages workflow (`.github/workflows/deploy.yml`), runs tests + build on push
to `main`.

## Extending

Generators auto-collect — there is no hand-maintained list to forget.

**Add a generator:** export a plain `genFoo(rng, kind)` function from the matching
`src/data/generators/<id>.js`, building its round with the file's `render(rng, kind, {...})`
closure (created once via `makeRender(CATEGORY.id)`). Any named export matching
`/^gen[A-Z]/` is picked up automatically; nothing else to register.

**Add a category:** create `src/data/generators/<id>.js` exporting
`CATEGORY = { id, label, desc }` next to its `gen*` functions, then add one
namespace import and one `MODULES` entry in `src/data/registry.js` (the single
index). Module order there drives the home grid and the `1`–`n` drill keys;
mixed mode is always the next key, and keyboard hints follow automatically.
Single-digit keys cap at 9 categories — a known, documented limit.
