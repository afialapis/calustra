module.exports= {
  db: {
    dialect:  'postgres',
    host:     'localhost',
    port:     5432,
    database: 'calustra',
    user:     'postgres',
    password: 'postgres',
    // Maximum/Minimum number of connection in pool
    max: 5,
    min: 0,
    // The maximum time, in milliseconds, that a connection can be idle before being released. 
    // Use with combination of evict for proper working, for more details read 
    // https://github.com/coopernurse/node-pool/issues/178#issuecomment-327110870
    idleTimeoutMillis: 10000
  },

  log: 'debug'
}
