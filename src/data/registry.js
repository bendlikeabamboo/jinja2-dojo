// Single ordered index. Import order drives the home grid and the 1-n drill
// keys; mixed mode is always the next key. Adding a category = one import +
// one MODULES entry.
import * as filtersNs from './generators/filters.js'
import * as controlflowNs from './generators/controlflow.js'
import * as testsNs from './generators/tests.js'
import * as globalsNs from './generators/globals.js'
import * as whitespaceNs from './generators/whitespace.js'

import { collectGenerators } from './generators/common.js'

const MODULES = [filtersNs, controlflowNs, testsNs, globalsNs, whitespaceNs]

export const CATEGORIES = MODULES.map((m) => m.CATEGORY)

export const REGISTRY = Object.fromEntries(MODULES.map((m) => [m.CATEGORY.id, collectGenerators(m)]))
