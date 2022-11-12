import {getConnectionFromCache, getOrSetConnectionFromCache} from './cache'
import Logger from './util/logger'
import CalustraConnPG from './dbs/postgres/connection'
import CalustraConnLT from './dbs/sqlite/connection'

function _isCalustraConn(obj) {
  try {
    return obj.constructor.name.indexOf('CalustraConn')>=0
  } catch(e) {}
  return false
}

function _isSelector(configOrSelector) {
  return typeof configOrSelector == 'string'
}

function _initLogger(options) {
  let logger
  if (options?.log==undefined || typeof options?.log == 'string') {
    logger= new Logger(options?.log || 'info')
  } else {
    logger = options.log
  }

  return logger
}


function _initConnection(config, logger) {
  const dialect = config?.dialect 

  if (dialect == 'postgres') {
    const conn= new CalustraConnPG(config, logger)
    return conn
  }

  if (dialect == 'sqlite') {
    const conn= new CalustraConnLT(config, logger)
    return conn
  }
  
  return undefined
}



function getConnection (configOrSelector, options) {

  if (_isCalustraConn(configOrSelector)) {
    return configOrSelector
  }

  const logger= _initLogger(options)

  if (_isSelector(configOrSelector)) {
    const conn= getConnectionFromCache(configOrSelector, logger, options?.cache_fallback===true, options?.cache_error_log!==false)
    return conn
  }
  
  const config= configOrSelector

  const conn= getOrSetConnectionFromCache(config, logger, () => {
    return _initConnection(config, logger)
  })

  return conn
}


export default getConnection