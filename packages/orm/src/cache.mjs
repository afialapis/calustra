import {initCache} from 'cacheiro'

const cache = initCache('raw')

function _getModelCacheKey(connection, modelConfig) {
  const config= connection.config
  const conn_key= config.dialect=='postgres'
    ? `calustra-${config.dialect}-${config?.database || 'nodatabase'}-${config?.host || 'nohost'}-${config?.port || 'noport'}-${config?.user || 'nouser'}`
    : config.dialect=='sqlite'
    ? `calustra-${config.dialect}-${config?.filename || 'nofilename'}`
    : `calustra-${config.dialect}-nodata`
 
  const _cbd_key= `checkBeforeDelete:${modelConfig?.checkBeforeDelete===true ? 'yes' : 'no'}`
  const _udf_key= `useDateFields:${modelConfig?.useDateFields===true ? 'default' : modelConfig?.useDateFields==undefined ? 'no' : `${modelConfig?.useDateFields?.fieldNames}`}`
  const _tri_key= `triggers:${modelConfig?.triggers==undefined ? 'no' : Object.values(modelConfig.triggers).join(',')}`
  const opt_key= `${_cbd_key};${_udf_key};${_tri_key}`

  return `${modelConfig.name}-${conn_key}-${opt_key}`
}


function getOrSetModelFromCache(connection, modelConfig, initModelCallback) {
  const logger= connection.log
  const cache_key = _getModelCacheKey(connection, modelConfig)

  const model = cache.getOrSetItem(cache_key, 
    () => {
      logger.debug(`Model retrieved from cache with ${cache_key}`)
    },
    () => {
      const model= initModelCallback()

      if (model==undefined) {
        logger.error(`[calustra-orm] ${model.name} model could not be inited`)
        throw `[calustra-orm] ${model.name} model could not be inited`
      }

      model.uncache = () => {
        cache.unsetItem(cache_key)
      }
      
      logger.debug(`[calustra-orm] ${model.name} model inited and cached as ${cache_key}`)
      return model
    })
  
    return model

}


export {getOrSetModelFromCache}