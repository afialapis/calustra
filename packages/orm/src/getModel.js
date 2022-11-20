import {getModelFromCache} from './cache'
import getConnection from './getConnectionWrap'
import getModelFromConnection from './getModelFromConnection'

function _isCalustraModel(obj) {
  try {
    return obj.constructor.name.indexOf('CalustraModel')>=0
  } catch(e) {}
  return false
}

function _isSelector(configOrSelector) {
  return typeof configOrSelector == 'string'
}


const getModel = (connOrConfigOrSelector, tableName, options) => {

  if (_isCalustraModel(connOrConfigOrSelector)) {
    return connOrConfigOrSelector
  }

  const connection= getConnection(connOrConfigOrSelector, options)

  const logger= connection.log

  let logger_prev_prefix
  try {
    logger_prev_prefix= logger.prefix
    logger.set_prefix('calustra-orm')
  } catch(_) {}

  if (_isSelector(connOrConfigOrSelector)) {
    const model= getModelFromCache(connOrConfigOrSelector, logger)
    return model
  }

  const model= getModelFromConnection(connection, tableName, options) 

  try {
    logger.set_prefix(logger_prev_prefix)
  } catch(_) {}

  return model
}



export default getModel