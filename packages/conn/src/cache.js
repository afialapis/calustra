import {initCache} from 'cacheiro'

const cache = initCache('raw')



function getConnectionCacheKey(config) {
  const cache_key= config.dialect=='postgres'
    ? `calustra-${config.dialect}-${config?.database || 'nodatabase'}-${config?.host || 'nohost'}-${config?.port || 'noport'}-${config?.user || 'nouser'}`
    : config.dialect=='sqlite'
    ? `calustra-${config.dialect}-${config?.filename || 'nofilename'}`
    : `calustra-${config.dialect}-nodata`

  return cache_key
}


function getConnectionFromCache(selector, logger, cache_fallback= false, cache_error_log= true) {

  const current_keys = cache.getKeys()

  if ( (!current_keys) || (current_keys.length==0)) {
    if (cache_error_log) {
      logger.error(`No cached connections are available.`)
    }
    return undefined
  }

  const key_for_selector= current_keys.find((key) => key.indexOf(selector)>=0)

  if (key_for_selector!=undefined) {
    logger.debug(`Connection retrieved from cache with selector ${selector}`)
    return cache.getItem(key_for_selector)
  }

  if (key_for_selector==undefined) {
    if (cache_fallback) {
      if (current_keys.length>=1) {
        const first= current_keys[0]
        logger.warn(`Connection retrieved from cache with key ${first} (BUT selector ${selector} did not match any cached connection)`)
        return cache.getItem(first)
      }
    } 
    
    if (cache_error_log) {
      logger.error(`Could not find elements for selector ${selector}. Available ones are: ${current_keys.join(', ')}.`)
    }
    return undefined
  }
}

function getOrSetConnectionFromCache(config, logger, initConnectionCallback) {
  const cache_key= getConnectionCacheKey(config)
  const conn = cache.getOrSetItem(cache_key, 
    () => {
      logger.debug(`Connection retrieved from cache with ${cache_key}`)
    },
    () => {
      const conn= initConnectionCallback()

      if (conn==undefined) {
        logger.error(`${config.dialect} is not a supported dialect`)
        throw `[calustra-conn] ${config.dialect} is not a supported dialect`
      }

      conn.uncache = () => {
        cache.unsetItem(cache_key)
        logger.debug(`Connection removed from cache with ${cache_key}`)
      }
      
      logger.debug(`Connection inited and cached as ${cache_key}`)
      return conn
    })  
  return conn
}

function getQueryResultsCacheKey(config, queryName) {
  const conn_key= getConnectionCacheKey(config)
  return `${queryName}-${conn_key}`
}


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


export {getConnectionCacheKey, getConnectionFromCache, getOrSetConnectionFromCache, getOrSetQueryResultsFromCache}