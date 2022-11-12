import CalustraModelBase from './base'
import {filterObj} from '../util'
import { prepare_query_insert} from '../query'

class CalustraModelSQLite extends CalustraModelBase {
  constructor(conn, tablename, definition, options) {
    super(conn, tablename, definition, options)
  }


  /*
   SQLite >= 3.35 shoudld allow RETURNING id clauses and so,
     making this subclass unneeded
  */

  async insert(data, poptions) {
    await this.loadDefinition()

    data= filterObj(data, this.fields)

    let [params, options, goon] = await this.beforeInsert(data, poptions)

    if (! goon)
      return []
    
    const [query, ivalues]= prepare_query_insert(this.tablename, this.fields, params) 

    await this.conn.execute(query, ivalues, options)

    const ndata= await this.conn.selectOne('select last_insert_rowid() as last_id')
    
    const id= await this.afterInsert(ndata.last_id, params, options)

    if (id == null) {
      const msg = this.tablename + ': cannot save ' + JSON.stringify(data)
      this.conn.log.error(msg)
    } else {
      if (options?.log!==false) {
        this.conn.log.debug(`Created with Id ${id}`)
      }
    }

    return id
  }  
}

export default CalustraModelSQLite