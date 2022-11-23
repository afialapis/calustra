import CalustraConnBase from '../base/connection'
import pgPromise  from  'pg-promise'
import merge from '../../util/merge'
import defaults from './defaults'


class CalustraConnPG extends CalustraConnBase {

  constructor (config, logger) {
    super(config, logger)
  }

  openDb() {
    const config = merge(defaults, this.config || {})
    const pgp = pgPromise()
    const db  = pgp(config)
    return db
  } 

  openTransaction() {
    return this.db.tx  
  }  

  closeDb () {
    // Gotta do nothing if we use .query() ?
    this.db.$pool.end()
  }

  async execute (query, values, options) {

    const callback = async () => {

      const transaction = options?.transaction!=undefined 
      ? options?.transaction 
      : this.openTransaction()

      const action = (t) => {
        return t.oneOrNone(query, values)
      }

      const data = await transaction(action)
      return data      
    }

    return this._execute (query, values, options, callback) 
  }

  async executeAndCount (query, values, options) {

    const callback = async () => {

      const transaction = options?.transaction!=undefined 
      ? options?.transaction 
      : this.openTransaction()

      const action = (t) => {

        const cquery = `
          WITH rows as (
            ${query}
            RETURNING 1
          ) SELECT count(*)::int AS cnt FROM rows`

        const res= t.oneOrNone(cquery, values)

        return res
      }

      const data = await transaction(action)
      return data.cnt
    }

    return this._executeAndCount (query, values, options, callback) 
  }

  async select (query, values, options) {

    const callback = async () => {

      const transaction = options?.transaction!=undefined 
      ? options?.transaction 
      : this.openTransaction()

      const action = (t) => {
        return t.any(query, values)
      }

      const data = await transaction(action)
      return data      
    }

    return this._select (query, values, options, callback) 
  }

  async getTableNamesFromDb(schema= 'public') {
    const query= 
        `SELECT DISTINCT c.relname AS name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace  
          WHERE c.relkind = 'r'::char
            AND n.nspname = $1
      ORDER BY 1`
    
    const res = await this.select(query, [schema])

    const out = res.map((r) => r.name)

    return out
      
  }  


  async getTableDetailsFromDb(tableName, schema= 'public') {
    const query= 
      `SELECT f.attnum AS number, f.attname AS name, f.attnum,  
              f.attnotnull AS notnull, 
              f.atttypid as type_id,
              -- pg_catalog.format_type(f.atttypid,f.atttypmod) AS type,  
              CASE  
                  WHEN p.contype = 'p' THEN 't'  
                  ELSE 'f'  
              END AS primarykey,  
              CASE  
                  WHEN p.contype = 'u' THEN 't'  
                  ELSE 'f'
              END AS uniquekey
              -- CASE
              --     WHEN p.contype = 'f' THEN g.relname
              -- END AS foreignkey,
              -- CASE
              --     WHEN p.contype = 'f' THEN p.confkey
              -- END AS foreignkey_fieldnum,
              -- CASE
              --     WHEN p.contype = 'f' THEN g.relname
              -- END AS foreignkey,
              -- CASE
              --     WHEN p.contype = 'f' THEN p.conkey
              -- END AS foreignkey_connnum,
              -- CASE
              --     WHEN f.atthasdef = 't' THEN d.adsrc
              -- END AS default
          FROM pg_attribute f  
          JOIN pg_class c ON c.oid = f.attrelid  
          JOIN pg_type t ON t.oid = f.atttypid  
    LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = f.attnum  
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace  
    LEFT JOIN pg_constraint p ON p.conrelid = c.oid AND f.attnum = ANY (p.conkey)  
    LEFT JOIN pg_class AS g ON p.confrelid = g.oid  
        WHERE c.relkind = 'r'::char  
          AND n.nspname = $1
          AND c.relname = $2
          AND f.attnum > 0 
      ORDER BY number`    

    const res = await this.select(query, [schema, tableName])

    let tableDef = {}
    
    res.map((r) => {
      const fieldName= r.name
      const fieldProps= {
        type     : r.type_id,
        key      : r.name=='id',  // Review me. See how to trust query for this
        nullable : ! r.notnull,
        default  : undefined, // And me ?
  
      }
      tableDef[fieldName]= fieldProps
    })

    return tableDef
    
  }  
 
}

export default CalustraConnPG