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
    log: 'warn'
  }
}

