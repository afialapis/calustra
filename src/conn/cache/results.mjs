import { getQueryResultsCacheKey } from './keys.mjs'
import cache from './store.mjs'


async function getOrSetQueryResultsFromCache(config, queryName, logger, queryResultsCallback) {
  const cache_key= getQueryResultsCacheKey(config, queryName)
  const data = await cache.getOrSetItemAsync(cache_key, 
    async () => {
      logger.debug(`Query results retrieved from cache with ${cache_key}`)
    },
    async () => {
      const data= await queryResultsCallback()

      logger.debug(`Query results for ${queryName} retrieved and cached as ${cache_key}`)
      return data
    })  
  return data
}


export {getOrSetQueryResultsFromCache}