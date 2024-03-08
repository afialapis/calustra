import { getConnectionCacheKey} from './keys.mjs'
import cache from './store.mjs'



export function cacheConnectionGet(configOrSelector) {

  const cacheKey = getConnectionCacheKey(configOrSelector)

  const cachedConn = cache.getItem(cacheKey)

  return cachedConn
}

export function cacheConnectionGetAll() {
  const cacheKeys = cache.getKeys()

  const connections = cacheKeys
    .map(ck => cache.getItem(ck))

  return connections
}

export function cacheConnectionSet(connection) {
  const cacheKey= getConnectionCacheKey(connection.config)
  cache.setItem(cacheKey, connection)

  connection.uncache = () => {
    cache.unsetItem(cacheKey)
  }

  return cacheKey
}

export function uncacheConnection(connection) {
  const cacheKey = getConnectionCacheKey(connection.config)
  if (cacheKey) {
    cache.unsetItem(cacheKey)
  }
  return cacheKey
}


export function clearCache() {
  const cacheKeys = cache.getKeys()

  cacheKeys.map(ck => cache.unsetItem(ck))
}










