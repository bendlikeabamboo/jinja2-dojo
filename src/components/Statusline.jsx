export function Statusline({ mode, category, roundNo, score, streak }) {
  return (
    <header class="statusline spec">
      <span class="mode">{mode}</span>
      <span class="sep">│</span>
      <span>{category}</span>
      {roundNo != null && (
        <>
          <span class="sep">│</span>
          <span>ROUND {String(roundNo).padStart(3, '0')}</span>
          <span class="sep">│</span>
          <span>SCORE {score}</span>
          <span class="sep">│</span>
          <span>STREAK {streak}</span>
        </>
      )}
    </header>
  )
}
