import { useEffect } from 'preact/hooks'
import { CATEGORIES } from './data/registry.js'
import {
  view,
  round,
  feedback,
  roundNo,
  score,
  streak,
  catId,
  theme,
  applyTheme,
  toggleTheme,
  startCategory,
  nextRound,
  answerMc,
  goHome,
  requestReset,
  cancelReset,
} from './game/store.js'
import { Statusline } from './components/Statusline.jsx'
import { HintBar } from './components/HintBar.jsx'
import { Home } from './components/Home.jsx'
import { RoundView } from './components/RoundView.jsx'

applyTheme()

function useKeyboard() {
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target && e.target.tagName === 'INPUT') return // typed input owns its keys
      const k = e.key
      if (k === 't') {
        toggleTheme()
        return
      }
      if (view.value === 'home') {
        if (k >= '1' && k <= String(CATEGORIES.length)) startCategory(CATEGORIES[Number(k) - 1].id)
        else if (k === String(CATEGORIES.length + 1)) startCategory('mixed')
        else if (k === 'r') requestReset()
        else if (k === 'Escape') cancelReset()
        return
      }
      if (k === 'q' || k === 'Escape') {
        goHome()
        return
      }
      if (feedback.value) {
        if (k === ' ' || k === 'Enter' || (k >= '1' && k <= '4')) {
          e.preventDefault()
          nextRound()
        }
        return
      }
      if (round.value.kind === 'mc' && k >= '1' && k <= '4') {
        e.preventDefault()
        answerMc(Number(k) - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function hints() {
  if (view.value === 'home') {
    return [
      ['1-' + (CATEGORIES.length + 1), 'drill'],
      ['t', 'theme'],
      ['r', 'reset'],
    ]
  }
  if (feedback.value) {
    return [
      ['space', 'next'],
      ['1-4', 'skip ahead'],
      ['q', 'home'],
      ['t', 'theme'],
    ]
  }
  if (round.value.kind === 'mc') {
    return [
      ['1-4', 'answer'],
      ['q', 'home'],
      ['t', 'theme'],
    ]
  }
  return [
    ['type', 'exact output'],
    ['enter', 'submit'],
    ['esc', 'home'],
    ['t', 'theme'],
  ]
}

export function App() {
  useKeyboard()
  const isRound = view.value === 'round'
  const fb = feedback.value
  const mode = !isRound ? 'HOME' : fb ? 'RESULT' : round.value.kind === 'typed' ? 'INPUT' : 'SELECT'
  const catLabel = isRound ? (catId.value === 'mixed' ? 'MIXED' : CATEGORIES.find((c) => c.id === catId.value)?.label.toUpperCase() ?? '') : 'LOBBY'
  return (
    <div class="board">
      <Statusline mode={mode} category={catLabel} roundNo={isRound ? roundNo.value : null} score={isRound ? score.value : 0} streak={isRound ? streak.value : 0} />
      {isRound ? <RoundView /> : <Home />}
      <HintBar hints={hints()} />
    </div>
  )
}
