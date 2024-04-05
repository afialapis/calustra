import {
  cacheConnectionGet, 
  cacheConnectionSet, 
  cacheConnectionUnset,
  cacheConnectionGetAll,
  cacheConnectionUnsetAll
} from './cache/index.mjs'

import {initLogger} from './logger/index.mjs'
import {initConnection} from './dbs/index.mjs'
import { isCalustraConnection, isCalustraSelector } from './checks.mjs'


export async function getConnection (configOrSelector, options) {
  const log = initLogger(options?.log)
  const nocache = options?.cache === false
  const reset = (options?.reset === true) || (options?.cache?.clean === true)

  // is it already a connection?
  if (isCalustraConnection(configOrSelector)) {
    log.warn(`[calustra] getConnection() called using an actual connection (${configOrSelector.connid}). Returning it.`)
    return configOrSelector
  }
  
  // check if connection is already cached
  if (! nocache) {
    const cachedConn= await cacheConnectionGet(configOrSelector)
    if (cachedConn) {
      // Lets ignore and rebuild the connection if:
      //  -- it is closed
      //  -- options.reset is true (in this cache, cache store is inited in clean mode)
      if ((!cachedConn.isOpen)  || reset) {

        log.silly(`[calustra] getConnection() cached connection found (${cachedConn.connid}), but, let's reinit it. Still open? ${cachedConn.isOpen}. Reset ${reset}. NoCache? ${nocache}`)
        
        // insist to actually close it
        try { 
          cachedConn.close() 
        } catch(_) {}

        await cacheConnectionUnset(cachedConn)
      } else {

        log.silly(`[calustra] getConnection() cached connection found (${cachedConn.connid}). Reusing it.`)


        // update connection and refresh cache
        if (options) {
          await cacheConnectionUnset(cachedConn)
          cachedConn.updateOptions(options)
          await cacheConnectionSet(cachedConn)
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
    const cacheKey = await cacheConnectionSet(conn)
    log.silly(`[calustra] getConnection() Initing a new connection (${conn.connid}) and cached it with cache key ${cacheKey}`)
  } else {
    log.silly(`[calustra] getConnection() Initing a new connection (${conn.connid}) but not caching it.`)
  }

  return conn
}



export async function dropConnection(configOrSelector) {
  const conn = await cacheConnectionGet(configOrSelector) 
  if (conn) {
    conn.close()
    await cacheConnectionUnset(conn)
  }
}

export async function dropConnections() {
  const conns = await cacheConnectionGetAll()
  conns.map(c => {
    c.close()
    //removeConnectionFromCache(c.config)
  })
  await cacheConnectionUnsetAll()
}

