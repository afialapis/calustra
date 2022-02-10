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
        filename: '/tmp/calustra.router.sqlite',
        verbose: true,
        cached: true
      },
      options: {
        log: 'warn'
      }
    }
  },
  server: {
    port: 3001,
    url: '/api'
  }
}

