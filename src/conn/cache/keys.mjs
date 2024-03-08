import cache from './store.mjs'
import { isCalustraSelector } from '../checks.mjs'

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



function getModelCacheKey(connection, modelOptions) {
  const config= connection.config
  const conn_key= config.dialect=='postgres'
    ? `calustra-${config.dialect}-${config?.database || 'nodatabase'}-${config?.host || 'nohost'}-${config?.port || 'noport'}-${config?.user || 'nouser'}`
    : config.dialect=='sqlite'
    ? `calustra-${config.dialect}-${config?.filename || 'nofilename'}`
    : `calustra-${config.dialect}-nodata`
 
  const _cbd_key= `checkBeforeDelete:${modelOptions?.checkBeforeDelete===true ? 'yes' : 'no'}`
  const _udf_key= `useDateFields:${modelOptions?.useDateFields===true ? 'default' : modelOptions?.useDateFields==undefined ? 'no' : `${modelOptions?.useDateFields?.fieldNames}`}`
  const _tri_key= `triggers:${modelOptions?.triggers==undefined ? 'no' : Object.values(modelOptions.triggers).join(',')}`
  const opt_key= `${_cbd_key};${_udf_key};${_tri_key}`

  return `${modelOptions.name}-${conn_key}-${opt_key}`
}

export {getConnectionCacheKey, getQueryResultsCacheKey, getModelCacheKey}