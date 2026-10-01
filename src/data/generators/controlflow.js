import { mcCore, typedCore, nounOf, words } from './common.js'

const render = (rng, kind, core) => (kind === 'mc' ? mcCore(rng, { ...core, category: 'controlflow' }) : typedCore({ ...core, category: 'controlflow' }))

function genIfTruthy(rng, kind) {
  const name = nounOf(rng)
  return render(rng, kind, {
    difficulty: 1,
    template: `{% if name %}Hi {{ name }}{% endif %}`,
    context: { name },
    expected: `Hi ${name}`,
    distractors: ['', 'Hi', `Hi {{ name }}`],
    explain: 'a non-empty string is truthy, so the block renders.',
  })
}

function genIfEmptyElse(rng, kind) {
  const noun = nounOf(rng)
  const empty = rng.chance(0.5)
  const note = empty ? '' : `the ${noun}`
  const expected = empty ? `no ${noun}s yet` : `note: the ${noun}`
  return render(rng, kind, {
    difficulty: 2,
    template: `{% if note %}note: {{ note }}{% else %}no ${noun}s yet{% endif %}`,
    context: { note },
    expected,
    distractors: empty ? [`note: `, `note: {{ note }}`, `no ${noun}s yet `.trim() + ' '] : [`no ${noun}s yet`, `note:`, expected.toUpperCase()],
    explain: empty ? 'an empty string is falsy, so the else branch runs.' : 'a non-empty string is truthy.',
  })
}

function genIfZero(rng, kind) {
  const zeroIsString = rng.chance(0.5)
  const count = zeroIsString ? '0' : 0
  const expected = zeroIsString ? '0 tickets left' : 'sold out'
  return render(rng, kind, {
    difficulty: 2,
    template: `{% if count %}{{ count }} tickets left{% else %}sold out{% endif %}`,
    context: { count },
    expected,
    distractors: zeroIsString ? ['sold out', '00 tickets left', '0'] : ['0 tickets left', 'sold out ', '{{ count }}'],
    explain: zeroIsString
      ? 'the string "0" is NON-empty, hence truthy — unlike the number 0.'
      : 'the number 0 is falsy, so the else branch runs.',
  })
}

function genLadder(rng, kind) {
  const temp = rng.int(1, 3) * 10 - 5
  const band = temp < 0 ? 'freeze' : temp < 20 ? 'cool' : 'warm'
  const expected = `${temp}C: ${band}`
  return render(rng, kind, {
    difficulty: 2,
    template: `{% if temp < 0 %}{{ temp }}C: freeze{% elif temp < 20 %}{{ temp }}C: cool{% else %}{{ temp }}C: warm{% endif %}`,
    context: { temp },
    expected,
    distractors: [`${temp}C: ${band === 'freeze' ? 'cool' : 'freeze'}`, `${temp}C: warm`, `${temp}C: ${band === 'warm' ? 'cool' : 'warm'}`],
    explain: 'elif chains stop at the first matching branch.',
  })
}

function genForInline(rng, kind) {
  const nums = rng.shuffle([rng.int(1, 9), rng.int(10, 19), rng.int(20, 29)])
  const expected = nums.map((n) => `[${n}]`).join('')
  return render(rng, kind, {
    difficulty: 1,
    template: `{% for n in nums %}[{{ n }}]{% endfor %}`,
    context: { nums },
    expected,
    distractors: [nums.map((n) => `[${n}]`).join(' '), '[' + nums[0] + ']', nums.map((n) => `[${n}]`).join(',')],
    explain: 'the body renders once per item, in order.',
  })
}

function genLoopIndex(rng, kind) {
  const items = words(rng, 3)
  const zeroBased = rng.chance(0.5)
  const expected = items.map((w, i) => `${zeroBased ? i : i + 1}.${w}`).join('|')
  return render(rng, kind, {
    difficulty: 2,
    template: `{% for w in words %}{{ loop.${zeroBased ? 'index0' : 'index'} }}.{{ w }}|{% endfor %}`,
    context: { words: items },
    expected,
    distractors: [
      items.map((w, i) => `${zeroBased ? i + 1 : i}.${w}`).join('|'),
      items.map((w) => `1.${w}`).join('|'),
      items.join('|'),
    ],
    explain: `loop.${zeroBased ? 'index0' : 'index'} is ${zeroBased ? 'zero-based' : 'one-based'}${zeroBased ? ' — the classic off-by-one trap' : ''}.`,
  })
}

function genLoopFirst(rng, kind) {
  const items = words(rng, 3)
  const expected = `[${items[0]}]${items[1]}${items[2]}`
  return render(rng, kind, {
    difficulty: 3,
    template: `{% for w in words %}{% if loop.first %}[{{ w }}]{% else %}{{ w }}{% endif %}{% endfor %}`,
    context: { words: items },
    expected,
    distractors: [`${items[0]}${items[1]}[${items[2]}]`, `[${items[0]}][${items[1]}][${items[2]}]`, items.join('')],
    explain: 'loop.first is true only on the first iteration; loop.last only on the final one.',
  })
}

function genLoopLength(rng, kind) {
  const n = rng.int(2, 5)
  const items = words(rng, n)
  const expected = `${Array(n).fill(n).join(' ')} of ${n}`
  return render(rng, kind, {
    difficulty: 2,
    template: `{% for w in words %}{{ loop.length }} {% endfor %}of {{ words|length }}`,
    context: { words: items },
    expected,
    distractors: [`${Array(n).fill(n - 1).join(' ')} of ${n}`, `${Array(n).fill(1).join(' ')} of ${n}`, `${n} of ${n}`],
    explain: 'loop.length is the total iteration count — it prints n times, once per pass.',
  })
}

function genInlineIf(rng, kind) {
  const done = rng.chance(0.5)
  const yes = 'ready'
  const no = 'waiting'
  const expected = done ? yes : no
  return render(rng, kind, {
    difficulty: 1,
    template: `Status: {{ '${yes}' if done else '${no}' }}`,
    context: { done },
    expected,
    distractors: [done ? no : yes, done ? '' : yes, `Status: {{ done }}`],
    explain: "inline if: 'a if cond else b' picks a side without a block.",
  })
}

function genDictsort(rng, kind) {
  const keys = words(rng, 3)
  const [k1, k2, k3] = keys
  const data = {}
  data[k2] = 2
  data[k1] = 1
  data[k3] = 3
  const sorted = keys.slice().sort()
  const expected = sorted.map((k) => `${k}=${data[k]}`).join(';')
  const insertion = [k2, k1, k3]
  return render(rng, kind, {
    difficulty: 3,
    template: `{% for k, v in data|dictsort %}{{ k }}={{ v }};{% endfor %}`,
    context: { data },
    expected,
    distractors: [
      insertion.map((k) => `${k}=${data[k]}`).join(';'),
      [k3, k2, k1].map((k) => `${k}=${data[k]}`).join(';'),
      insertion.map((k) => `${k}=${data[k]}`).sort().join(';'),
    ],    explain: 'dictsort returns pairs sorted by key, regardless of insertion order.',
  })
}

function genForElse(rng, kind) {
  const empty = rng.chance(0.5)
  const items = empty ? [] : words(rng, 2)
  const expected = empty ? 'nothing to train' : `drill: ${items[0]}`
  return render(rng, kind, {
    difficulty: 2,
    template: `{% for w in items %}drill: {{ w }}{% else %}nothing to train{% endfor %}`,
    context: { items },
    expected,
    distractors: empty ? ['drill: ', 'nothing to train '.trim() + ' ', '{{ w }}'] : [`drill: ${items[0]}drill: ${items[1]}`, items.join(': '), `nothing to train`],
    explain: empty
      ? 'for-else: the else block runs only when the iterable is empty.'
      : 'a non-empty iterable never reaches the else block.',
  })
}

function genForFilter(rng, kind) {
  const active = words(rng, 2)
  const idle = nounOf(rng)
  const users = [
    { name: active[0], active: true },
    { name: idle, active: false },
    { name: active[1], active: true },
  ]
  const expected = active.join('*') + '*'
  return render(rng, kind, {
    difficulty: 3,
    template: `{% for u in users if u.active %}{{ u.name }}*{% endfor %}`,
    context: { users },
    expected,
    distractors: [users.map((u) => u.name).join('*') + '*', users.filter((u) => !u.active).map((u) => u.name).join('*') + '*', active.join('*')],
    explain: 'an if inside for skips non-matching items — the idle one never renders.',
  })
}

export const GENERATORS = [
  genIfTruthy,
  genIfEmptyElse,
  genIfZero,
  genLadder,
  genForInline,
  genLoopIndex,
  genLoopFirst,
  genLoopLength,
  genInlineIf,
  genDictsort,
  genForElse,
  genForFilter,
]
