import { mcCore, typedCore, nounOf } from './common.js'

const render = (rng, kind, core) => (kind === 'mc' ? mcCore(rng, { ...core, category: 'whitespace' }) : typedCore({ ...core, category: 'whitespace' }))

const sp = (n) => ' '.repeat(n)

function genStripLeft(rng, kind) {
  const left = nounOf(rng)
  const right = nounOf(rng)
  const pad = sp(rng.int(1, 4))
  return render(rng, kind, {
    difficulty: 1,
    template: `${left}${pad}{{- '${right}' }}`,
    context: {},
    expected: left + right,
    distractors: [`${left}${pad}${right}`, `${left}${sp(pad + 1)}${right}`, `${left}${sp(pad === 1 ? 3 : 1)}${right}`],
    explain: '{{- strips ALL whitespace before the tag, here the padding too.',
  })
}

function genStripRight(rng, kind) {
  const left = nounOf(rng)
  const right = nounOf(rng)
  const pad = sp(rng.int(1, 4))
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ '${left}' -}}${pad}${right}`,
    context: {},
    expected: left + right,
    distractors: [`${left}${pad}${right}`, `${left}${sp(pad + 1)}${right}`, `${left}${sp(pad === 1 ? 3 : 1)}${right}`],
    explain: '-}} strips ALL whitespace after the tag.',
  })
}

function genStripBoth(rng, kind) {
  const left = nounOf(rng)
  const mid = nounOf(rng)
  const right = nounOf(rng)
  return render(rng, kind, {
    difficulty: 2,
    template: `${left} {{- '${mid}' -}} ${right}`,
    context: {},
    expected: left + mid + right,
    distractors: [`${left} ${mid} ${right}`, `${left}${mid} ${right}`, `${left} ${mid}${right}`],
    explain: 'minus on both sides fuses the three words into one.',
  })
}

function genKeepSpaces(rng, kind) {
  const left = nounOf(rng)
  const mid = nounOf(rng)
  const right = nounOf(rng)
  return render(rng, kind, {
    difficulty: 1,
    template: `${left} {{ '${mid}' }} ${right}`,
    context: {},
    expected: `${left} ${mid} ${right}`,
    distractors: [left + mid + right, `${left}  ${mid}  ${right}`, `${left}${mid}${right}`],
    explain: 'without minus signs, every space survives untouched.',
  })
}

function genBlockNewline(rng, kind) {
  const word = nounOf(rng)
  return render(rng, kind, {
    difficulty: 2,
    template: `{% if true %}\n${word}\n{% endif %}`,
    context: {},
    expected: `\n${word}\n`,
    distractors: [word, `\n${word}`, `${word}\n`],
    explain: 'a block tag does not trim the newline after it — both line breaks are real output.',
  })
}

function genForNewlines(rng, kind) {
  const a = rng.int(1, 4)
  const b = a + 1
  return render(rng, kind, {
    difficulty: 3,
    template: `{% for i in [${a}, ${b}] %}\n{{ i }}\n{% endfor %}`,
    context: {},
    expected: `\n${a}\n\n${b}\n`,
    distractors: [`${a}\n${b}`, `${a}${b}`, `\n${a}${b}\n`],
    explain: 'each pass emits its own leading and trailing newline: two passes double the breaks.',
  })
}

function genCommentDefault(rng, kind) {
  const left = nounOf(rng)
  const right = nounOf(rng)
  return render(rng, kind, {
    difficulty: 2,
    template: `${left} {# note #} ${right}`,
    context: {},
    expected: `${left}  ${right}`,
    distractors: [`${left} ${right}`, left + right, `${left} ${right} `],
    explain: 'a plain comment vanishes but the spaces around it stay: two spaces remain.',
  })
}

function genCommentStrip(rng, kind) {
  const left = nounOf(rng)
  const right = nounOf(rng)
  return render(rng, kind, {
    difficulty: 2,
    template: `${left} {#- note -#} ${right}`,
    context: {},
    expected: left + right,
    distractors: [`${left} ${right}`, `${left}  ${right}`, `${left}-${right}`],
    explain: '{#- -#} strips the surrounding whitespace along with the comment.',
  })
}

function genSetNewline(rng, kind) {
  const n = rng.int(1, 9)
  return render(rng, kind, {
    difficulty: 3,
    template: `{% set x = ${n} %}\n{{ x }}`,
    context: {},
    expected: `\n${n}`,
    distractors: [`${n}`, `\n{{ x }}`, `${n}\n`],
    explain: 'set outputs nothing, but the newline after the tag is still printed.',
  })
}

function genTrimPair(rng, kind) {
  const a = nounOf(rng)
  const b = nounOf(rng)
  return render(rng, kind, {
    difficulty: 2,
    template: `{{- '${a}' }} {{- '${b}' }}`,
    context: {},
    expected: a + b,
    distractors: [`${a} ${b}`, `${a}  ${b}`, b + a],
    explain: 'the literal space is eaten by the second {{-, which strips before itself.',
  })
}

function genIndentKept(rng, kind) {
  const word = nounOf(rng)
  const indent = sp(rng.int(2, 4))
  return render(rng, kind, {
    difficulty: 3,
    template: `${indent}{% if true %}\n${indent}${word}\n${indent}{% endif %}`,
    context: {},
    expected: `${indent}\n${indent}${word}\n${indent}`,
    distractors: [word, `${indent}${word}`, `\n${word}\n`],
    explain: 'indentation before a tag is NOT removed by default (that would be lstrip_blocks).',
  })
}

function genFusion(rng, kind) {
  const left = nounOf(rng)
  const mid = nounOf(rng)
  const right = nounOf(rng)
  const pad = sp(rng.int(2, 5))
  return render(rng, kind, {
    difficulty: 3,
    template: `${left}{{ '${mid}' -}}${pad}{{- '${right}' }}`,
    context: {},
    expected: left + mid + right,
    distractors: [`${left}${mid} ${right}`, `${left} ${mid}${right}`, `${left} ${mid} ${right}`],
    explain: '-}} strips the gap after the first tag and {{- strips it before the second: everything fuses.',
  })
}

export const GENERATORS = [
  genStripLeft,
  genStripRight,
  genStripBoth,
  genKeepSpaces,
  genBlockNewline,
  genForNewlines,
  genCommentDefault,
  genCommentStrip,
  genSetNewline,
  genTrimPair,
  genIndentKept,
  genFusion,
]
