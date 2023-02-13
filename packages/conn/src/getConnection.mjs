import {
  getConnectionFromCache, 
  saveConnectionToCache, 
  removeConnectionFromCache
} from './cache/conns.mjs'
import Logger from './util/logger.mjs'
import CalustraConnPG from './dbs/postgres/connection.mjs'
import CalustraConnLT from './dbs/sqlite/connection.mjs'
import { isCalustraConnection, isCalustraSelector } from './checks.mjs'

function _initLogger(options) {
  let logger
  if (options?.log==undefined || typeof options?.log == 'string') {
    logger= new Logger(options?.log || 'info')
  } else {
    logger = options.log
  }

  return logger
}


function _initConnection(config, options) {
  const dialect = config?.dialect 
  const logger = _initLogger(options)

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
  
  // is it already a connection?
  if (isCalustraConnection(configOrSelector)) {
    const alreadyConn= configOrSelector

    // If already a connection and still open, return it as it is
    if (alreadyConn.isOpen) {
      removeConnectionFromCache(alreadyConn.config)
      saveConnectionToCache(alreadyConn)

      return alreadyConn
    }
    
    // If already a connection but closed, rebuild it with its properties
    return getConnection(alreadyConn.config, {
      log: alreadyConn.log,
      ...options
    })
  }

  const cachedConn= getConnectionFromCache(configOrSelector)
  if (cachedConn) {
    return cachedConn
  }
  
  if (isCalustraSelector(configOrSelector)) {
    throw `[calustra-conn] Could not get connection for selector ${configOrSelector}`
  }

  const conn= _initConnection(configOrSelector, options)

  if (options?.nocache!==true) {
    saveConnectionToCache(conn)
  }
  return conn
}


export default getConnection