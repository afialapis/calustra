import {
  getConnectionFromCache, 
  saveConnectionToCache, 
  removeConnectionFromCache,
  getConnectionsFromCache,
  clearCache
} from './cache/conns.mjs'

import {initConnection} from './dbs/index.mjs'
import { isCalustraConnection, isCalustraSelector } from './checks.mjs'


export function getConnection (configOrSelector, options) {
  const nocache = options?.nocache === true
  const reset = options?.reset === true
  
  // is it already a connection?
  if (isCalustraConnection(configOrSelector)) {
    const alreadyConn= configOrSelector

    // Lets ignore and rebuild the connection if:
    //  -- it iss cached but closed
    //   -- options.reset is true
    if ((! alreadyConn.isOpen) || (reset)) {
      
      // insis if not actually closed
      try { 
        alreadyConn.close() 
      } catch(_) {}

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
    if ((!cachedConn.isOpen) || nocache || reset) {
      
      // insis if not actually closed
      try { 
        cachedConn.close() 
      } catch(_) {}
      
      removeConnectionFromCache(configOrSelector)
    } else {
      return cachedConn
    }
  }
  
  if (isCalustraSelector(configOrSelector)) {
    throw new Error(`[calustra] Could not get connection for selector ${configOrSelector}`)
  }

  const conn= initConnection(configOrSelector, options)
  if (nocache!==true) {
    saveConnectionToCache(conn)
  }
  return conn
}



export function dropConnection(configOrSelector) {
  const conn = getConnectionFromCache(configOrSelector) 
  if (conn) {
    conn.close()
    removeConnectionFromCache(configOrSelector)
  }
}

export function dropConnections() {
  const conns = getConnectionsFromCache()
  conns.map(c => {
    c.close()
    //removeConnectionFromCache(c.config)
  })
  clearCache()
}