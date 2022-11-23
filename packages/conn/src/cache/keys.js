import cache from './store'
import { isCalustraSelector } from '../checks'

function _getConfigCacheKey(config) {
  const cache_key= config.dialect=='postgres'
    ? `calustra-${config.dialect}-${config?.database || 'nodatabase'}-${config?.host || 'nohost'}-${config?.port || 'noport'}-${config?.user || 'nouser'}`
    : config.dialect=='sqlite'
    ? `calustra-${config.dialect}-${config?.filename || 'nofilename'}`
    : `calustra-${config.dialect}-nodata`

  return cache_key
}


function _getSelectorCacheKey(selector) {
  const current_keys = cache.getKeys()

  if ( (!current_keys) || (current_keys.length==0)) {
    return undefined
  }

  const cache_key= current_keys
    .filter((key) => key.indexOf('calustra')==0)
    .find((key) => key.indexOf(selector)>=0)

  return cache_key

}


function getConnectionCacheKey(configOrSelector) {

  if (isCalustraSelector(configOrSelector)) {
    return _getSelectorCacheKey(configOrSelector)
  }
  
  return _getConfigCacheKey(configOrSelector)
}

function getQueryResultsCacheKey(config, queryName) {
  const conn_key= getConnectionCacheKey(config)
  return `${queryName}-${conn_key}`
}




export {getConnectionCacheKey, getQueryResultsCacheKey}