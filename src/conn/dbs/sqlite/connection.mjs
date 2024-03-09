/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "schema|tableName|^_" }]*/

import CalustraConnBase from '../base/connection.mjs'
import sqlite3 from 'sqlite3'
import defaults from './defaults.mjs'
import merge from '../../util/merge.mjs'
import CalustraModelSQLite from './model.mjs'

class CalustraConnLT extends CalustraConnBase {
  
  constructor (config, options) {
    super(config, options)
  }

  get configDescription() {
    const c = this.config
    return `${c.dialect}: ${c.filename}${c.cached ? ' (cached)' : ''}`
  }

  openDb() {
    const config = merge(defaults, this.config || {})

    if (config.verbose) {
      sqlite3.verbose()
    }
  
    const driver= config.cached
      ? sqlite3.cached.Database
      : sqlite3.Database
    
    let db = new driver(config.filename)
  
    const extra= ['trace', 'profile', 'buyTimeout']
    extra.map((opt) => {
      if (config[opt]!=undefined) {
        db.configure(opt, config[opt])
      }
    })
    return db

  } 

  openTransaction() {
    throw new Error (`[calustra][${this.connid}] CalustraConnLT: SQLite connections does not support transactions"`)
  }  

  closeDb () {
    this.db.close()
  }
  
  
  _normalize_query_flags (query) {  
    if (query.indexOf('$')>=0) {
      query = query.replace(/\$/g, '?')
    }
    return query
  }
  

  async execute (query, values, options) {
    const that = this

    const callback = function () {
      
      return new Promise(function (resolve, reject) {
        
        let cquery = that._normalize_query_flags(query) 

        that.db.run(cquery, values, function (err, data) {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        })
      })
    }
    
    return this._execute (query, values, options, callback) 
  }


  async executeAndCount (query, values, options) {
    const that = this

    const callback = function () {
      
      return new Promise(function (resolve, reject) {

        let cquery = that._normalize_query_flags(query) 
    
        that.db.run(cquery, values, function (err) {
          if (err) {
            return reject(err)
          }
          that.db.get('SELECT changes() AS affected_row_count', function (err, data) {
            if (err) {
              return reject(err)
            }

            resolve(data.affected_row_count)
          })          
        })
      })
    }
    
    return this._executeAndCount (query, values, options, callback) 
  }  

  async select (query, values, options) {

    const that = this

    const callback = function () {
      return new Promise(function (resolve, reject) {
        
        let cquery = that._normalize_query_flags(query) 

        that.db.all(cquery, values, function (err, data) {

          if (err) {
            return reject(err)
          }
          return resolve(data)
        })
      })
    }
        

    return this._select (query, values, options, callback) 
  }  

  async getTableNamesFromDb(schema= 'master') {
    const query= 
        `SELECT name 
           FROM sqlite_schema 
          WHERE type = 'table' 
            AND name NOT LIKE 'sqlite_%'
        ORDER BY 1`
    
    const res = await this.select(query)

    const out = res.map((r) => r.name)

    return out
      
  }  


  async getTableDetailsFromDb(tableName, schema= 'master') {
    const query= 
      `   SELECT m.name as tableName, 
                 p.cid as number,
                 p.name as columnName,
                 p.type,
                 p.'notnull' as nulla,
                 p.dflt_value,
                 p.pk
            FROM sqlite_master m
 LEFT OUTER JOIN pragma_table_info((m.name)) p
              ON m.name <> p.name
            WHERE m.name = ?
        ORDER BY tableName, number`

    const res = await this.select(query, [tableName])

    let tableDef = {}
    
    res.map((r) => {
      const fieldName= r.columnName
      const fieldProps= {
        type     : r.type_id,
        key      : r.pk==1,
        nullable : r.nulla!=1,
        default  : r.dflt_value
  
      }
      tableDef[fieldName]= fieldProps
    })

    return tableDef
    
  }  


  initModel(options) {
    const model= new CalustraModelSQLite(this, options)
    return model
  }

}

export default CalustraConnLT