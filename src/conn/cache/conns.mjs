import { getConnectionCacheKey, getModelCacheKey } from './keys.mjs'
import cache from './store.mjs'


function removeConnectionFromCache(configOrSelector) {

  const cacheKey = getConnectionCacheKey(configOrSelector)
  if (cacheKey) {
    cache.unsetItem(cacheKey)
  }
}

function getConnectionFromCache(configOrSelector) {

  const cacheKey = getConnectionCacheKey(configOrSelector)

  const cachedConn = cache.getItem(cacheKey)

  if (cachedConn) {
    if (cachedConn.isOpen) {
      return cachedConn
    } else {
      cache.unsetItem(cacheKey)
    }
  }

  return undefined
}

function saveConnectionToCache(connection) {
  const cacheKey= getConnectionCacheKey(connection.config)

  connection.uncache = () => {
    cache.unsetItem(cacheKey)
    //console.log(`Connection removed from cache with ${cacheKey}`)
  }
  
  cache.setItem(cacheKey, connection)
  //console.log(`Connection cached as ${cacheKey}`)
  return connection  
}

function getOrSetModelFromCache(connection, modelOptions, initModelCallback) {
  const logger= connection.log
  const cache_key = getModelCacheKey(connection, modelOptions)

  const model = cache.getOrSetItem(cache_key, 
    () => {
      logger.debug(`Model retrieved from cache with ${cache_key}`)
    },
    () => {
      const model= initModelCallback()

      if (model==undefined) {
        logger.error(`[calustra-conn] ${model.name} model could not be inited`)
        throw `[calustra-conn] ${model.name} model could not be inited`
      }

      model.uncache = () => {
        cache.unsetItem(cache_key)
      }
      
      logger.debug(`[calustra-conn] ${model.name} model inited and cached as ${cache_key}`)
      return model
    })
  
    return model

}



export {
  getConnectionFromCache, 
  saveConnectionToCache, 
  removeConnectionFromCache,
  getOrSetModelFromCache
}