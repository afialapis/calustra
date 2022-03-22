import queryStringToJson from '../util/queryStringToJson'

const _packBodyData = (data, body_field) => {
  if (body_field == undefined) {
    return data
  }
  return {
    [body_field]: data
  }
}

const _def_get_uid = (ctx) => {
  let uid= ctx.headers['user-id']
  if (uid!=undefined) {
    return uid
  }
  return undefined
}


const createRouter = (model, options) => {
  /*
    options: {
      body_field: 'result',
      get_uid: (ctx) => <int>
    }
  */

  class CalustraRouter {  
    constructor() {
      this.name= model.tablename
      this.model= model
    }

    _get_uid(ctx) {
      const call= options.get_uid || _def_get_uid
      return call(ctx)
    }

    async read(ctx) {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.read(params, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async key_list(ctx) {
      // TODO : handle transactions
      const params = queryStringToJson(ctx.request.url)
      const model_options= {transaction: undefined}
      const data = await this.model.keyList(params, model_options)    
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async find(ctx) {    
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.find(params.id, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }

    async distinct(ctx) {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.distinct(params.distinct_field, params, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async save(ctx) {
      const uid = this._get_uid(ctx)
      const params = ctx.request.fields
      params.created_by = uid
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.insert(params, model_options)
      ctx.body= _packBodyData(data, options.body_field)
    }
    
    async update(ctx) {
      const uid = this._get_uid(ctx)
      const params = ctx.request.fields
      params.last_update_by = uid
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.update(params, {id: params.id}, model_options)
      ctx.body= _packBodyData(data, options.body_field)
    }
    
    async remove(ctx) {
      //const uid = this._get_uid(ctx)
      const params = ctx.request.fields
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.delete({id: params.id}, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }

    attachTo(router, path, avoid) {
      if (avoid==undefined)
        avoid= []
      
      if (avoid.indexOf('find')<0) 
        router.get (`${path}/find`     , ctx => this.find(ctx))
      if (avoid.indexOf('read')<0)
        router.get (`${path}/read`     , ctx => this.read(ctx))
      if (avoid.indexOf('distinct')<0)
        router.get (`${path}/distinct` , ctx => this.distinct(ctx))
      if (avoid.indexOf('save')<0)
        router.post(`${path}/save`     , ctx => this.save(ctx))
      if (avoid.indexOf('update')<0)
        router.post(`${path}/update`   , ctx => this.update(ctx))
      if (avoid.indexOf('remove')<0)
        router.post(`${path}/remove`   , (ctx) => this.remove(ctx))
      if (avoid.indexOf('key_list')<0)
        router.get (`${path}/key_list` , (ctx) => this.key_list(ctx))    
    }
    
  }
  
  return new CalustraRouter()
}

export default createRouter