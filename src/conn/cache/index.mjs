import { getConnectionCacheKey } from './keys.mjs'
import { cacheConnectionStoreInit,
         cacheConnectionStoreGet } from './store.mjs'

export async function cacheConnectionGet(configOrSelector, options) {
  const cache = await cacheConnectionStoreInit(options)
  
  const cacheKey = await getConnectionCacheKey(cache, configOrSelector)

  const cachedConn = cache.getItem(cacheKey)

  return cachedConn
}

export async function cacheConnectionGetAll() {
  const cache = cacheConnectionStoreGet()
  if (! cache) {
    return []
  }

  const cacheKeys = await cache.getKeys()

  let connections = []
  for (const key of cacheKeys) {
    connections.push(
      await cache.getItem(key)
    )
  }

  return connections
}

export async function cacheConnectionSet(connection) {

  const cache = await cacheConnectionStoreInit(connection.options)
  
  const cacheKey= await getConnectionCacheKey(cache, connection.config)
  await cache.setItem(cacheKey, connection)

  connection.uncache = async () => {
    await cache.unsetItem(cacheKey)
  }

  return cacheKey
}

export async function cacheConnectionUnset(connection) {
  const cache = cacheConnectionStoreGet()
  if (! cache) {
    return []
  }

  const cacheKey = await getConnectionCacheKey(cache, connection.config)
  if (cacheKey) {
    await cache.unsetItem(cacheKey)
  }
  return cacheKey
}


export async function cacheConnectionUnsetAll() {
  const cache = cacheConnectionStoreGet()
  if (! cache) {
    return []
  }

  await cache.unsetAll()
}










