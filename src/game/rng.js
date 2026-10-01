export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class Rng {
  constructor(seed) {
    this.seed = seed >>> 0
    this.next = mulberry32(this.seed)
  }
  float() {
    return this.next()
  }
  int(min, max) {
    return min + Math.floor(this.next() * (max - min + 1))
  }
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)]
  }
  shuffle(arr) {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      const tmp = a[i]
      a[i] = a[j]
      a[j] = tmp
    }
    return a
  }
  chance(p) {
    return this.next() < p
  }
  weighted(entries) {
    let total = 0
    for (const [, w] of entries) total += w
    let roll = this.next() * total
    for (const [value, w] of entries) {
      roll -= w
      if (roll < 0) return value
    }
    return entries[entries.length - 1][0]
  }
}

export function seedHex(seed) {
  return (seed & 0xffffff).toString(16).padStart(6, '0')
}
