/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "query|value|options|schema|tableName|^_" }]*/

import formatQuery from '../../../query/format.mjs'
import getQueryDescription from '../../../query/getDescription.mjs'
import {intre_now} from 'intre'
import merge from "../../util/merge.mjs"
import {initLogger} from '../../logger/index.mjs'

let _conn_counter = 0

class CalustraConnBase {
 
  constructor (config, options) {
    this.connid = ++_conn_counter
    this.config= config
    this.options= options
    this.log = initLogger(options?.log)
    
    this.log.debug(`[calustra][${this.connid}] Opening database ${this.configDescription}${this.options?.reset==true ? ' (reset)' : ''}${this.options?.nocache==true ? ' (nocache)' : ''}`)
    this.db = this.openDb(this.config)
    
    this.log.info(`[calustra][${this.connid}] Using database ${config?.database}`)
    this.is_open= true
    
    // internally cached objects
    this.cached_models = {}
    this.cached_results = {}
  }
  
  updateOptions(options) {
    if (!options) {
      return
    }

    this.options = {
      ...this.options,
      ...options||{}
    }
    
    if ('log' in options) {
      this.log = initLogger(options?.log)
    }
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


  close () {
    this.is_open= false
    this.closeDb()
    this.cached_models = {}
    this.cached_results = {}
    
    try {
      // uncache method may be dynamically assigned when caching connection
      this.uncache()
    } catch(_) {}
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
        this.log.silly(`[calustra][${this.connid}] ${this.formatQuery(query, values)}`)
        const msg= msg_callback(data, elapsed)
        if (options?.log === 'silly') {
          this.log.silly(`[calustra][${this.connid}] ${msg}`)
        } else if (options?.log === 'debug') {
          this.log.debug(`[calustra][${this.connid}] ${msg}`)
        } else {
          this.log.info(`[calustra][${this.connid}] ${msg}`)
        }
      }

      return data
    } catch (error) {
      if (options?.silent_fail !== true) {
        throw error
      }
      
      if (options?.log!==false) {
        this.log.error(`[calustra][${this.connid}] ${this.formatQuery(query, values)}`)
        this.log.error(`[calustra][${this.connid}] ${error.constructor.name}`)
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
      this.log.warn('[calustra][${this.connid}] Returned ' + data.length + ' rows, but expected just 1')
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

  async getTableNamesFromDb(schema= 'public') {
    throw new Error ('CalustraConnBase: getTableNamesFromDb() not implemented"')
  }  
  
  async getTableNames(schema= 'public') {
    const queryName = `${schema}.tablenames`
    
    if (Object.keys(this.cached_results).indexOf(queryName)<0) {
      this.cached_results[queryName] = await this.getTableNamesFromDb(schema)
    }
    return this.cached_results[queryName]    
  }  

  async getTableDetailsFromDb(tableName, schema= 'public') {
    throw new Error ('CalustraConnBase: getTableDetailsFromDb() not implemented"')
  }    

  async getTableDetails(tableName, schema= 'public') {
    if (Object.keys(this.cached_results).indexOf(tableName)<0) {
      this.cached_results[tableName] = await this.getTableDetailsFromDb(tableName, schema)
    }
    return this.cached_results[tableName]
  }

  _makeModelOptions(tableName) {

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
    
  
    return mergedModelOptions
  }

  _makeModel(tableName, schema= 'public') {

    const modelOptions= this._makeModelOptions(tableName)
  
    const model = this.initModel(modelOptions)

    return model
  }

  getModel(tableName, schema= 'public') {
    if (Object.keys(this.cached_models).indexOf(tableName)<0) {
      this.cached_models[tableName] = this._makeModel(tableName)
    }
    return this.cached_models[tableName]
  }

  initModel(options) {
    throw 'CalustraConnBase: initModel() not implemented"'
  }
}

export default CalustraConnBase