export default {
  db: {
    postgres: {
      connection: {
        dialect:  'postgres',
        host:     'localhost',
        port:     5432,
        database: 'calustra',
        user:     'postgres',
        password: 'postgres'
      },
      options: {
        log: 'warn'
      }
    },
    sqlite: {
      connection: {
        dialect:  'sqlite',
        filename: ':memory:',
        verbose: true,
        cached: true
      },
      options: {
        log: 'warn'
      }
    }
  }
}

