import { isCalustraConnection } from '../checks.mjs'
import { getConnectionCacheKey, getModelCacheKey } from './keys.mjs'
import cache from './store.mjs'


export function removeConnectionFromCache(configOrSelector) {

  const cacheKey = getConnectionCacheKey(configOrSelector)
  if (cacheKey) {
    cache.unsetItem(cacheKey)
  }
}

export function getConnectionFromCache(configOrSelector) {

  const cacheKey = getConnectionCacheKey(configOrSelector)

  const cachedConn = cache.getItem(cacheKey)

  return cachedConn
}

export function getConnectionsFromCache() {
  const cacheKeys = cache.getKeys()

  const conns = cacheKeys
    .map(ck => cache.getItem(ck))
    .filter(conn => isCalustraConnection(conn))

  return conns
}

export function clearCache() {
  const cacheKeys = cache.getKeys()

  cacheKeys.map(ck => cache.unsetItem(ck))
}

export function saveConnectionToCache(connection) {
  const cacheKey= getConnectionCacheKey(connection.config)

  connection.uncache = () => {
    cache.unsetItem(cacheKey)
    //console.log(`Connection removed from cache with ${cacheKey}`)
  }
  
  cache.setItem(cacheKey, connection)
  //console.log(`Connection cached as ${cacheKey}`)
  return connection  
}

export function getOrSetModelFromCache(connection, modelOptions, initModelCallback) {
  const logger= connection.log
  const cache_key = getModelCacheKey(connection, modelOptions)

  const model = cache.getOrSetItem(cache_key, 
    () => {
      logger.silly(`[calustra] Model retrieved from cache with ${cache_key}`)
    },
    () => {
      const model= initModelCallback()

      if (model==undefined) {
        logger.error(`[calustra] ${model.name} model could not be inited`)
        throw new Error(`[calustra] ${model.name} model could not be inited`)
      }

      model.uncache = () => {
        cache.unsetItem(cache_key)
      }
      
      logger.silly(`[calustra] ${model.name} model inited and cached as ${cache_key}`)
      return model
    })
  
    return model
}

