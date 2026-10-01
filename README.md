# jinja2-dojo

Full client-side Jinja2 drill game. Predict-the-output rounds (multiple choice +
typed answers) across five categories: filters, control flow, tests and operators,
built-in globals, whitespace control. Strict black-and-white, keyboard-first, no
servers, no web fonts, no images.

## Play

Shipped on GitHub Pages at `/jinja2-dojo/`. Keys: `1-6` pick a drill · `1-4` answer ·
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
