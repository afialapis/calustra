function _cacheKeyForConfigPostgres(config) {
  return `dialect:postgres;host:${config?.db?.host};port:${config?.db?.port};database:${config?.db?.database}`
}

function _cacheKeyForConfigSqlite(config) {
  return `dialect:sqlite;filename:${config?.db?.filename}`
}

function _cacheKeyForConfig(config) {
  if (config?.db?.dialect=='postgres') {
    return _cacheKeyForConfigPostgres(config)
  }
  if (config?.db?.dialect=='sqlite') {
    return _cacheKeyForConfigSqlite(config)
  }  
  return `no_dialect`
}

function cacheKey(config) {
  const key = _cacheKeyForConfig(config)
  return key
}

export default cacheKey