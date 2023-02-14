const _options= {
  log: 'warn'
}
const _tables= [
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


const postgres= {
  connection: {
    database: {
      dialect:  'postgres',
      host:     'localhost',
      port:     5432,
      database: 'calustra',
      user:     'postgres',
      password: 'postgres'
    },
    options: _options
  },
  tables: _tables
}

const sqlite= {
  connection: {
    database: {
      dialect:  'sqlite',
      filename: ':memory:',
      verbose: true,
      cached: true
    },
    options: _options
  },
  tables: _tables  
}

export {postgres, sqlite}
