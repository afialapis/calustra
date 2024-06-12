import {cacheiro} from 'cacheiro'
import { initLogger } from '../logger/index.mjs'

let cache 


function _cacheOptionsFromCalustraOptions(options, log= undefined) {
  const moptions = {
    type: 'memory',
    namespace: options?.cache?.namespace || 'calustra',
    version: options?.cache?.version,
    clean: options?.reset==true || options?.cache?.clean==true,
    ttl: options?.cache?.ttl || 86400 * 1000,
    log: log || initLogger(options?.cache?.log || options?.log)
  }

  if (options?.cache?.redis) {
    moptions.type= 'combined'
    moptions.redis = options.cache.redis
  }

  return moptions
}

export async function cacheConnectionStoreInit(options, log= undefined) {
  if (cache==undefined) {
    const coptions = _cacheOptionsFromCalustraOptions(options, log)
    cache = await cacheiro(coptions)
  }
  return cache
}

export function cacheConnectionStoreGet() {
  return cache
}
