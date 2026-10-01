import { mcCore, typedCore, nameOf, nounOf, cityOf, words, jinjaTitle } from './common.js'

const render = (rng, kind, core) => (kind === 'mc' ? mcCore(rng, { ...core, category: 'filters' }) : typedCore({ ...core, category: 'filters' }))

function genUpper(rng, kind) {
  const name = nameOf(rng)
  const expected = name.toUpperCase()
  return render(rng, kind, {
    difficulty: 1,
    template: `Hello {{ name|upper }}.`,
    context: { name },
    expected,
    distractors: [jinjaTitle(name), name.toUpperCase(), `${name}s`],
    explain: 'upper uppercases every character.',
  })
}

function genLower(rng, kind) {
  const city = cityOf(rng).toUpperCase()
  const expected = city.toLowerCase()
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ city|lower }} on the roster.`,
    context: { city },
    expected,
    distractors: [jinjaTitle(city.toLowerCase()), `${city.toLowerCase()}!`, `${city}!`],
    explain: 'lower lowercases every character.',
  })
}

function genTitle(rng, kind) {
  const name = `${nameOf(rng)} ${nounOf(rng)}`
  const expected = jinjaTitle(name)
  return render(rng, kind, {
    difficulty: 2,
    template: `Welcome, {{ full_name|title }}.`,
    context: { full_name: name },
    expected,
    distractors: [
      name[0].toUpperCase() + name.slice(1),
      name.toUpperCase(),
      name.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join('') ,
    ],
    explain: 'title uppercases the first letter of every word and leaves the rest untouched.',
  })
}

function genCapitalize(rng, kind) {
  const name = `${nameOf(rng)} ${nounOf(rng)}`
  const expected = name[0].toUpperCase() + name.slice(1)
  return render(rng, kind, {
    difficulty: 2,
    template: `Contact: {{ handle|capitalize }}.`,
    context: { handle: name },
    expected,
    distractors: [jinjaTitle(name), name, name.toUpperCase()],
    explain: 'capitalize uppercases only the very first character; the rest stays as-is.',
  })
}

function genDefault(rng, kind) {
  const name = nameOf(rng)
  const fallback = rng.pick(['anon', 'ghost', 'drift'])
  const expected = fallback
  return render(rng, kind, {
    difficulty: 1,
    template: `Player: {{ nickname|default('${fallback}') }}.`,
    context: { name },
    expected,
    distractors: ['', name, `{{ nickname }}`],
    explain: `nickname is undefined, so default supplies '${fallback}'.`,
  })
}

function genLength(rng, kind) {
  const word = nounOf(rng)
  const n = word.length
  return render(rng, kind, {
    difficulty: 1,
    template: `{{ word|length }} letters.`,
    context: { word },
    expected: String(n),
    distractors: [String(n - 1), String(n + 1), word],
    explain: `length counts characters: '${word}' has ${n}.`,
  })
}

function genJoin(rng, kind) {
  const tags = words(rng, 3)
  const expected = tags.join(', ')
  return render(rng, kind, {
    difficulty: 1,
    template: `Tags: {{ tags|join(', ') }}`,
    context: { tags },
    expected,
    distractors: [tags.join(''), tags.join(' '), tags.join(', ') + ','],
    explain: "join(', ') places the separator between items only.",
  })
}

function genFirstLast(rng, kind) {
  const nums = rng.shuffle([3, 7, 11, 19])
  const wantFirst = rng.chance(0.5)
  const expected = String(wantFirst ? nums[0] : nums[3])
  return render(rng, kind, {
    difficulty: 1,
    template: `Pick: {{ nums|${wantFirst ? 'first' : 'last'} }}`,
    context: { nums },
    expected,
    distractors: [String(wantFirst ? nums[3] : nums[0]), String(nums[1]), String(nums[2])],
    explain: `${wantFirst ? 'first' : 'last'} reads from the sequence as given — no reordering.`,
  })
}

function genMinMax(rng, kind) {
  const nums = rng.shuffle([4, 17, 9, 23])
  const s = nums.slice().sort((a, b) => a - b)
  const wantMin = rng.chance(0.5)
  const expected = String(wantMin ? s[0] : s[3])
  return render(rng, kind, {
    difficulty: 1,
    template: `Extremes: {{ nums|${wantMin ? 'min' : 'max'} }}`,
    context: { nums },
    expected,
    distractors: [String(wantMin ? s[3] : s[0]), String(wantMin ? s[2] : s[1]), String(wantMin ? s[1] : s[2])],
    explain: `${wantMin ? 'min' : 'max'} compares values, not positions.`,
  })
}

function genSum(rng, kind) {
  const nums = [rng.int(2, 9), rng.int(10, 19), rng.int(20, 29)]
  const expected = String(nums[0] + nums[1] + nums[2])
  return render(rng, kind, {
    difficulty: 2,
    template: `Total: {{ nums|sum }}`,
    context: { nums },
    expected,
    distractors: [String(Number(expected) + 10), String(nums.join('')), String(Number(expected) - nums[0])],
    explain: 'sum adds every item.',
  })
}

function genSort(rng, kind) {
  const items = rng.shuffle(['zen', 'ark', 'moss', 'fern'])
  const expected = items.slice().sort().join(' ')
  return render(rng, kind, {
    difficulty: 2,
    template: `{{ words|sort|join(' ') }}`,
    context: { words: items },
    expected,
    distractors: [items.join(' '), items.slice().reverse().join(' '), items.slice().sort().reverse().join(' ')],
    explain: 'sort orders strings lexicographically, ascending.',
  })
}

function genReverse(rng, kind) {
  const word = nounOf(rng)
  const expected = word.split('').reverse().join('')
  return render(rng, kind, {
    difficulty: 2,
    template: `Mirror: {{ word|reverse }}`,
    context: { word },
    expected,
    distractors: [word, word[0] + word.split('').reverse().join('').slice(1), jinjaTitle(word)],
    explain: 'reverse on a string reverses its characters.',
  })
}

function genReplace(rng, kind) {
  const word = nounOf(rng)
  const from = rng.pick(['a', 'o', 'e'])
  const to = rng.pick(['4', '0', '3'])
  const expected = word.split(from).join(to)
  if (!word.includes(from)) return genReplace(rng, kind)
  return render(rng, kind, {
    difficulty: 2,
    template: `Leet: {{ word|replace('${from}', '${to}') }}`,
    context: { word },
    expected,
    distractors: [word, word.replace(from, to) === expected ? word + to : word.replace(from, to), word.toUpperCase()],
    explain: `replace swaps every occurrence of '${from}' with '${to}'.`,
  })
}

function genTruncate(rng, kind) {
  const sentence = `the ${nounOf(rng)} guards the ${nounOf(rng)} gate`
  const length = 10
  const expected = sentence.slice(0, length - 3) + '...'
  return render(rng, kind, {
    difficulty: 3,
    template: `Log: {{ line|truncate(${length}, true, '...') }}`,
    context: { line: sentence },
    expected,
    distractors: [sentence, sentence.slice(0, length - 3).replace(/\s+\S*$/, '') + '...', sentence.slice(0, length)],
    explain: `truncate(${length}, true, '...') hard-cuts at ${length - 3} chars (killwords), then appends '...'. Leeway of 5 only applies when the string is short.`,
  })
}

function genRound(rng, kind) {
  // Avoid X.5 values: Python's round is banker's rounding, JS Math.round is not.
  const whole = rng.int(11, 98)
  const frac = rng.pick([1, 2, 3, 4, 6, 7, 8, 9])
  const price = (whole * 10 + frac) / 100
  const expected = Math.round(price) + '.0'
  return render(rng, kind, {
    difficulty: 2,
    template: `Price: {{ price|round }}`,
    context: { price },
    expected,
    distractors: [String(Math.round(price)), String(price), (frac >= 5 ? Math.floor(price) : Math.ceil(price)) + '.0'],
    explain: 'round with precision 0 returns a float, so it renders like 4.0 — not 4.',
  })
}

function genInt(rng, kind) {
  const useFloat = rng.chance(0.5)
  const value = useFloat ? rng.int(11, 98) / 10 : String(rng.int(10, 99))
  const expected = String(Math.trunc(Number(value)))
  return render(rng, kind, {
    difficulty: 2,
    template: `Parsed: {{ value|int }}`,
    context: { value },
    expected,
    distractors: [String(Number(expected) + 1), '0', `${expected}.0`],
    explain: 'int truncates toward zero — no rounding.',
  })
}

function genTrim(rng, kind) {
  const word = nounOf(rng)
  const padL = rng.int(1, 3)
  const padR = rng.int(1, 3)
  const padded = ' '.repeat(padL) + word + ' '.repeat(padR)
  return render(rng, kind, {
    difficulty: 1,
    template: `[{{ padded|trim }}]`,
    context: { padded },
    expected: `[${word}]`,
    distractors: [`[${padded}]`, `[${padded.trimEnd()}]`, `[${padded.trimStart()}]`],
    explain: 'trim strips leading and trailing whitespace.',
  })
}

function genChain(rng, kind) {
  const mode = rng.int(1, 3)
  if (mode === 1) {
    const names = rng.shuffle([nameOf(rng), nameOf(rng), nameOf(rng)])
    const expected = names.slice().sort()[0]
    return render(rng, kind, {
      difficulty: 3,
      template: `Head of line: {{ names|sort|first }}`,
      context: { names },
      expected,
      distractors: [names[0], names.slice().sort()[2], names.slice().sort()[1]],
      explain: 'filters pipe left to right: sort first, then take first.',
    })
  }
  if (mode === 2) {
    const word = nounOf(rng)
    const expected = word.toUpperCase().split('').reverse().join('')
    return render(rng, kind, {
      difficulty: 3,
      template: `Seal: {{ word|upper|reverse }}`,
      context: { word },
      expected,
      distractors: [word.toUpperCase(), word.split('').reverse().join('').toUpperCase() + word[0], word.split('').reverse().join('')],
      explain: 'upper runs before reverse: capitalize everything, then mirror.',
    })
  }
  const num = rng.int(100, 999)
  return render(rng, kind, {
    difficulty: 3,
    template: `Width: {{ code|string|length }}`,
    context: { code: num },
    expected: '3',
    distractors: ['1', String(num), String(num).split('').reverse().join('')],
    explain: 'string casts the number to text first; length then counts its digits.',
  })
}

export const GENERATORS = [
  genUpper,
  genLower,
  genTitle,
  genCapitalize,
  genDefault,
  genLength,
  genJoin,
  genFirstLast,
  genMinMax,
  genSum,
  genSort,
  genReverse,
  genReplace,
  genTruncate,
  genRound,
  genInt,
  genTrim,
  genChain,
]
