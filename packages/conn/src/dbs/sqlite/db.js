import sqlite3 from 'sqlite3'
import defaults from './config'
import cache from '../../cache'
import merge from '../../util/merge'

function _initDb (config) {
  if (config.verbose) {
    sqlite3.verbose()
  }

  const driver= config.cached
    ? sqlite3.cached.Database
    : sqlite3.Database
  
  let db = new driver(config.filename)

  const extra= ['trace', 'profile', 'buyTimeout']
  extra.map((opt) => {
    if (config[opt]!=undefined) {
      db.configure(opt, config[opt])
    }
  })

  return db
}

function getDb (config, logger) {
  const conn = merge(defaults.connection, config?.connection || {})

  const cache_key= `calustra-${conn?.dialect}-${conn?.filename}`

  logger.debug(`Connection will be cached as ${cache_key}`)

  const db= cache.getOrSetItem(cache_key, () => _initDb (conn))

  return db
}

export {getDb}

