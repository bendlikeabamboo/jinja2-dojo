import { mcCore, typedCore, nounOf } from './common.js'

const render = (rng, kind, core) => (kind === 'mc' ? mcCore(rng, { ...core, category: 'tests' }) : typedCore({ ...core, category: 'tests' }))

// Jinja renders booleans Python-style: True / False.
const T = 'True'
const F = 'False'

function genDefined(rng, kind) {
  const name = nounOf(rng)
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ ${name} is defined }}`,
    context: { [name]: 7 },
    expected: T,
    distractors: [F, 'true', 'defined'],
    explain: 'the variable exists, and Jinja prints booleans Python-style: True.',
  })
}

function genUndefined(rng, kind) {
  const name = nounOf(rng)
  const other = nounOf(rng)
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ ${name} is undefined }}`,
    context: { [other]: 1 },
    expected: T,
    distractors: [F, 'false', 'None'],
    explain: `${name} was never passed in, so it is undefined — and undefined is not an error inside a test.`,
  })
}

function genNone(rng, kind) {
  const key = nounOf(rng)
  const isNone = rng.chance(0.5)
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ ${key} is none }}`,
    context: { [key]: isNone ? null : 0 },
    expected: isNone ? T : F,
    distractors: isNone ? [F, 'None', 'none'] : [T, 'None', 'true'],
    explain: isNone
      ? 'None (Python null) satisfies is none. It renders from variables as the text None.'
      : '0 is a number, not None — is none is False.',
  })
}

function genEvenOdd(rng, kind) {
  const n = rng.int(1, 20)
  const even = rng.chance(0.5)
  const expected = String(n % 2 === (even ? 0 : 1)).replace('true', T).replace('false', F)
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ n is ${even ? 'even' : 'odd'} }}`,
    context: { n },
    expected,
    distractors: [expected === T ? F : T, even ? 'odd' : 'even', 'true'],
    explain: `is ${even ? 'even' : 'odd'} checks n % 2 against ${even ? '0' : '1'}.`,
  })
}

function genDivisibleby(rng, kind) {
  const div = rng.pick([2, 3, 4, 5])
  const multiple = rng.int(1, 6) * div
  const hit = rng.chance(0.6)
  const n = hit ? multiple : multiple + 1
  const expected = n % div === 0 ? T : F
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ n is divisibleby(${div}) }}`,
    context: { n },
    expected,
    distractors: [expected === T ? F : T, `divisible`, 'even'],
    explain: `divisibleby takes an argument: n % ${div} ${n % div === 0 ? '== 0' : '!== 0'} here. One word, no underscore.`,
  })
}

function genMapping(rng, kind) {
  const isMapping = rng.chance(0.5)
  const value = isMapping ? { a: 1 } : [1]
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ data is mapping }}`,
    context: { data: value },
    expected: isMapping ? T : F,
    distractors: [isMapping ? F : T, 'dict', 'iterable'],
    explain: isMapping ? 'an object/dict is a mapping.' : 'a list is iterable, not a mapping.',
  })
}

function genTypeTest(rng, kind) {
  const mode = rng.int(1, 3)
  if (mode === 1) {
    const word = nounOf(rng)
    const isString = rng.chance(0.7)
    const value = isString ? word : rng.int(1, 99)
    return render(rng, kind, {
      difficulty: 2,
      template: `{{ value is string }}`,
      context: { value },
      expected: isString ? T : F,
      distractors: [isString ? F : T, 'str', 'true'],
      explain: isString ? 'a quoted string is a string.' : 'a bare number is not a string.',
    })
  }
  if (mode === 2) {
    const isNumber = rng.chance(0.6)
    const value = isNumber ? rng.int(1, 99) : nounOf(rng)
    return render(rng, kind, {
      difficulty: 2,
      template: `{{ value is number }}`,
      context: { value },
      expected: isNumber ? T : F,
      distractors: [isNumber ? F : T, 'int', 'number'],
      explain: isNumber ? 'integers and floats are both numbers.' : 'quoted text is a string, not a number.',
    })
  }
  const isIterable = rng.chance(0.75)
  const value = isIterable ? rng.shuffle([1, 2, 3]) : rng.int(1, 99)
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ value is iterable }}`,
    context: { value },
    expected: isIterable ? T : F,
    distractors: [isIterable ? F : T, 'list', 'sequence'],
    explain: isIterable ? 'lists, strings and dicts are all iterable.' : 'a plain number is not iterable.',
  })
}

function genEquality(rng, kind) {
  const word = nounOf(rng)
  const same = rng.chance(0.5)
  const b = same ? word : nounOf(rng)
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ a == b }}`,
    context: { a: word, b },
    expected: same ? T : F,
    distractors: [same ? F : T, 'true', same ? 'False ' : 'True '],
    explain: '== compares values; the result prints as True or False.',
  })
}

function genInList(rng, kind) {
  const basket = rng.shuffle(['tea', 'sake', 'chai'])
  const probe = rng.pick(basket)
  const useNot = rng.chance(0.5)
  const expected = useNot ? F : T
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ ${useNot ? 'not ' : ''}'${probe}' in basket }}`,
    context: { basket },
    expected,
    distractors: [useNot ? T : F, 'in', 'false'],
    explain: useNot
      ? "the item IS present, so 'in' is True and 'not in' flips it to False."
      : "membership is case-sensitive and exact; the item is present, so True.",
  })
}

function genAndOr(rng, kind) {
  const useOr = rng.chance(0.5)
  const a = rng.chance(0.6)
  const b = rng.chance(0.6)
  const expected = (useOr ? a || b : a && b) ? T : F
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ a ${useOr ? 'or' : 'and'} b }}`,
    context: { a, b },
    expected,
    distractors: [expected === T ? F : T, 'and', 'or'],
    explain: useOr ? 'or is true when either side is truthy.' : 'and needs both sides truthy.',
  })
}

function genNot(rng, kind) {
  const done = rng.chance(0.5)
  const expected = done ? F : T
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ not done }}`,
    context: { done },
    expected,
    distractors: [done ? T : F, 'not', 'None'],
    explain: 'not inverts truthiness; booleans print Python-style.',
  })
}

function genChained(rng, kind) {
  const has = rng.chance(0.5)
  const items = rng.shuffle(['map', 'reduce', 'scan'])
  const probe = has ? items[0] : 'fold'
  const expected = has ? T : F
  return render(rng, kind, {
    difficulty: 3,
    template: `{{ '${probe}' in items and items is iterable }}`,
    context: { items },
    expected,
    distractors: [has ? F : T, 'and', 'True'],
    explain: `both sides must hold: membership is ${has ? 'True' : 'False'}, so the and-chain is ${has ? 'True' : 'False'}.`,
  })
}

export const GENERATORS = [
  genDefined,
  genUndefined,
  genNone,
  genEvenOdd,
  genDivisibleby,
  genMapping,
  genTypeTest,
  genEquality,
  genInList,
  genAndOr,
  genNot,
  genChained,
]
