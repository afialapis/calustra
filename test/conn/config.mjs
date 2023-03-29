const tables= [
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



export default {
  connections: {
    postgres: {
      dialect:  'postgres',
      host:     'localhost',
      port:     5432,
      database: 'calustra',
      user:     'postgres',
      password: 'postgres'
    },
    sqlite: {
      dialect:  'sqlite',
      filename: ':memory:',
      verbose: true,
      cached: true
    }
  },
  options: {
    log: 'warn',
    tables
  }
}
