import pgPromise  from  'pg-promise'
import defaults from './config'
import cache from '../../cache'
import merge from '../../util/merge'

function _initDb (config) {
  const mconfig = merge(defaults.connection, config.connection)
  const pgp     = pgPromise()
  const db      = pgp(mconfig)

  return db
}

function getDb (config) {
  const conn = config?.connection || {}
  const cache_key= `calustra-conn-${conn?.dialect}-${conn?.database}-${conn?.host}-${conn?.port}-${conn?.user}`

  const db= cache.getOrSetItem(cache_key, () => {
    return _initDb (conn)
  })

  return db
}

export {getDb}