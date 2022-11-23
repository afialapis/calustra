import {
  getConnectionFromCache, 
  saveConnectionToCache, 
  removeConnectionFromCache
} from './cache/conns'
import Logger from './util/logger'
import CalustraConnPG from './dbs/postgres/connection'
import CalustraConnLT from './dbs/sqlite/connection'
import { isCalustraConnection, isCalustraSelector } from './checks'


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
    //console.log('++ getConnection - from cache ')
    return cachedConn
  }
  
  if (isCalustraSelector(configOrSelector)) {
    throw `[calustra-conn] Could not get connection for selector ${configOrSelector}`
  }

  //console.log('++ getConnection - from config (saved to cache) ')

  const conn= _initConnection(configOrSelector, options)
  saveConnectionToCache(conn)
  return conn
}


export default getConnection