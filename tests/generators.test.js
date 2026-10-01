import { describe, it, expect } from 'vitest'
import { generateRound, normalizeText } from '../src/game/engine.js'
import { Rng } from '../src/game/rng.js'
import { REGISTRY } from '../src/data/registry.js'
import { CATEGORIES } from '../src/data/categories.js'

const RUNS = 200

describe('category registry integrity', () => {
  it('has all five categories with 12+ generators each', () => {
    expect(Object.keys(REGISTRY).sort()).toEqual([...CATEGORIES.map((c) => c.id)].sort())
    for (const cat of CATEGORIES) {
      expect(REGISTRY[cat.id].length, cat.id).toBeGreaterThanOrEqual(12)
    }
  })
})

describe('generator invariants across 200 seeded rounds each', () => {
  for (const cat of CATEGORIES) {
    describe(cat.id, () => {
      REGISTRY[cat.id].forEach((gen, genIdx) => {
        it(`generator #${genIdx} (${gen.name}) holds the contract`, () => {
          const rng = new Rng(1000 + genIdx)
          let sawMc = false
          let sawTyped = false
          for (let i = 0; i < RUNS; i++) {
            const seed = rng.int(0, 0xffffffff)
            const kind = i % 2 === 0 ? 'mc' : 'typed'
            const round = generateRound(cat.id, [gen], seed, kind)

            expect(round.category, `seed ${seed}`).toBe(cat.id)
            expect(round.template, `seed ${seed}`).toMatch(/\{\{|%\}|#\}/)
            expect(round.expected, `seed ${seed}`).toBeTruthy()
            expect(round.expected.length, `seed ${seed}`).toBeGreaterThan(0)
            expect(round.explain, `seed ${seed}`).toBeTruthy()
            expect(round.prompt, `seed ${seed}`).toBeTruthy()
            expect(normalizeText(round.expected).length, `seed ${seed}`).toBeGreaterThan(0)

            if (kind === 'mc') {
              sawMc = true
              expect(round.choices, `seed ${seed}`).toHaveLength(4)
              const unique = new Set(round.choices)
              expect(unique.size, `seed ${seed}: ${JSON.stringify(round.choices)}`).toBe(4)
              const matches = round.choices.filter((c) => c === round.expected)
              expect(matches.length, `seed ${seed}`).toBe(1)
              expect(round.correctIndex, `seed ${seed}`).toBeGreaterThanOrEqual(0)
              expect(round.correctIndex, `seed ${seed}`).toBeLessThanOrEqual(3)
              expect(round.choices[round.correctIndex], `seed ${seed}`).toBe(round.expected)
              // NOTE: normalize-equal distractors are ALLOWED — exact string compare
              // grades MC, and whitespace/trim rounds deliberately differ only by
              // spaces/newlines (options render pre-wrap so the difference is visible).
            } else {
              sawTyped = true
              for (const variant of round.accept ?? []) {
                expect(typeof variant, `seed ${seed}`).toBe('string')
              }
            }
          }
          expect(sawMc).toBe(true)
          expect(sawTyped).toBe(true)
        })
      })
    })
  }
})

describe('engine helpers', () => {
  it('normalizeText unifies newlines and collapses runs', () => {
    expect(normalizeText('  a \r\n\t b  ')).toBe('a b')
    expect(normalizeText('a\n\nb')).toBe('a b')
  })

  it('generateRound is deterministic per seed', () => {
    const gens = REGISTRY.filters
    const a = generateRound('filters', gens, 42, 'mc')
    const b = generateRound('filters', gens, 42, 'mc')
    expect(a).toEqual(b)
  })

  it('seedLabel renders 6 hex chars', () => {
    const r = generateRound('filters', REGISTRY.filters, 0xdeadbeef, 'mc')
    expect(r.seedLabel).toMatch(/^[0-9a-f]{6}$/)
  })
})
