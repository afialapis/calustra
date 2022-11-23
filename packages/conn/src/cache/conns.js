import { getConnectionCacheKey } from './keys'
import cache from './store'


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

export {
  getConnectionFromCache, 
  saveConnectionToCache, 
  removeConnectionFromCache
}