import { useEffect, useRef } from 'preact/hooks'
import { CATEGORIES } from '../data/categories.js'
import { round, feedback, roundNo, score, streak, catId, answerMc, submitTyped, nextRound } from '../game/store.js'
import { ctxLine, markEdges } from '../lib/display.js'
import { CodeBlock } from './CodeBlock.jsx'

function label(id) {
  if (id === 'mixed') return 'MIXED'
  return CATEGORIES.find((c) => c.id === id)?.label.toUpperCase() ?? id.toUpperCase()
}

function McOptions() {
  const r = round.value
  const fb = feedback.value
  return (
    <ol class="options">
      {r.choices.map((choice, i) => {
        let cls = ''
        if (fb) {
          if (i === r.correctIndex) cls = 'opt-correct'
          else if (i === fb.chosen) cls = 'opt-wrong'
        }
        return (
          <li key={i}>
            <button class={cls} disabled={!!fb} onClick={() => answerMc(i)}>
              <span class="opt-key">[{i + 1}]</span>
              <span>{markEdges(choice)}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function TypedInput() {  const ref = useRef(null)
  const fb = feedback.value
  useEffect(() => {
    if (!fb && ref.current) ref.current.focus()
  }, [fb])
  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitTyped(e.currentTarget.value)
    } else if (e.key === 'Escape') {
      e.currentTarget.blur()
    }
  }
  return (
    <input
      ref={ref}
      class="typed-input"
      type="text"
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
      placeholder="type exact output, Enter submits"
      disabled={!!fb}
      onKeyDown={onKey}
    />
  )
}

function Feedback() {
  const fb = feedback.value
  return (
    <p class={`feedback ${fb.correct ? 'flash-ok' : 'miss flash-miss'}`}>
      {fb.correct ? (
        <>
          <span class="verdict">OK // +{fb.gained}</span>
        </>
      ) : (
        <>
          <span class="verdict">MISS // expected:</span> {JSON.stringify(feedback.value.expected)}
        </>
      )}
      <span class="explain">// {round.value.explain}</span>
    </p>
  )
}

export function RoundView() {
  const r = round.value
  const fb = feedback.value
  return (
    <main class="round">
      <p class="spec">
        {label(catId.value)} // ROUND {String(roundNo.value).padStart(3, '0')} // SEED {r.seedLabel} // LVL {r.difficulty}
      </p>
      <div class="sheet">
        <CodeBlock template={r.template} />
        {Object.keys(r.context).length > 0 && <pre class="context rule">// context{'\n'}{ctxLine(r.context)}</pre>}
      </div>
      <p class="prompt-line">{r.prompt}</p>
      {r.kind === 'mc' ? <McOptions /> : <TypedInput />}
      {fb && <Feedback />}
    </main>
  )
}
