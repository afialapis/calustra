import sqlite3 from 'sqlite3'
import defaults from './config'
import cache from '../../cache'
import merge from '../../util/merge'

function _initDb (config) {
  const mconfig = merge(defaults, config)

  if (mconfig.verbose) {
    sqlite3.verbose()
  }

  const driver= mconfig.cached
    ? sqlite3.cached.Database
    : sqlite3.Database
  
  let db = new driver(mconfig.filename)

  const extra= ['trace', 'profile', 'buyTimeout']
  extra.map((opt) => {
    if (mconfig[opt]!=undefined) {
      db.configure(opt, mconfig[opt])
    }
  })

  return db
}

function getDb (config) {
  const cache_key= JSON.stringify(config)

  const db= cache.getOrSetItem(cache_key, () => {
    return _initDb (config)
  })

  return db
}

export {getDb}

