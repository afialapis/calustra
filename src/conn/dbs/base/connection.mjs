/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "query|value|options|schema|tableName|^_" }]*/

import formatQuery from '../../../query/format.mjs'
import getQueryDescription from '../../../query/getDescription.mjs'
import {getOrSetQueryResultsFromCache} from '../../cache/results.mjs'
import Logger from '../../util/logger.mjs'
import {epoch_now} from 'intre'
import merge from "../../util/merge.mjs"
import { getOrSetModelFromCache } from '../../cache/conns.mjs'



function _initLogger(options) {
  let logger
  if (options?.log==undefined || typeof options?.log == 'string') {
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
        const desc= getQueryDescription(query, undefined, time)
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
        const desc= getQueryDescription(query, rows, time)
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
        const desc= getQueryDescription(query, data.length, time) 
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

  // async getOrSetCachedTableNames(callback, schema= 'public') {
  //   if (this._table_names == undefined) {
  //     this._table_names= await callback(schema)
  //   }
  //   return this._table_names
  // }

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
        now: () => epoch_now()
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