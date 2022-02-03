/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "opt|filter|params" }]*/
import {filterObj} from '../util'
import { prepare_query_select, 
         prepare_query_insert,
         prepare_query_update,
         prepare_query_delete,
         prepare_queries_before_delete } from '../query'
import {ModelConfig} from '../config'

class ModelBase extends ModelConfig {
  constructor(db, tablename, definition, options) {
    super(db, tablename, definition, options)
  }

  async beforeRead(filter, options) {
    return Promise.resolve([
      filter, options, true
    ])
  }

  async afterRead(data, filter, options) {
    return Promise.resolve(
      data
    )
  }    

  async read(pfilter, poptions) {
    const [filter, options, goon] = await this.beforeRead(pfilter, poptions)

    if (! goon)
      return []

    const [query, values] = prepare_query_select(
       /*tablename*/ this.tablename, 
       /*tablefields*/ this.fields,
       /*filter*/ filter,     
       /*onlyFields*/ options?.fields, 
       /*sortBy*/ options?.sortby, 
       /*limit*/ options?.limit, 
       /*offset*/ options?.offset)

    let data= await this.db.select(query, values, options)

    this.ensureDefs(data)

    data= await this.afterRead(data, filter, options)
    
    return data
  }


  async keyList(filt, options) {    
    
    const data = await this.read(filt, {fields: ['id', 'name'], transaction: options?.transaction})

    let res= {}
    data.map((d) => {res[d.id]= d.name})
    return res
  }

  async distinct(field, filt, options) {    
    const data = await this.read(filt, {fields: [`DISTINCT ${field}`], transaction: options?.transaction})
    const res= data.map((d) => d[field])
    return res
  }

  async count(filt, options) {    
    let field
    if (options?.distinct!=undefined) {
      field= `CAST( COUNT(DISTINCT ${options.distinct}) AS int) AS cnt`
    } else {
      field= 'CAST(COUNT(1) AS int) AS cnt'
    }
    const data = await this.read(filt, {fields: [field], transaction: options?.transaction})
    try {
      return data[0].cnt
    } catch(error) {
      this.db.log.error(`${this.tablename} ERROR:`)
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)      
    }

    return 0
  }


  async find(id, options) {
    if (isNaN(id) || id <= 0) {    
      const msg = this.tablename + ': cannot find, invalid Id <' + id + '>'
      this.db.log.error(msg)
      throw new Error(msg)
    }

    const data= await this.read({id: id}, options)
    
    let odata= {}
    if (Array.isArray(data)) {
      odata= data[0]
    } else {
      this.db.log.warn(`${this.tablename}: Id ${id} does not exist`)
    }

    return odata
  }

  async beforeInsert(params, options) {
    if (this.useDatesOn) {
      params[this.datesCreatedField]= this.getNow()
    }

    let allow= true
    if (this.config.triggers.beforeInsert != undefined) {
      [params, options, allow]= await this.config.triggers.beforeInsert(params, options)
    }

    return Promise.resolve([
      params, options, allow
    ])
  }

  async afterInsert(id, params, options) {
    if (this.config.triggers.afterInsert != undefined) {
      id= await this.config.triggers.afterInsert(id, params, options)
    }

    return Promise.resolve(
      id
    )
  }


  async insert(data, poptions) {

    data= filterObj(data, this.fields)

    let [params, options, goon] = await this.beforeInsert(data, poptions)

    if (! goon)
      return []
    
    const [query, ivalues]= prepare_query_insert(this.tablename, this.fields, params, /*returning*/ true) 

    const ndata = await this.db.selectOne(query, ivalues, options)

    const id= await this.afterInsert(ndata.id, params, options)
    
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


  async beforeUpdate(params, filter, options) {
    if (this.useDatesOn) {
      params[this.datesUpdatedField]= this.getNow()
    }

    let allow= true
    if (this.config.triggers.beforeUpdate != undefined) {
      [params, filter, options, allow]= await this.config.triggers.beforeUpdate(params, filter, options)
    }

    return Promise.resolve([
      params, filter, options, allow
    ])
    
  }

  async afterUpdate(rows, params, filter, options) {
    if (this.config.triggers.afterUpdate != undefined) {
      rows= await this.config.ustomHooks.afterUpdate(rows, params, filter, options)
    }    

    return Promise.resolve(
      rows
    )
  }


  async update(data, filt, poptions) {

    data= filterObj(data, this.fields)
    delete data.id

    let [params, filter, options, goon] = await this.beforeUpdate(data, filt, poptions)

    if (! goon)
      return []

    const [query, values]= prepare_query_update(this.tablename, this.fields, params, filter)

    if (query == undefined) {
      this.db.log.error(`${this.tablename} ERROR: Nothing to update`)
      return 0
    }

    let count= await this.db.executeAndCount(query, values, options)

    count= await this.afterUpdate(count, params, filter, options)

    if (count == 0) {
      const msg = this.tablename + ': no record updated with filter ' + JSON.stringify(filt) + ' -- ' + JSON.stringify(data)
      this.db.log.warn(msg)
    } else {
      if (options?.log!==false) {
        this.db.log.debug(`Updated ${count} records`)
      }
    }

    return count
  }  


  async beforeDelete(filter, options) {
    let allow= true

    if (filter.id != undefined) {
      let found= 0
      const queries= prepare_queries_before_delete(this.config.checkBeforeDelete)
      for (const query of queries) {
        const res= await this.db.selectOne(query, [filter.id], options)
        found += res.cnt
      }

      allow= found==0
    }

    if (this.config.triggers.beforeDelete != undefined) {
      [filter, options, allow] = await this.config.triggers.beforeDelete(filter, options)
    }

    return Promise.resolve([
      filter, options, allow
    ])
  }

  async afterDelete(rows, filter, options) {
    if (this.config.triggers.afterDelete != undefined) {
      rows = await this.config.triggers.afterDelete(rows, filter, options)
    }

    return Promise.resolve(
      rows
    )
  }


  async delete(filt, poptions) {
    let [filter, options, goon] = await this.beforeDelete(filt, poptions)

    if (! goon) {
      const msg = this.tablename + ': Cannot delete for filter ' + JSON.stringify(filt)
      this.db.log.warn(msg)
      return 0
    }  

    const [query, values]= prepare_query_delete(this.tablename, this.fields, filter) 



    let count= await this.db.executeAndCount(query, values, options)

    count= await this.afterDelete(count, filter, options)

    if (options?.log!==false) {
      this.db.log.debug(`Deleted ${count} records`)
    }    

    return count
  }  
}

export default ModelBase