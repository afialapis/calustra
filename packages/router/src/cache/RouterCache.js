import cacheKey from './cacheKey'

//
// TODO A real cache
//

const _ROUTER_CACHE = {
  /*
    [db_key]: { 
      'db': <calustra>,
      'models': {
        [name]: <calustra-orm model>,
      }
    }
  }*/
}

class RouterCache {

  constructor() {
  }

  saveDb(db) {
    const key= cacheKey(db.config)
    _ROUTER_CACHE[key]= {
      'db': db,
      'models': {}
    }
  }

  saveModel(db, tablename, model) {
    const key= cacheKey(db.config)
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

  getDb(selector) {
    const key= this._getKeyFor(selector)
    if (key!=undefined) {
      return _ROUTER_CACHE[key]['db']
    }

    return undefined
  }

  getModel(selector, tablename) {
    const key= this._getKeyFor(selector)
    if (key!=undefined) {
      try {
        return _ROUTER_CACHE[key]['models'][tablename]
      } catch(e) {
        console.error(`[calustra-router] Could not find model for ${tablename} in ${key}`)
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