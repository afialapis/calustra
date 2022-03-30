export default {
  connections: {
    postgres: {
      db: {
        dialect:  'postgres',
        host:     'localhost',
        port:     5432,
        database: 'calustra',
        user:     'postgres',
        password: 'postgres'
      },
      log: 'warn'
    },
    sqlite: {
      db: {
        dialect:  'sqlite',
        filename: ':memory:',
        verbose: true,
        cached: true
      },
      log: 'warn'
    }
  }
}

