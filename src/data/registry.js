import { GENERATORS as filters } from './generators/filters.js'
import { GENERATORS as controlflow } from './generators/controlflow.js'
import { GENERATORS as tests } from './generators/tests.js'
import { GENERATORS as globals } from './generators/globals.js'
import { GENERATORS as whitespace } from './generators/whitespace.js'

export const REGISTRY = {
  filters,
  controlflow,
  tests,
  globals,
  whitespace,
}
