import { CATEGORIES } from '../data/categories.js'
import { startCategory, requestReset, cancelReset, stats, confirmingReset } from '../game/store.js'

function accuracy(catStats) {
  if (!catStats || catStats.attempts === 0) return '--'
  return Math.round((catStats.correct / catStats.attempts) * 100) + '%'
}

export function Home() {
  const s = stats.value
  return (
    <main>
      <div class="home-head">
        <p class="spec">DRILL SHEET // JINJA 3.X // LOCAL ONLY</p>
        <h1 class="home-title caret">JINJA2 DOJO</h1>
      </div>
      <ul class="cat-grid">
        {CATEGORIES.map((c, i) => {
          const cs = s.categories[c.id]
          return (
            <li key={c.id}>
              <button class="sheet" onClick={() => startCategory(c.id)}>
                <span class="cat-key">[{i + 1}]</span>
                <span class="cat-label">{c.label}</span>
                <span class="cat-desc">
                  {c.desc}
                  <br />
                  {`ACC ${accuracy(cs)} // ${cs?.attempts ?? 0} ROUNDS`}
                </span>
              </button>
            </li>
          )
        })}
        <li>
          <button class="sheet" onClick={() => startCategory('mixed')}>
            <span class="cat-key">[6]</span>
            <span class="cat-label">Mixed</span>
            <span class="cat-desc">
              weighted draw from all five
              <br />
              {`ACC ${accuracy(s.categories.mixed) || '--'} // GRADED INTO CATEGORIES`}
            </span>
          </button>
        </li>
      </ul>
      <div class="stats-foot spec">
        <span>
          ROUNDS <strong>{s.rounds}</strong>
        </span>
        <span>
          SCORE <strong>{s.score}</strong>
        </span>
        <span>
          BEST STREAK <strong>{s.bestStreak}</strong>
        </span>
        {confirmingReset.value ? (
          <>
            <span class="stat-error">ERASE ALL STATS?</span>
            <button onClick={requestReset}>r // yes</button>
            <button onClick={cancelReset}>esc // no</button>
          </>
        ) : (
          <button onClick={requestReset}>r // reset stats</button>
        )}
      </div>
    </main>
  )
}
