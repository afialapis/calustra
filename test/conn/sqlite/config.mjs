import path from 'path'
import { fileURLToPath } from 'url'
const __my_filename = fileURLToPath(import.meta.url)
const __my_dirname = path.dirname(__my_filename)

const SQLITE_DB = path.join(__my_dirname, 'calustra.sqlite')
export const sqlite = {
  dialect:  'sqlite',
  filename: SQLITE_DB, // ':memory:', // 
  verbose: true,
  cached: false
}

