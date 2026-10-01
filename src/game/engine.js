import { Rng, seedHex } from './rng.js'

// Core: { category, difficulty, template, context, prompt,
//         choices?, expected, accept?, explain }
// Engine wraps a core into a full Round with seed + shuffled MC layout.

export function generateRound(category, generators, seed, kind) {
  const rng = new Rng(seed)
  const gen = rng.pick(generators)
  const core = gen(rng, kind)
  const round = {
    seed,
    seedLabel: seedHex(seed),
    kind,
    category,
    difficulty: core.difficulty,
    template: core.template,
    context: core.context ?? {},
    prompt: core.prompt,
    expected: core.expected,
    accept: core.accept,
    explain: core.explain,
  }
  if (kind === 'mc') {
    const shuffled = rng.shuffle(core.choices)
    round.choices = shuffled
    round.correctIndex = shuffled.indexOf(core.expected)
  }
  return round
}

export function normalizeText(s) {
  return String(s).replace(/\r\n?/g, '\n').replace(/\s+/g, ' ').trim()
}

export function gradeTyped(round, answer) {
  const norm = normalizeText(answer)
  if (norm === normalizeText(round.expected)) return true
  if (round.accept) {
    for (const variant of round.accept) {
      if (norm === normalizeText(variant)) return true
    }
  }
  return false
}

export const TYPED_RATIO = 0.27

export function pickKind(rng) {
  return rng.chance(TYPED_RATIO) ? 'typed' : 'mc'
}

export function scoreAnswer(correct, ms, streakAfterCorrect) {
  if (!correct) return 0
  let gained = 100
  gained += Math.min(streakAfterCorrect * 10, 100)
  if (ms < 5000) gained += 50
  return gained
}
