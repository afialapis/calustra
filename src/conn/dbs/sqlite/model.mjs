import CalustraModelBase from '../base/model.mjs'
import filterObj from '../../util/filterObj.mjs'
import prepare_query_insert from '../../util/query/insert.mjs'


class CalustraModelSQLite extends CalustraModelBase {
  constructor(connection, options) {
    super(connection, options)
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
    
    const [query, ivalues]= prepare_query_insert(this.name, this.fields, params) 

    await this.connection.execute(query, ivalues, options)

    const ndata= await this.connection.selectOne('select last_insert_rowid() as last_id')
    
    const id= await this.afterInsert(ndata.last_id, params, options)

    if (id == null) {
      const msg = this.name + ': cannot save ' + JSON.stringify(data)
      this.connection.log.error(`[calustra] ${msg}`)
    } else {
      if (options?.log!==false) {
        this.connection.log.debug(`[calustra] Created with Id ${id}`)
      }
    }

    return id
  }  
}

export default CalustraModelSQLite