import {
  getConnectionFromCache, 
  saveConnectionToCache, 
  removeConnectionFromCache
} from './cache/conns.mjs'

import CalustraConnPG from './dbs/postgres/connection.mjs'
import CalustraConnLT from './dbs/sqlite/connection.mjs'
import { isCalustraConnection, isCalustraSelector } from './checks.mjs'



function _initConnection(config, options) {
  const dialect = config?.dialect 

  if (dialect == 'postgres') {
    const conn= new CalustraConnPG(config, options)
    return conn
  }

  if (dialect == 'sqlite') {
    const conn= new CalustraConnLT(config, options)
    return conn
  }
  
  return undefined
}


function getConnection (configOrSelector, options) {
  const nocache = options?.nocache === true
  const reset = options?.reset === true
  
  // is it already a connection?
  if (isCalustraConnection(configOrSelector)) {
    const alreadyConn= configOrSelector

    // Lets ignore and rebuild the connection if:
    //  -- it iss cached but closed
    //   -- options.reset is true
    if ((! alreadyConn.isOpen) || (reset)) {
      removeConnectionFromCache(alreadyConn.config)
      return getConnection(alreadyConn.config, {
        ...alreadyConn.options,
        ...options || {}
      })
    }

    // lets clean cache in case
    if (nocache) {
      removeConnectionFromCache(alreadyConn.config)
    }

    return alreadyConn
  }

  const cachedConn= getConnectionFromCache(configOrSelector)
  if (cachedConn) {
    if (nocache || reset) {
      removeConnectionFromCache(configOrSelector)
    } else {
      return cachedConn
    }
  }
  
  if (isCalustraSelector(configOrSelector)) {
    throw new Error(`[calustra] Could not get connection for selector ${configOrSelector}`)
  }

  const conn= _initConnection(configOrSelector, options)
  if (nocache!==true) {
    saveConnectionToCache(conn)
  }
  return conn
}


export default getConnection