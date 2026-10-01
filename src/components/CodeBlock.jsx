import { tokenize } from '../lib/highlight.js'

export function CodeBlock({ template }) {
  const tokens = tokenize(template)
  return (
    <pre class="codeblock">
      {tokens.map((t, i) =>
        t.cls ? (
          <span key={i} class={t.cls}>
            {t.text}
          </span>
        ) : (
          <span key={i}>{t.text}</span>
        ),
      )}
    </pre>
  )
}
