import { describe, it, expect } from 'vitest'
import { generateRound, normalizeText } from '../src/game/engine.js'
import { Rng } from '../src/game/rng.js'
import { CATEGORIES, REGISTRY } from '../src/data/registry.js'
import * as filtersNs from '../src/data/generators/filters.js'
import * as controlflowNs from '../src/data/generators/controlflow.js'
import * as testsNs from '../src/data/generators/tests.js'
import * as globalsNs from '../src/data/generators/globals.js'
import * as whitespaceNs from '../src/data/generators/whitespace.js'

const MODULES = {
  filters: filtersNs,
  controlflow: controlflowNs,
  tests: testsNs,
  globals: globalsNs,
  whitespace: whitespaceNs,
}

const RUNS = 200

describe('category registry integrity', () => {
  it('registry keys match categories', () => {
    expect(Object.keys(REGISTRY).sort()).toEqual([...CATEGORIES.map((c) => c.id)].sort())
  })

  it('category ids are unique', () => {
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length)
  })

  for (const cat of CATEGORIES) {
    it(`${cat.id} is self-describing with a non-empty generator list`, () => {
      expect(typeof cat.label, cat.id).toBe('string')
      expect(cat.label.length, cat.id).toBeGreaterThan(0)
      expect(typeof cat.desc, cat.id).toBe('string')
      expect(cat.desc.length, cat.id).toBeGreaterThan(0)
      expect(REGISTRY[cat.id].length, cat.id).toBeGreaterThan(0)
    })

    it(`${cat.id}: every gen* export is collected into the registry`, () => {
      const ns = MODULES[cat.id]
      const exports_ = Object.keys(ns).filter((k) => /^gen[A-Z]/.test(k) && typeof ns[k] === 'function')
      const collected = REGISTRY[cat.id].map((f) => f.name)
      expect(new Set(collected), cat.id).toEqual(new Set(exports_))
    })
  }

  it('collected generators all follow the gen* convention', () => {
    for (const gens of Object.values(REGISTRY)) {
      for (const gen of gens) expect(gen.name).toMatch(/^gen[A-Z]/)
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
