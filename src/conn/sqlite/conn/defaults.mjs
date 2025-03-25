export default {
  dialect:  'sqlite',
  filename: ':memory:',

  verbose:   true,
  
  // https://github.com/mapbox/node-sqlite3/wiki/Caching
  cached:    false, // calustra will handle the caching
  
  /*user:     'sqlite',
  password: 'sqlite'*/

  trace: undefined,
  profile: undefined,
  busyTimeout: undefined
}
