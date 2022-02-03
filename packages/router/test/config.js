export default {
  db: {
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
      filename: '/tmp/calustra.router.sqlite',
      verbose: true,
      cached: true
    }
  },
  server: {
    port: 3001,
    url: '/api'
  }
}
