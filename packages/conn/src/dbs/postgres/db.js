import pgPromise  from  'pg-promise'
import defaults from './config'
import cache from '../../cache'
import merge from '../../util/merge'

function getDb (config, logger) {
  const conn = merge(defaults.db, config.db || {})

  const cache_key= `calustra-${conn?.dialect}-${conn?.database}-${conn?.host}-${conn?.port}-${conn?.user}`

  logger.debug(`Connection will be cached as ${cache_key}`)

  const db = cache.getOrSetItem(cache_key, () => {
    
    const pgp = pgPromise()
    const db  = pgp(conn)
    
    //logger.verbose(db)

    return db
  })

  return [db, () => cache.unsetItem(cache_key)]
}

export {getDb}