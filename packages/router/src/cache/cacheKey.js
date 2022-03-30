function _cacheKeyForConfigPostgres(config) {
  return `dialect:postgres;host:${config?.connection?.host};port:${config?.connection?.port};database:${config?.connection?.database}`
}

function _cacheKeyForConfigSqlite(config) {
  return `dialect:sqlite;filename:${config?.connection?.filename}`
}

function _cacheKeyForConfig(config) {
  if (config?.connection?.dialect=='postgres') {
    return _cacheKeyForConfigPostgres(config)
  }
  if (config?.connection?.dialect=='sqlite') {
    return _cacheKeyForConfigSqlite(config)
  }  
  return `no_dialect`
}

function cacheKey(config) {
  const key = _cacheKeyForConfig(config)
  return key
}

export default cacheKey