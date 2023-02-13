/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "query|value|options|schema|tableName|^_" }]*/

import {formatQuery, queryDescription} from 'calustra-query'
import {getOrSetQueryResultsFromCache} from '../../cache/results.mjs'

class CalustraConnBase {
 
  constructor (config, logger) {
    this.config= config
    this.log= logger
    
    this.log.debug(`Opening database: ${JSON.stringify(this.config)}`)
    this.db = this.openDb(this.config)
    
    this.log.info(`Using database ${config?.database}`)

    this.is_open= true
  }

  get dialect() {
    return this.config?.dialect || 'unknown'
  }

  openDb() {
    throw 'CalustraConnBase: openDb() not implemented"'
  }

  closeDb () {
    throw 'CalustraConnBase: closeDb() not implemented"'
  }  

  get isOpen () {
    return this.is_open
  }

  openTransaction() {
    throw 'CalustraConnBase: openTransaction() not implemented"'
  }  

  // method assigned on the fly
  // uncache() {}


  close () {
    this.is_open= false
    this.closeDb()
    this.uncache()
  }



  formatQuery (query, values) {
    return formatQuery(query, values)
  }

  async _logQuery (query, values, options, run_callback, msg_callback) {
    const started = Date.now()
    
    try {

      const data= await run_callback()

      if (options?.log!==false) {
        const elapsed = parseFloat( (Date.now() - started) / 1000.0 ).toFixed(2)
        this.log.silly(this.formatQuery(query, values))
        const msg= msg_callback(data, elapsed)
        this.log.info(msg)
      }

      return data
    } catch (error) {
      this.log.error(this.formatQuery(query, values))
      this.log.error(error.constructor.name)
      this.log.error(error.stack)
    }

    return undefined
  }

  async _execute (query, values, options, callback) {
    return this._logQuery (query, values, options, 

      async () => {
        const data = await callback()
        return data
      }, 
      (_data, time) => {
        const desc= queryDescription(query, undefined, time)
        return desc
      })
  }

  async _executeAndCount (query, values, options, callback) {
    return this._logQuery (query, values, options, 

      async () => {
        const res = await callback()
        return res

      }, 
      (rows, time) => {
        const desc= queryDescription(query, rows, time)
        return desc
      })      
  }  

  async _select (query, values, options, callback) {

    return this._logQuery (query, values, options, 
      
      async () => {
        const data = await callback()
        return data
      }, 

      (data, time) => {
        const desc= queryDescription(query, data.length, time) 
        return desc
      }) 

  }

  async selectOne (query, values, options) {
    const data = await this.select(query, values, options)

    const omitWarning = options!=undefined
      ? options.omitWarning===true ? true : false
      : false
  
    if (data == undefined) {
      return undefined
    }

    if (data.length>1 && !omitWarning) {
      this.log.warn('Returned ' + data.length + ' rows, but expected just 1')
    }
  
    if (data.length>0)
      return data[0]
    
    return {}
  }  

  async execute (query, values, options) {
    throw 'CalustraConnBase: execute() not implemented"'
  }

  async executeAndCount (query, values, options) {
    throw 'CalustraConnBase: executeAndCount() not implemented"'
  }  

  async select (query, values, options) {
    throw 'CalustraConnBase: select() not implemented"'
  }

  async getOrSetCachedTableNames(callback, schema= 'public') {
    if (this._table_names == undefined) {
      this._table_names= await callback(schema)
    }
    return this._table_names
  }

  async getTableNamesFromDb(schema= 'public') {
    throw 'CalustraConnBase: getTableNamesFromDb() not implemented"'
  }  
  
  async getTableNames(schema= 'public') {
    const queryName = `${schema}.tablenames`

    const data= await getOrSetQueryResultsFromCache(this.config, queryName, this.log, async () => {
      const results= await this.getTableNamesFromDb(schema)
      return results
    })

    return data
  }  


  async getTableDetailsFromDb(tableName, schema= 'public') {
    throw 'CalustraConnBase: getTableDetailsFromDb() not implemented"'
  }    

  async getTableDetails(tableName, schema= 'public') {
    const queryName = `${schema}.${tableName}.details`

    const data= await getOrSetQueryResultsFromCache(this.config, queryName, this.log, async () => {
      const results= await this.getTableDetailsFromDb(tableName, schema)
      return results
    })

    return data
  }  

}

export default CalustraConnBase