import path from 'path'
import { addAlias } from 'module-alias'

addAlias('@', path.resolve(__dirname))

import('./index')
