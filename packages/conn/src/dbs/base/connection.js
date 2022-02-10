/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "query|value|options|schema|tableName|^_" }]*/

import {formatQuery, queryDescription} from 'calustra-query'
import Logger       from '../../util/logger'


class CalustraConnBase {
 
  constructor (config) {
    this.config= config
    const options = config?.options || {}
    if (options?.log==undefined || typeof options?.log == 'string') {
      this.log= new Logger(options?.log || 'info')
    } else {
      this.log = options.log
    }
    this.log.info(`Initing connection: ${JSON.stringify(this.config.connection)}`)
  }

  get dialect() {
    throw 'CalustraConnBase: get dialect() not implemented"'
  }

  openTransaction() {
    throw 'CalustraConnBase: openTransaction() not implemented"'
  }  

  close () {
    throw 'CalustraConnBase: close() not implemented"'
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
        this.log.debug(this.formatQuery(query, values))
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

  async getTableNames(schema= 'public') {
    throw 'CalustraConnBase: getTableNames() not implemented"'
  }  

  async getTableDetails(tableName, schema= 'public') {
    throw 'CalustraConnBase: getTableDetails() not implemented"'
  }    

}

export default CalustraConnBase