import {
  cacheConnectionGet, 
  cacheConnectionSet, 
  uncacheConnection,
  cacheConnectionGetAll,
  clearCache
} from './cache/index.mjs'

import {initLogger} from './logger/index.mjs'
import {initConnection} from './dbs/index.mjs'
import { isCalustraConnection, isCalustraSelector } from './checks.mjs'


export function getConnection (configOrSelector, options) {
  const log = initLogger(options?.log)
  const nocache = options?.nocache === true
  const reset = options?.reset === true

  // is it already a connection?
  if (isCalustraConnection(configOrSelector)) {
    log.warn(`[calustra] getConnection() called using an actual connection (${configOrSelector.connid}). Returning it.`)
    return configOrSelector
  }
  
  // check if connection is already cached
  if (! nocache) {
    const cachedConn= cacheConnectionGet(configOrSelector)
    if (cachedConn) {
      // Lets ignore and rebuild the connection if:
      //  -- it is closed
      //  -- options.reset is true
      if ((!cachedConn.isOpen)  || reset) {

        log.silly(`[calustra] getConnection() cached connection found (${cachedConn.connid}), but, let's reinit it. Still open? ${cachedConn.isOpen}. Reset ${reset}. NoCache? ${nocache}`)
        
        // insist to actually close it
        try { 
          cachedConn.close() 
        } catch(_) {}

        uncacheConnection(cachedConn)
      } else {

        log.silly(`[calustra] getConnection() cached connection found (${cachedConn.connid}). Reusing it.`)


        // update connection and refresh cache
        if (options) {
          uncacheConnection(cachedConn)
          cachedConn.updateOptions(options)
          cacheConnectionSet(cachedConn)
        }

        return cachedConn
      }
    }
  }
  
  if (isCalustraSelector(configOrSelector)) {
    throw new Error(`[calustra] Could not get cached connection for selector ${configOrSelector}`)
  }
  
  
  const conn= initConnection(configOrSelector, options)
  if (nocache!==true) {
    const cacheKey = cacheConnectionSet(conn)
    log.silly(`[calustra] getConnection() Initing a new connection (${conn.connid}) and cached it with cache key ${cacheKey}`)
  } else {
    log.silly(`[calustra] getConnection() Initing a new connection (${conn.connid}) but not caching it.`)
  }

  return conn
}



export function dropConnection(configOrSelector) {
  const conn = cacheConnectionGet(configOrSelector) 
  if (conn) {
    conn.close()
    uncacheConnection(conn)
  }
}

export function dropConnections() {
  const conns = cacheConnectionGetAll()
  conns.map(c => {
    c.close()
    //removeConnectionFromCache(c.config)
  })
  clearCache()
}





/*

  // is it already a connection?
  if (isCalustraConnection(configOrSelector)) {
    
    const alreadyConn= configOrSelector

    // Lets ignore and rebuild the connection if:
    //  -- it is closed
    //  -- options.reset is true
    if ((! alreadyConn.isOpen) || (reset)) {

      log.silly(`[calustra] getConnection() called using an actual connection (${alreadyConn.connid}). Let's reinit it. Still open? ${alreadyConn.isOpen}. Reset ${reset}.`)
      
      // insist to actually close it
      try { 
        alreadyConn.close() 
      } catch(_) {}
      
      // clean cache
      uncacheConnection(alreadyConn)
      
      // reinit it using its own config
      return getConnection(alreadyConn.config, {
        ...alreadyConn.options,
        ...options || {}
      })
    }

    log.silly(`[calustra] getConnection() called using an actual connection (${alreadyConn.connid}). Reusing it.`)

    // update connection and refresh cache
    if (options) {
      uncacheConnection(alreadyConn)
      alreadyConn.updateOptions(options)
      if (! nocache) {
        cacheConnectionSet(alreadyConn)
      }
    }

    return alreadyConn
  }
*/