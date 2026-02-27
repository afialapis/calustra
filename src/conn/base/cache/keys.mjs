import { isCalustraSelector } from '#conn-base/api/checks.mjs'

function _getConfigCacheKey(config) {
  const cache_key= config.dialect=='postgres'
    ? `calustra-${config.dialect}-${config?.database || 'nodatabase'}-${config?.host || 'nohost'}-${config?.port || 'noport'}-${config?.user || 'nouser'}`
    : config.dialect=='sqlite'
    ? `calustra-${config.dialect}-${config?.filename || 'nofilename'}`
    : `calustra-${config.dialect}-nodata`

  return cache_key
}


async function _getSelectorCacheKey(cache, selector) {
  const current_keys = await cache.getKeys()

  if ( (!current_keys) || (current_keys.length==0)) {
    return undefined
  }

  const cache_key= current_keys
    .filter((key) => key.indexOf('calustra')==0)
    .find((key) => key.indexOf(selector)>=0)

  return cache_key
}


async function getConnectionCacheKey(cache, configOrSelector) {

  if (isCalustraSelector(configOrSelector)) {
    const k = await _getSelectorCacheKey(cache, configOrSelector)
    return k
  }
  
  return _getConfigCacheKey(configOrSelector)
}


export {getConnectionCacheKey}