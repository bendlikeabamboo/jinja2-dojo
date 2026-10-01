const KEY = 'jinja2-dojo:v1'

export function emptyStats() {
  return { rounds: 0, score: 0, bestStreak: 0, categories: {} }
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyStats()
    const parsed = JSON.parse(raw)
    return { ...emptyStats(), ...parsed, categories: { ...parsed.categories } }
  } catch {
    return emptyStats()
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats))
  } catch {
    /* private mode etc — stats just won't persist */
  }
}

export function clearStats() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function record(stats, catId, correct, gained, streak) {
  stats.rounds++
  const cat = (stats.categories[catId] ??= { attempts: 0, correct: 0 })
  cat.attempts++
  if (correct) {
    cat.correct++
    stats.score += gained
  }
  if (streak > stats.bestStreak) stats.bestStreak = streak
  return stats
}
