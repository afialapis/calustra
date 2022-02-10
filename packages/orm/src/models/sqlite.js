import ModelBase from './base'
import {filterObj} from '../util'
import { prepare_query_insert} from '../query'

class ModelLT extends ModelBase {
  constructor(db, tablename, definition, options) {
    super(db, tablename, definition, options)
  }


  /*
   SQLite >= 3.35 shoudld allow RETURNING id clauses and so,
     making this subclass unneeded
  */

  async insert(data, poptions) {

    data= filterObj(data, this.fields)

    let [params, options, goon] = await this.beforeInsert(data, poptions)

    if (! goon)
      return []
    
    const [query, ivalues]= prepare_query_insert(this.tablename, this.fields, params) 

    await this.db.execute(query, ivalues, options)

    const ndata= await this.db.selectOne('select last_insert_rowid() as last_id')
    
    const id= await this.afterInsert(ndata.last_id, params, options)

    if (id == null) {
      const msg = this.tablename + ': cannot save ' + JSON.stringify(data)
      this.db.log.error(msg)
    } else {
      if (options?.log!==false) {
        this.db.log.debug(`Created with Id ${id}`)
      }
    }

    return id
  }  
}

export default ModelLT