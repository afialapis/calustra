import {initCache} from 'cacheiro'

const cache = initCache('raw')




function getModelCacheKey(connection, tableName, options) {
  const config= connection.config
  const conn_key= config.dialect=='postgres'
    ? `calustra-${config.dialect}-${config?.database || 'nodatabase'}-${config?.host || 'nohost'}-${config?.port || 'noport'}-${config?.user || 'nouser'}`
    : config.dialect=='sqlite'
    ? `calustra-${config.dialect}-${config?.filename || 'nofilename'}`
    : `calustra-${config.dialect}-nodata`
 
  const _cbd_key= `checkBeforeDelete:${options?.checkBeforeDelete===true ? 'yes' : 'no'}`
  const _udf_key= `useDateFields:${options?.useDateFields===true ? 'default' : options?.useDateFields==undefined ? 'no' : `${options?.useDateFields?.fieldnames}`}`
  const _tri_key= `triggers:${options?.triggers==undefined ? 'no' : Object.values(options.triggers).join(',')}`
  const opt_key= `${_cbd_key};${_udf_key};${_tri_key}`

  return `${tableName}-${conn_key}-${opt_key}`
}



function getModelFromCache(selector, logger) {

  const current_keys = cache.getKeys()

  if ( (!current_keys) || (current_keys.length==0)) {
    logger.error(`No cached models are available.`)
    return undefined
  }

  const key_for_selector= current_keys.find((key) => key.indexOf(selector)>=0)

  if (key_for_selector!=undefined) {
    logger.debug(`Model retrieved from cache with selector ${selector}`)
    return cache.getItem(key_for_selector)
  }

  logger.error(`Could not find models for selector ${selector}. Available ones are: ${current_keys.join(', ')}.`)
  return undefined
}


function getOrSetModelFromCache(connection, tableName, options, initModelCallback) {
  const logger= connection.log
  const cache_key = getModelCacheKey(connection, tableName, options)

  const model = cache.getOrSetItem(cache_key, 
    () => {
      logger.debug(`Model retrieved from cache with ${cache_key}`)
    },
    () => {
      const model= initModelCallback()

      if (model==undefined) {
        logger.error(`${tableName} model could not be inited`)
        throw `[calustra-orm] ${tableName} model could not be inited`
      }

      model.uncache = () => {
        cache.unsetItem(cache_key)
      }
      
      logger.debug(`${tableName} model inited and cached as ${cache_key}`)
      return model
    })
  
    return model

}


export {getModelCacheKey, getModelFromCache, getOrSetModelFromCache}