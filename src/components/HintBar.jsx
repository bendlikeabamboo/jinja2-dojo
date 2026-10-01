export function HintBar({ hints }) {
  return (
    <footer class="hintbar">
      {hints.map(([key, label]) => (
        <span key={key}>
          <kbd>{key}</kbd>
          {label}
        </span>
      ))}
    </footer>
  )
}
