/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "opt|filter|params" }]*/
import filterObj from '../../util/filterObj.mjs'
import { prepare_query_select, 
         prepare_query_insert,
         prepare_query_update,
         prepare_query_delete,
         prepare_queries_before_delete } from '../../util/query/index.mjs'
import {CalustraModelOptions} from './options.mjs'

class CalustraModelBase extends CalustraModelOptions {
  constructor(connection, options) {
    super(options)
    this.connection= connection
  }

  async loadDefinition() {
    if (this.definition == undefined) {
      this.definition= await this.connection.getTableDetails(this.name, this.schema)
    }
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
    await this.loadDefinition()

    const [filter, options, allow] = await this.beforeRead(pfilter, poptions)

    if (! allow)
      return []

    const [query, values] = prepare_query_select(
       /*tablename*/ this.name, 
       /*tablefields*/ this.fields,
       /*filter*/ filter,     
       /*onlyFields*/ options?.fields, 
       /*sortBy*/ options?.sortby, 
       /*limit*/ options?.limit, 
       /*offset*/ options?.offset)

    let data= await this.connection.select(query, values, options)

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
      this.connection.log.error(`[calustra] ${this.name} ERROR:`)
      this.connection.log.error(`[calustra] ${error.constructor.name}`)
      this.connection.log.error(error.stack)      
    }

    return 0
  }


  async find(id, options) {
    if (isNaN(id) || id <= 0) {    
      const msg = this.name + ': cannot find, invalid Id <' + id + '>'
      this.connection.log.error(`[calustra] ${msg}`)
      throw new Error(msg)
    }

    const data= await this.read({id: id}, options)
    
    let odata= {}
    if (Array.isArray(data)) {
      odata= data[0]
    } else {
      this.connection.log.warn(`[calustra] ${this.name}: Id ${id} does not exist`)
    }

    return odata
  }

  async beforeInsert(params, options) {
    if (this.useDateFieldsOn) {
      params[this.datesCreatedField]= this.getNow()
    }

    let allow= true
    if (this.triggers.beforeInsert != undefined) {
      [params, options, allow]= await this.triggers.beforeInsert(this.connection, params, options)
    }

    return Promise.resolve([
      params, options, allow
    ])
  }

  async afterInsert(id, params, options) {
    if (this.triggers.afterInsert != undefined) {
      id= await this.triggers.afterInsert(this.connection, id, params, options)
    }

    return Promise.resolve(
      id
    )
  }


  async insert(data, poptions) {
    if (data == undefined) {
      throw Error(`[calustra] ${this.name}.insert() received data=undefined`)
    }

    await this.loadDefinition()

    data= filterObj(data, this.fields)

    let [params, options, allow] = await this.beforeInsert(data, poptions)

    if (! allow)
      return undefined
    
    const [query, ivalues]= prepare_query_insert(this.name, this.fields, params, /*returning*/ true) 

    const ndata = await this.connection.selectOne(query, ivalues, options)

    const id= await this.afterInsert(ndata.id, params, options)
    
    if (id == null) {
      const msg = this.name + ': cannot save ' + JSON.stringify(data)
      this.connection.log.error(`[calustra] ${msg}`)
    } else {
      if (options?.log!==false) {
        this.connection.log.debug(`[calustra] ${this.name}: Created with Id ${id}`)
      }
    }

    return id
  }


  async beforeUpdate(params, filter, options) {
    if (this.useDateFieldsOn) {
      params[this.datesUpdatedField]= this.getNow()
    }

    let allow= true
    if (this.triggers.beforeUpdate != undefined) {
      [params, filter, options, allow]= await this.triggers.beforeUpdate(this.connection, params, filter, options)
    }

    return Promise.resolve([
      params, filter, options, allow
    ])
    
  }

  async afterUpdate(rows, params, filter, options) {
    if (this.triggers.afterUpdate != undefined) {
      rows= await this.triggers.afterUpdate(this.connection, rows, params, filter, options)
    }    

    return Promise.resolve(
      rows
    )
  }


  async update(data, filt, poptions) {
    if (data == undefined) {
      throw Error(`[calustra] ${this.name}.insert() received data=undefined`)
    }

    await this.loadDefinition()
    
    data= filterObj(data, this.fields)
    delete data.id

    let [params, filter, options, allow] = await this.beforeUpdate(data, filt, poptions)

    if (! allow)
      return []

    const [query, values]= prepare_query_update(this.name, this.fields, params, filter)

    if (query == undefined) {
      this.connection.log.error(`[calustra] ${this.name} ERROR: Nothing to update`)
      return 0
    }

    let count= await this.connection.executeAndCount(query, values, options)

    count= await this.afterUpdate(count, params, filter, options)

    if (count == 0) {
      const msg = this.name + ': no record updated with filter ' + JSON.stringify(filt) + ' -- ' + JSON.stringify(data)
      this.connection.log.warn(`[calustra] ${msg}`)
    } else {
      if (options?.log!==false) {
        this.connection.log.debug(`[calustra] ${this.name}: Updated ${count} records`)
      }
    }

    return count
  }  


  async beforeDelete(filter, options) {
    let allow= true

    if (filter.id != undefined) {
      let found= 0
      const queries= prepare_queries_before_delete(this.options.checkBeforeDelete)
      for (const query of queries) {
        const res= await this.connection.selectOne(query, [filter.id], options)
        found += res.cnt
      }

      allow= found==0
    }

    if (this.triggers.beforeDelete != undefined) {
      [filter, options, allow] = await this.triggers.beforeDelete(this.connection, filter, options)
    }

    return Promise.resolve([
      filter, options, allow
    ])
  }

  async afterDelete(rows, filter, options) {
    if (this.triggers.afterDelete != undefined) {
      rows = await this.triggers.afterDelete(this.connection, rows, filter, options)
    }

    return Promise.resolve(
      rows
    )
  }


  async delete(filt, poptions) {
    await this.loadDefinition()

    let [filter, options, allow] = await this.beforeDelete(filt, poptions)

    if (! allow) {
      const msg = this.name + ': Cannot delete for filter ' + JSON.stringify(filt)
      this.connection.log.warn(`[calustra] ${msg}`)
      return 0
    }  

    const [query, values]= prepare_query_delete(this.name, this.fields, filter) 



    let count= await this.connection.executeAndCount(query, values, options)

    count= await this.afterDelete(count, filter, options)

    if (options?.log!==false) {
      this.connection.log.debug(`[calustra] ${this.name}: Deleted ${count} records`)
    }    

    return count
  }  
}

export default CalustraModelBase