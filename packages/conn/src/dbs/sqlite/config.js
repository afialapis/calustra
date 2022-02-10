module.exports= {
  connection: {
    dialect:  'sqlite',
    filename: ':memory:',

    verbose:   true,
    
    // https://github.com/mapbox/node-sqlite3/wiki/Caching
    cached:    true,
    
    /*user:     'sqlite',
    password: 'sqlite'*/

    trace: undefined,
    profile: undefined,
    busyTimeout: undefined
  },
  options: {
    log: 'debug'
  }
}
