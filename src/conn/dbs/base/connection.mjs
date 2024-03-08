/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "query|value|options|schema|tableName|^_" }]*/

import formatQuery from '../../../query/format.mjs'
import getQueryDescription from '../../../query/getDescription.mjs'
import {getOrSetQueryResultsFromCache} from '../../cache/results.mjs'
import Logger from '../../util/logger.mjs'
import {intre_now} from 'intre'
import merge from "../../util/merge.mjs"
import { getOrSetModelFromCache } from '../../cache/conns.mjs'



function _initLogger(options) {
  let logger
  if ( (options?.log==undefined) || (typeof options?.log == 'string')) {
    logger= new Logger(options?.log || 'info')
  } else {
    logger = options.log
  }

  return logger
}


class CalustraConnBase {
 
  constructor (config, options) {
    this.config= config
    this.options= options
    this.log = _initLogger(options)
    
    this.log.debug(`[calustra] Opening database ${this.configDescription}${this.options?.reset==true ? ' (reset)' : ''}${this.options?.nocache==true ? ' (nocache)' : ''}`)
    this.db = this.openDb(this.config)
    
    this.log.info(`[calustra] Using database ${config?.database}`)
    this.is_open= true
  }

  get dialect() {
    return this.config?.dialect || 'unknown'
  }

  get configDescription() {
    return this.dialect
  }

  openDb() {
    throw new Error ('CalustraConnBase: openDb() not implemented"')
  }

  closeDb () {
    throw new Error ('CalustraConnBase: closeDb() not implemented"')
  }  

  get isOpen () {
    return this.is_open==true
  }

  openTransaction() {
    throw new Error ('CalustraConnBase: openTransaction() not implemented"')
  }  

  // method assigned on the fly
  uncache() {}

  close () {
    this.is_open= false
    this.closeDb()
    this.uncache()
  }


  formatQuery (query, values) {
    return formatQuery(query, values)
  }

  async _runAndLogQuery (query, values, options, run_callback, msg_callback) {
    const started = Date.now()
    
    try {
      if (! this.isOpen) {
        throw new Error('Connection is closed')
      }

      const data= await run_callback()

      if (options?.log!==false) {
        const elapsed = parseFloat( (Date.now() - started) / 1000.0 ).toFixed(2)
        this.log.silly(`[calustra] ${this.formatQuery(query, values)}`)
        const msg= msg_callback(data, elapsed)
        if (options?.log === 'silly') {
          this.log.silly(`[calustra] ${msg}`)
        } else if (options?.log === 'debug') {
          this.log.debug(`[calustra] ${msg}`)
        } else {
          this.log.info(`[calustra] ${msg}`)
        }
      }

      return data
    } catch (error) {
      if (options?.silent_fail !== true) {
        throw error
      }
      
      if (options?.log!==false) {
        this.log.error(`[calustra] ${this.formatQuery(query, values)}`)
        this.log.error(`[calustra] ${error.constructor.name}`)
        this.log.error(error.stack)
      }
    }

    return undefined
  }

  async _execute (query, values, options, callback) {
    const msg_callback = (_data, time) => {
      const desc= getQueryDescription(query, undefined, time)
      return desc
    }

    return this._runAndLogQuery (query, values, options, callback, msg_callback)
  }

  async _executeAndCount (query, values, options, callback) {
    const msg_callback = (rows, time) => {
      const desc= getQueryDescription(query, rows, time)
      return desc
    }

    return this._runAndLogQuery (query, values, options, callback, msg_callback)
  }  

  async _select (query, values, options, callback) {
    const msg_callback = (data, time) => {
      const desc= getQueryDescription(query, data.length, time) 
      return desc
    }

    return this._runAndLogQuery (query, values, options, callback, msg_callback)

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
      this.log.warn('[calustra] Returned ' + data.length + ' rows, but expected just 1')
    }
  
    if (data.length>0)
      return data[0]
    
    return {}
  }  

  async execute (query, values, options) {
    throw new Error ('CalustraConnBase: execute() not implemented"')
  }

  async executeAndCount (query, values, options) {
    throw new Error ('CalustraConnBase: executeAndCount() not implemented"')
  }  

  async select (query, values, options) {
    throw new Error ('CalustraConnBase: select() not implemented"')
  }

  // async getOrSetCachedTableNames(callback, schema= 'public') {
  //   if (this._table_names == undefined) {
  //     this._table_names= await callback(schema)
  //   }
  //   return this._table_names
  // }

  async getTableNamesFromDb(schema= 'public') {
    throw new Error ('CalustraConnBase: getTableNamesFromDb() not implemented"')
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
    throw new Error ('CalustraConnBase: getTableDetailsFromDb() not implemented"')
  }    

  async getTableDetails(tableName, schema= 'public') {
    const queryName = `${schema}.${tableName}.details`

    const data= await getOrSetQueryResultsFromCache(this.config, queryName, this.log, async () => {
      const results= await this.getTableDetailsFromDb(tableName, schema)
      return results
    })

    return data
  }  

  getModel(tableName, schema= 'public') {

    const modelOptionsDef= {
      name: '',
      schema: 'public',
      useDateFields: {
        use: false,
        fieldNames: {
          created_at: 'created_at', 
          last_update_at: 'last_update_at'
        },
        now: () => intre_now()
      },
      /*
      checkBeforeDelete: [
        "another_table.field_id"
      ],
      
      triggers: {
        beforeRead   : undefined,
        afterRead    : undefined,
        beforeInsert : undefined,
        afterInsert  : undefined,
    
        beforeUpdate : undefined,
        afterUpdate  : undefined,
    
        beforeDelete : undefined,
        afterDelete  : undefined
      },
      */  
    }
    

  
    let modelOptions= undefined
  
    for (const t of this.options?.tables || []) {
      if (t===tableName) {
        modelOptions= {
          name: tableName
        }
        break
      } else if (t?.name===tableName) {
        modelOptions= {...t}
        break
      } 
    }
  
    if (modelOptions == undefined) {
      modelOptions= {
        name: tableName
      }      
    }
  
    let useDateFields= merge(modelOptionsDef.useDateFields)
    if (modelOptions?.useDateFields != undefined) {
      if (typeof modelOptions.useDateFields == 'object') {
        useDateFields= merge(modelOptionsDef.useDateFields, modelOptions.useDateFields)
      } else if (typeof modelOptions.useDateFields == 'boolean') {
        useDateFields.use = modelOptions.useDateFields
      }
    }
  
    const mergedModelOptions = {
      name: modelOptions.name,
      schema: modelOptions?.schema || modelOptionsDef?.schema,
      triggers: modelOptions?.triggers || {},
      checkBeforeDelete: modelOptions?.checkBeforeDelete || false,
      useDateFields
    }
  
    const model= getOrSetModelFromCache(this, mergedModelOptions, () => {
      return this.initModel(mergedModelOptions)
    }) 
    
    return model

  }

  initModel(options) {
    throw 'CalustraConnBase: initModel() not implemented"'
  }
}

export default CalustraConnBase