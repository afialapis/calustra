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
      auth: {
        require: false, // true / false / read-only
        action: 'redirect', // 'error'
        redirect_path: '/',
        error_code: 401
      }            
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

    _check_auth(ctx, auth, op) {
      const glob_auth= options.auth || {}
      const tab_auth= auth || {}

      const opt= {
        ...glob_auth,
        ...tab_auth
      }

      const check= (opt.require===true) || (opt.require==='read-only' && op==='w')

      if (check) {
        const uid= this._get_user_id(ctx)
        if (uid===undefined) {

          if (opt.action=='error') {
            
            this.model.db.log.error(`Unauthorized access. Throwing error ${opt.error_code}`)
            return ctx.throw(
              opt.error_code,
              null,
              {}
            )

          } else {
            this.model.db.log.error(`Unauthorized access. Redirecting to ${opt.redirect_path}`)
            ctx.redirect(opt.redirect_path)
          }
        }
      }
    }

    async read(ctx, auth) {
      this._check_auth(ctx, auth, 'r')
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.read(params, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async key_list(ctx, auth) {
      this._check_auth(ctx, auth, 'r')
      // TODO : handle transactions
      const params = queryStringToJson(ctx.request.url)
      const model_options= {transaction: undefined}
      const data = await this.model.keyList(params, model_options)    
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async find(ctx, auth) { 
      this._check_auth(ctx, auth, 'r')   
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.find(params.id, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }

    async distinct(ctx, auth) {
      this._check_auth(ctx, auth, 'r')
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.distinct(params.distinct_field, params, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }
    
    async save(ctx, auth) {
      this._check_auth(ctx, auth, 'w')
      const uid = this._get_user_id(ctx)
      const params = ctx.request.fields
      params.created_by = uid
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await this.model.insert(params, model_options)
      ctx.body= _packBodyData(data, options.body_field)
    }
    
    async update(ctx, auth) {
      this._check_auth(ctx, auth, 'w')
      const uid = this._get_user_id(ctx)
      const params = ctx.request.fields
      params.last_update_by = uid
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.update(params, {id: params.id}, model_options)
      ctx.body= _packBodyData(data, options.body_field)
    }
    
    async remove(ctx, auth) {
      this._check_auth(ctx, auth, 'w')
      //const uid = this._get_user_id(ctx)
      const params = ctx.request.fields
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await this.model.delete({id: params.id}, model_options)
      ctx.body = _packBodyData(data, options.body_field)
    }

    attachTo(router, path, auth, avoid) {
      if (avoid==undefined)
        avoid= []
      
      if (avoid.indexOf('find')<0) 
        router.get (`${path}/find`     , (ctx) => this.find(ctx, auth))
      if (avoid.indexOf('read')<0)
        router.get (`${path}/read`     , (ctx) => this.read(ctx, auth))
      if (avoid.indexOf('distinct')<0)
        router.get (`${path}/distinct` , (ctx) => this.distinct(ctx, auth))
      if (avoid.indexOf('save')<0)
        router.post(`${path}/save`     , (ctx) => this.save(ctx, auth))
      if (avoid.indexOf('update')<0)
        router.post(`${path}/update`   , (ctx) => this.update(ctx, auth))
      if (avoid.indexOf('remove')<0)
        router.post(`${path}/remove`   , (ctx) => this.remove(ctx, auth))
      if (avoid.indexOf('key_list')<0)
        router.get (`${path}/key_list` , (ctx) => this.key_list(ctx, auth))
    }
    
  }
  
  return new CalustraRouter()
}

export default createRouter