import cacheKey from './cacheKey'

//
// TODO A real cache
//

const _ROUTER_CACHE = {
  /*
    [conn33_key]: { 
      'connection': <calustra>,
      'models': {
        [name]: <calustra-orm model>,
      }
    }
  }*/
}

class RouterCache {

  constructor() {
  }

  saveConnection(connection) {
    const key= cacheKey(connection.config)
    _ROUTER_CACHE[key]= {
      'connection': connection,
      'models': {}
    }
  }

  saveModel(connection, tablename, model) {
    const key= cacheKey(connection.config)
    _ROUTER_CACHE[key]['models'][tablename]= model
  }

  _getKeyFor(selector) {
    let thekey= undefined
    const keys= Object.keys(_ROUTER_CACHE)
    if (selector==undefined) {
      if (keys.length==1) {
        thekey= keys[0]
      }
    } else {
      keys.map((key) => {
        if (key.indexOf(selector)>=0) {
          thekey= key
          return
        }
      })
    }

    if (thekey==undefined) {
      console.error(`[calustra-router] Could not find elements for selector ${selector}. Available ones are: ${keys.join(', ')}.`)
    }
    return thekey
  }

  getConnection(selector) {
    const key= this._getKeyFor(selector)
    if (key!=undefined) {
      return _ROUTER_CACHE[key]['connection']
    }

    return undefined
  }

  getModel(selector, tablename) {
    const the_tablename = tablename!=undefined 
      ? tablename
      : selector
    const the_selector = tablename!=undefined 
    ? selector
    : undefined
    const key= this._getKeyFor(the_selector)
    if (key!=undefined) {
      try {
        return _ROUTER_CACHE[key]['models'][the_tablename]
      } catch(e) {
        console.error(`[calustra-router] Could not find model for ${the_tablename} in ${key}`)
      }
    }

    return undefined
  }

  invalidate(selector) {
    const key= this._getKeyFor(selector)
    if (key!=undefined) {
      try {
        delete _ROUTER_CACHE[key]
      } catch(e) {}
    }
  }

}

export default RouterCache