import {getOrSetModelFromCache, getModelFromCache} from './cache'
import getConnection from './getConnectionWrap'
import CalustraModelPostgres from './models/postgres'
import CalustraModelSQLite from './models/sqlite'

function _isCalustraModel(obj) {
  try {
    return obj.constructor.name.indexOf('CalustraModel')>=0
  } catch(e) {}
  return false
}

function _isSelector(configOrSelector) {
  return typeof configOrSelector == 'string'
}


function _initModel(connConfig, tableName, options) {
    let model
    
    if (connConfig.dialect == 'postgres') {
      model = new CalustraModelPostgres(connConfig, tableName, options)
    }
    else if (connConfig.dialect == 'sqlite') {
      model = new CalustraModelSQLite(connConfig, tableName, options)
    } else {
      throw `getModel: ${connConfig.dialect} is not a supported dialect`
    }

    return model
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

  const model= getOrSetModelFromCache(connection, tableName, options, () => {
    return _initModel(connection.config, tableName, options)
  }) 

  try {
    logger.set_prefix(logger_prev_prefix)
  } catch(_) {}

  return model
}



export default getModel