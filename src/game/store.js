import { signal } from '@preact/signals'
import { Rng } from './rng.js'
import { loadStats, saveStats, clearStats, record, emptyStats } from './stats.js'
import { generateRound, pickKind, gradeTyped, scoreAnswer } from './engine.js'
import { CATEGORIES } from '../data/categories.js'
import { REGISTRY } from '../data/registry.js'

// ---- theme ------------------------------------------------------------------

export const theme = signal(
  typeof localStorage !== 'undefined' && localStorage.getItem('jinja2-dojo:theme') === 'light' ? 'light' : 'dark',
)

export function applyTheme() {
  document.documentElement.dataset.theme = theme.value
}

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme()
  try {
    localStorage.setItem('jinja2-dojo:theme', theme.value)
  } catch {
    /* ignore */
  }
}

// ---- session state ------------------------------------------------------------

export const view = signal('home')
export const catId = signal(null) // category id or 'mixed'
export const round = signal(null)
export const roundNo = signal(0)
export const score = signal(0)
export const streak = signal(0)
export const feedback = signal(null) // { correct, gained, expected }
export const stats = signal(loadStats())
export const confirmingReset = signal(false)

let sessionRng = new Rng((Math.random() * 0xffffffff) >>> 0)
let roundStart = 0

function pickCategoryId() {
  if (catId.value !== 'mixed') return catId.value
  return sessionRng.pick(CATEGORIES).id
}

export function startCategory(id) {
  catId.value = id
  roundNo.value = 0
  score.value = 0
  streak.value = 0
  confirmingReset.value = false
  view.value = 'round'
  nextRound()
}

export function nextRound() {
  const id = pickCategoryId()
  const seed = (Math.random() * 0xffffffff) >>> 0
  const kind = pickKind(sessionRng)
  round.value = generateRound(id, REGISTRY[id], seed, kind)
  roundNo.value++
  feedback.value = null
  roundStart = Date.now()
}

function settle(correct, chosen = null) {
  const ms = Date.now() - roundStart
  const nextStreak = correct ? streak.value + 1 : 0
  const gained = correct ? scoreAnswer(true, ms, nextStreak) : 0
  streak.value = nextStreak
  score.value += gained
  const s = stats.value
  record(s, round.value.category, correct, gained, nextStreak)
  stats.value = { ...s, categories: { ...s.categories } }
  saveStats(s)
  feedback.value = { correct, gained, expected: round.value.expected, chosen }
}

export function answerMc(index) {
  if (!round.value || feedback.value || round.value.kind !== 'mc') return
  settle(index === round.value.correctIndex, index)
}

export function submitTyped(text) {
  if (!round.value || feedback.value || round.value.kind !== 'typed') return
  settle(gradeTyped(round.value, text))
}

export function goHome() {
  view.value = 'home'
  confirmingReset.value = false
}

export function requestReset() {
  if (confirmingReset.value) {
    clearStats()
    stats.value = emptyStats()
    confirmingReset.value = false
  } else {
    confirmingReset.value = true
  }
}

export function cancelReset() {
  confirmingReset.value = false
}
