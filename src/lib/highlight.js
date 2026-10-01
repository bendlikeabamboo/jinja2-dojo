// ~40-line grayscale Jinja2 tokenizer: template string → token classes.
// Distinction by weight/underline/opacity only (see .hl-* classes in base.css).

const KEYWORDS = new Set([
  'for', 'in', 'if', 'elif', 'else', 'is', 'not', 'and', 'or',
  'true', 'false', 'none', 'recursive', 'loop', 'endfor', 'endif',
])

const REGION = /\{\{-?[\s\S]*?-?\}\}|\{%-?[\s\S]*?-?%\}|\{#[\s\S]*?#\}/g

const INNER =
  /('[^']*'|"[^"]*")|(\b\d+(?:\.\d+)?\b)|(\|)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(~)|(\s+)|(.)/g

function classify(inner) {
  const out = []
  let expectTest = false
  let afterPipe = false
  let m
  INNER.lastIndex = 0
  while ((m = INNER.exec(inner)) !== null) {
    const [text, str, num, pipe, word, tilde, ws] = m
    if (str) out.push({ text: str, cls: 'hl-str' })
    else if (num) out.push({ text: num, cls: 'hl-num' })
    else if (pipe) { out.push({ text: pipe, cls: 'hl-delim' }); afterPipe = true }
    else if (word) {
      if (afterPipe) {
        out.push({ text: word, cls: 'hl-filt' })
        afterPipe = false
      } else if (expectTest && !KEYWORDS.has(word)) {
        out.push({ text: word, cls: 'hl-test' })
        expectTest = false
      } else if (word === 'is') {
        out.push({ text: word, cls: 'hl-kw' })
        expectTest = true
      } else {
        out.push({ text: word, cls: KEYWORDS.has(word) ? 'hl-kw' : null })
      }
    } else if (tilde) out.push({ text: tilde, cls: 'hl-delim' })
    else out.push({ text, cls: null })
  }
  return out
}

export function tokenize(template) {
  const tokens = []
  let last = 0
  let m
  REGION.lastIndex = 0
  while ((m = REGION.exec(template)) !== null) {
    if (m.index > last) tokens.push({ text: template.slice(last, m.index), cls: 'hl-text' })
    const region = m[0]
    if (region.startsWith('{#')) {
      tokens.push({ text: region, cls: 'hl-text' })
    } else {
      const openM = region.match(/^(\{\{-?|\{%-?|\{#)/)
      const closeM = region.match(/(-?\}\}|-?%\}|#)$/)
      const inner = region.slice(openM[0].length, region.length - closeM[0].length)
      tokens.push({ text: openM[0], cls: 'hl-delim' })
      tokens.push(...classify(inner))
      tokens.push({ text: closeM[0], cls: 'hl-delim' })
    }
    last = m.index + region.length
  }
  if (last < template.length) tokens.push({ text: template.slice(last), cls: 'hl-text' })
  return tokens
}
