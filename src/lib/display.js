function show(v) {
  if (typeof v === 'string') return `'${v}'`
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (v === null) return 'null'
  if (v === undefined) return 'undefined'
  if (Array.isArray(v)) {
    if (v.length > 0 && typeof v[0] === 'object') return JSON.stringify(v)
    return `[${v.map((x) => (typeof x === 'string' ? `'${x}'` : show(x))).join(', ')}]`
  }
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

// Context rendering: `name = 'ada'` per line, dim mono under the template.
export function ctxLine(context) {
  return Object.entries(context)
    .map(([k, v]) => `${k} = ${show(v)}`)
    .join('\n')
}

// Make edge whitespace visible in rendered choices: leading/trailing runs of
// spaces/newlines become · and ↵ markers. Internal whitespace stays raw
// (pre-wrap shows it). Display only — grading always uses the raw string.
export function markEdges(s) {
  return s.replace(/^\s+|\s+$/g, (m) => m.replace(/ /g, '·').replace(/\n/g, '↵\n').replace(/\t/g, '⇥\t'))
}
