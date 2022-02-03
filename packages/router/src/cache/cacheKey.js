
import isCalustraConn from '../util/isCalustraConn'

function _cacheKeyForConfigPostgres(config) {
  return `dialect:postgres;host:${config.host};port:${config.port};database:${config.database}`
}

function _cacheKeyForConfigSqlite(config) {
  return `dialect:sqlite;filename:${config.filename}`
}

function _cacheKeyForConfig(config) {
  if (config.dialect=='postgres') {
    return _cacheKeyForConfigPostgres(config)
  }
  if (config.dialect=='sqlite') {
    return _cacheKeyForConfigSqlite(config)
  }  
  return `no_dialect`
}

function _cacheKeyForCalustraConn(conn) {
  return _cacheKeyForConfig(conn.config)
}

function cacheKey(dbOrConfig) {
  const key = isCalustraConn(dbOrConfig)
    ? _cacheKeyForCalustraConn(dbOrConfig)
    : _cacheKeyForConfig(dbOrConfig)
  return key
}

export default cacheKey