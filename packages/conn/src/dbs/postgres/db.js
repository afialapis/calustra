import pgPromise  from  'pg-promise'
import defaults from './config'
import cache from '../../cache'
import merge from '../../util/merge'

function _initDb (config) {
  const mconfig = merge(defaults, config)
  const pgp     = pgPromise()
  const db      = pgp(mconfig)

  return db
}

function getDb (config) {
  const cache_key= JSON.stringify(config)

  const db= cache.getOrSetItem(cache_key, () => {
    return _initDb (config)
  })

  return db
}

export {getDb}