import path from 'path'
import { fileURLToPath } from 'url'
const __my_filename = fileURLToPath(import.meta.url)
const __my_dirname = path.dirname(__my_filename)

const SQLITE_DB = path.join(__my_dirname, 'calustra.sqlite')

export default {
  config: {
    dialect:  'sqlite',
    filename: SQLITE_DB, // ':memory:', // 
    verbose: true,
    cached: false
  },
  options: {
    log: 'warn',
    tables: [
      {
        name: 'test_01',
        schema: 'public',
        useDateFields: {
          use: true,
          fieldNames: {
            created_at: 'created_at', 
            last_update_at: 'last_update_at'
          },
          now: () => 999
        },
        triggers: {
          afterInsert: async (conn, id, params, options) => {
            return 777
          }
        }
      }
    ]
  }
}