import { mcCore, typedCore, nounOf } from './common.js'

const render = (rng, kind, core) => (kind === 'mc' ? mcCore(rng, { ...core, category: 'globals' }) : typedCore({ ...core, category: 'globals' }))

function seq(nums) {
  return nums.map((n) => `[${n}]`).join('')
}

function genRangeN(rng, kind) {
  const n = rng.int(2, 4)
  const expected = seq([0, 1, 2].slice(0, n))
  return render(rng, kind, {
    difficulty: 1,
    template: `{% for i in range(${n}) %}[{{ i }}]{% endfor %}`,
    context: {},
    expected,
    distractors: [seq([1, 2, 3].slice(0, n)), seq([1, 2].slice(0, n)), `[${n}]`],
    explain: 'range(n) counts from 0 up to n-1 — n items total.',
  })
}

function genRangeAB(rng, kind) {
  const a = rng.int(1, 4)
  const b = a + rng.int(2, 4)
  const nums = []
  for (let i = a; i < b; i++) nums.push(i)
  const expected = seq(nums)
  return render(rng, kind, {
    difficulty: 2,
    template: `{% for i in range(${a}, ${b}) %}[{{ i }}]{% endfor %}`,
    context: {},
    expected,
    distractors: [seq(nums.concat(b)), seq(nums.slice(1)), seq([b - 1, b])],
    explain: `range(${a}, ${b}) excludes ${b} — the stop value never renders.`,
  })
}

function genRangeStep(rng, kind) {
  const a = rng.pick([0, 1])
  const step = rng.pick([2, 3])
  const stop = a + step * rng.int(2, 3) + 1
  const nums = []
  for (let i = a; i < stop; i += step) nums.push(i)
  const expected = seq(nums)
  return render(rng, kind, {
    difficulty: 3,
    template: `{% for i in range(${a}, ${stop}, ${step}) %}[{{ i }}]{% endfor %}`,
    context: {},
    expected,
    distractors: [seq(nums.concat(stop)), seq(nums.map((x) => x + 1)), seq([a, a + step])],
    explain: `range(${a}, ${stop}, ${step}) steps by ${step}, still stopping before ${stop}.`,
  })
}

function genRangeReverse(rng, kind) {
  const n = rng.int(2, 4)
  const nums = []
  for (let i = n; i > 0; i--) nums.push(i)
  const expected = seq(nums)
  return render(rng, kind, {
    difficulty: 3,
    template: `{% for i in range(${n}, 0, -1) %}[{{ i }}]{% endfor %}`,
    context: {},
    expected,
    distractors: [seq(nums.concat(0)), seq(nums.slice().reverse()), `countdown`],
    explain: 'a negative step counts down and still excludes the stop value 0.',
  })
}

function genDictGlobal(rng, kind) {
  const k1 = nounOf(rng)
  const k2 = nounOf(rng)
  const expected = String(rng.int(1, 9))
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ dict(${k1}=1, ${k2}=${expected})['${k2}'] }}`,
    context: {},
    expected,
    distractors: ['1', k2, `{{ ${k2} }}`],
    explain: 'dict(...) builds a mapping inline; [key] then reads one value out.',
  })
}

function genConcat(rng, kind) {
  const left = nounOf(rng)
  const right = nounOf(rng)
  const expected = left + right
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ '${left}' ~ '${right}' }}`,
    context: {},
    expected,
    distractors: [`${left} ${right}`, `${left}~${right}`, left],
    explain: '~ concatenates strings with no separator.',
  })
}

function genConcatNumber(rng, kind) {
  const word = nounOf(rng)
  const n = rng.int(1, 99)
  const expected = `${word}${n}`
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ '${word}' ~ ${n} }}`,
    context: {},
    expected,
    distractors: [word, `${word} ${n}`, String(n + 1)],
    explain: '~ coerces numbers to text before joining.',
  })
}

function genConcatLoop(rng, kind) {
  const a = nounOf(rng)
  const b = nounOf(rng)
  const expected = `r1${a}r2${b}`
  return render(rng, kind, {
    difficulty: 3,
    template: `{% for w in ['${a}', '${b}'] %}{{ 'r' ~ loop.index ~ w }}{% endfor %}`,
    context: {},
    expected,
    distractors: [`r1${a}r1${b}`, `${a}${b}`, `r0${a}r1${b}`],
    explain: '~ chains left to right: "r" + loop.index + the word.',
  })
}

function genNamespace(rng, kind) {
  const n = rng.int(1, 9)
  const expected = String(n)
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ namespace(progress=${n}).progress }}`,
    context: {},
    expected,
    distractors: ['0', 'namespace', String(n + 1)],
    explain: 'namespace(...) is a global for mutable state across blocks and loops.',
  })
}

function genJoiner(rng, kind) {
  const sep = rng.pick([', ', ' | '])
  const a = nounOf(rng)
  const b = nounOf(rng)
  const expected = `${a}${sep}${b}`
  return render(rng, kind, {
    difficulty: 3,
    template: `{% set j = joiner('${sep}') %}{{ j() }}{{ '${a}' }}{{ j() }}{{ '${b}' }}`,
    context: {},
    expected,
    distractors: [`${a}${b}`, `${a}${sep}${b}${sep}`, a],
    explain: `joiner('${sep}') returns '' on its FIRST call and the separator from the second call on.`,
  })
}

function genCycler(rng, kind) {
  const a = rng.pick(['+', '-', '*'])
  const b = rng.pick(['.', '_', '='])
  const expected = a
  return render(rng, kind, {
    difficulty: 3,
    template: `{{ cycler('${a}', '${b}').next() }}`,
    context: {},
    expected,
    distractors: [b, a + b, 'cycler'],
    explain: `cycler cycles its items; .next() returns the first item on the first call ('${a}').`,
  })
}

function genRangeLength(rng, kind) {
  const a = rng.int(0, 3)
  const stop = a + rng.int(3, 6)
  const expected = String(stop - a)
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ range(${a}, ${stop})|length }}`,
    context: {},
    expected,
    distractors: [String(stop - a + 1), String(stop), '0'],
    explain: `stop - start items: ${stop} - ${a} = ${stop - a}; the filter length counts the range.`,
  })
}

export const GENERATORS = [
  genRangeN,
  genRangeAB,
  genRangeStep,
  genRangeReverse,
  genDictGlobal,
  genConcat,
  genConcatNumber,
  genConcatLoop,
  genNamespace,
  genJoiner,
  genCycler,
  genRangeLength,
]
