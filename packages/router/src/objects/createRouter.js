import queryStringToJson from '../util/queryStringToJson'

const _packBodyData = (data, body_field) => {
  if (body_field == undefined) {
    return data
  }
  return {
    [body_field]: data
  }
}

const createRouter = (model, options) => {
  /*
    options: {
      body_field: 'result',
      get_user_id: (ctx) => <int>,
      require_user_id: false // applies to every route
    }
  */

  class CalustraRouter {  
    constructor() {
      this.name= model.tablename
      this.model= model
    }

    _get_user_id(ctx) {
      const call= options.get_user_id
      return call(ctx)
    }

    _check_auth(ctx, require_user_id) {
      const check = (require_user_id===true) || (options.require_user_id === true)
      if (check) {
        const uid= this._get_user_id(ctx)
        if (uid===undefined) {
          this.model.db.log('Unauthorized access')
          return ctx.throw(
            401,
            null,
            {}
          )
        }
      }
    }

    async read(ctx, require_user_id) {
      this._check_auth(ctx, require_user_id)
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.read(params, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async key_list(ctx, require_user_id) {
      this._check_auth(ctx, require_user_id)
      // TODO : handle transactions
      const params = queryStringToJson(ctx.request.url)
      const model_options= {transaction: undefined}
      const data = await this.model.keyList(params, model_options)    
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async find(ctx, require_user_id) { 
      this._check_auth(ctx, require_user_id)   
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.find(params.id, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }

    async distinct(ctx, require_user_id) {
      this._check_auth(ctx, require_user_id)
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.distinct(params.distinct_field, params, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async save(ctx, require_user_id) {
      this._check_auth(ctx, require_user_id)
      const uid = this._get_user_id(ctx)
      const params = ctx.request.fields
      params.created_by = uid
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.insert(params, model_options)
      ctx.body= _packBodyData(data, options.body_field)
    }
    
    async update(ctx, require_user_id) {
      this._check_auth(ctx, require_user_id)
      const uid = this._get_user_id(ctx)
      const params = ctx.request.fields
      params.last_update_by = uid
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.update(params, {id: params.id}, model_options)
      ctx.body= _packBodyData(data, options.body_field)
    }
    
    async remove(ctx, require_user_id) {
      this._check_auth(ctx, require_user_id)
      //const uid = this._get_user_id(ctx)
      const params = ctx.request.fields
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.delete({id: params.id}, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }

    attachTo(router, path, require_user_id, avoid) {
      if (avoid==undefined)
        avoid= []
      
      if (avoid.indexOf('find')<0) 
        router.get (`${path}/find`     , (ctx) => this.find(ctx, require_user_id))
      if (avoid.indexOf('read')<0)
        router.get (`${path}/read`     , (ctx) => this.read(ctx, require_user_id))
      if (avoid.indexOf('distinct')<0)
        router.get (`${path}/distinct` , (ctx) => this.distinct(ctx, require_user_id))
      if (avoid.indexOf('save')<0)
        router.post(`${path}/save`     , (ctx) => this.save(ctx, require_user_id))
      if (avoid.indexOf('update')<0)
        router.post(`${path}/update`   , (ctx) => this.update(ctx, require_user_id))
      if (avoid.indexOf('remove')<0)
        router.post(`${path}/remove`   , (ctx) => this.remove(ctx, require_user_id))
      if (avoid.indexOf('key_list')<0)
        router.get (`${path}/key_list` , (ctx) => this.key_list(ctx, require_user_id))
    }
    
  }
  
  return new CalustraRouter()
}

export default createRouter