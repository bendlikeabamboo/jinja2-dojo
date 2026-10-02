import { NAMES, CITIES, NOUNS } from '../../game/pools.js'

export const MC_PROMPT = 'What does this render?'

// Assemble an MC core: expected + up to 3 unique non-expected distractors.
// Choices arrive unshuffled; engine.generateRound is the single shuffle authority.
// Fallbacks stay plausible, never garbage.
export function mcCore(rng, { category, difficulty, template, context, expected, distractors, explain, prompt }) {
  const seen = new Set([expected])
  const picks = []
  for (const d of distractors) {
    if (picks.length === 3) break
    if (!seen.has(d)) {
      seen.add(d)
      picks.push(d)
    }
  }
  const fallbacks = [
    expected.toUpperCase(),
    expected.toLowerCase(),
    expected.replace(/ /g, '  '),
    expected + ' ',
    expected + '  ',
    expected + '   ',
  ]
  for (const fb of fallbacks) {
    if (picks.length === 3) break
    if (!seen.has(fb)) {
      seen.add(fb)
      picks.push(fb)
    }
  }
  let extra = 4
  while (picks.length < 3) picks.push(expected + ' '.repeat(extra++))
  return {
    category,
    difficulty,
    template,
    context,
    prompt: prompt ?? MC_PROMPT,
    choices: [expected, ...picks],
    expected,
    explain,
  }
}

export function typedCore({ category, difficulty, template, context, expected, accept, explain }) {
  return {
    category,
    difficulty,
    template,
    context,
    prompt: 'Type the exact rendered output',
    expected,
    accept,
    explain,
  }
}

// Per-module render: stamp the module's category id onto every core.
export const makeRender = (categoryId) => (rng, kind, core) =>
  kind === 'mc' ? mcCore(rng, { ...core, category: categoryId }) : typedCore({ ...core, category: categoryId })

// Auto-collect generators from a module namespace. Plain gen* named exports
// matching /^gen[A-Z]/ (functions only) — no hand-maintained arrays. Spec
// guarantees namespace string keys in ascending code-unit order, so collection
// order is deterministic (alphabetical) in Node, vitest, and Vite alike.
export function collectGenerators(ns) {
  return Object.entries(ns)
    .filter(([key, value]) => /^gen[A-Z]/.test(key) && typeof value === 'function')
    .map(([, value]) => value)
}

export const nameOf = (rng) => rng.pick(NAMES)
export const cityOf = (rng) => rng.pick(CITIES)
export const nounOf = (rng) => rng.pick(NOUNS)

export function words(rng, n) {
  const out = []
  while (out.length < n) {
    const w = rng.pick(NOUNS)
    if (!out.includes(w)) out.push(w)
  }
  return out
}

// Jinja title filter: uppercase first letter of every word, rest untouched.
// (Jinja does NOT lowercase the remainder — classic gotcha vs Python's title().)
// Pools are single lowercase words, so the whitespace-split mirror is exact.
export function jinjaTitle(s) {
  return s.replace(/(^|\s)(\S)/g, (_, sp, c) => sp + c.toUpperCase())
}
