/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "key|value" }]*/


class CacheStore {
  constructor () {
  }

  hasItem(key) {
    throw 'calustra-conn: CacheStore.hasItem() not implemented'
  }

  setItem(key, value) {
    throw 'calustra-conn: CacheStore.setItem() not implemented'
  }

  getItem(key) {
    throw 'calustra-conn: CacheStore.getItem() not implemented'
  }

  unsetItem(key) {
    throw 'calustra-conn: CacheStore.unsetItem() not implemented'
  }

  getOrSetItem(key, callback) {
    if (! this.hasItem(key)) {
      const value= callback()
      this.setItem(value)
      return value
    }

    return this.getItem(key)
  }
}
  

export default CacheStore
