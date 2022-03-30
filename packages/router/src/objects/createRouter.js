import queryStringToJson from '../util/queryStringToJson'



const createRouter = (model, router_options) => {
  /*
    router_options: {
      body_field: 'result',
      getUserId: (ctx) => <int>,
      authUser: {
        require: false, // true / false / read-only
        action: 'redirect', // 'error'
        redirect_url: '/',
        error_code: 401
      }            
    }
  */

  class CalustraRouter {  
    constructor() {
      this.name= model.tablename
      this.model= model
    }

    _packBodyData(data) {
      const body_field= router_options?.body_field
      if (body_field == undefined) {
        return data
      }
      return {
        [body_field]: data
      }
    }



    async _checkUserInfo(ctx, options, op, callback) {
      /*
        options is like:

        useUserFields: {
          use: false,
          fieldnames: {
            created_by: 'created_by', 
            last_update_by: 'last_update_by'
          },
        },

        getUserId: (ctx) => {
          let uid= ctx.headers['user-id']
          if (uid!=undefined) {
            return uid
          }
          return undefined
        },

        authUser: {
          require: false,     // true / false / 'read-only'
          action: 'redirect', // 'error'
          redirect_url: '/',
          error_code: 401
        },   
        
      */

      const getUserId = options.getUserId || router_options.getUserId
      const uid= getUserId(ctx)

      const authUser = {
        ...router_options.authUser,
        ...options.authUser,
      }
      const checkAuth= (authUser.require===true) || (authUser.require==='read-only' && op==='w')

      if (checkAuth) {

        if (uid===undefined) {

          if (authUser.action=='error') {
            
            this.model.connection.log.error(`Unauthorized access. Throwing error ${authUser.error_code}`)
            ctx.throw(
              authUser.error_code,
              null,
              {}
            )
          } else {
            this.model.connection.log.error(`Unauthorized access. Redirecting to ${authUser.redirect_url}`)
            ctx.redirect(authUser.redirect_url)
          }
        }
      }

      let fieldnames= {}
      if (options?.useUserFields?.use===true) {
        fieldnames= options?.useUserFields?.fieldnames || {
          created_by: 'created_by', 
          last_update_by: 'last_update_by'
        }
      }

      const uinfo= {
        uid: uid,
        fieldnames
      }

      await callback(uinfo)
    }

    async read(ctx, options) {
      await this._checkUserInfo(ctx, options, 'r', async (_uinfo) => {
        const params = queryStringToJson(ctx.request.url)
        // TODO : handle transactions
        const model_options= {transaction: undefined}
        const data = await this.model.read(params, model_options)
        ctx.body = this._packBodyData(data)
      })
    }
    
    async key_list(ctx, options) {
      await this._checkUserInfo(ctx, options, 'r', async (_uinfo) => {
        // TODO : handle transactions
        const params = queryStringToJson(ctx.request.url)
        const model_options= {transaction: undefined}
        const data = await this.model.keyList(params, model_options)    
        ctx.body = this._packBodyData(data)
      })
    }
    
    async find(ctx, options) { 
      await this._checkUserInfo(ctx, options, 'r', async (_uinfo) => {
        const params = queryStringToJson(ctx.request.url)
        // TODO : handle transactions
        const model_options= {transaction: undefined}    
        const data = await this.model.find(params.id, model_options)
        ctx.body = this._packBodyData(data)
      })
    }

    async distinct(ctx, options) {
      await this._checkUserInfo(ctx, options, 'r', async (_uinfo) => {
        const params = queryStringToJson(ctx.request.url)
        // TODO : handle transactions
        const model_options= {transaction: undefined}
        const data = await this.model.distinct(params.distinct_field, params, model_options)
        ctx.body = this._packBodyData(data)
      })
    }
    
    async save(ctx, options) {
      await this._checkUserInfo(ctx, options, 'w', async (uinfo) => {
        const params = ctx.request.fields
        if (uinfo?.fieldnames?.created_by) {
          params[uinfo.fieldnames.created_by] = uinfo.uid
        }
        // TODO : handle transactions
        const model_options= {transaction: undefined}
        const data = await this.model.insert(params, model_options)
        ctx.body= this._packBodyData(data)
      })
    }
    
    async update(ctx, options) {
      await this._checkUserInfo(ctx, options, 'w', async (uinfo) => {
        const params = ctx.request.fields
        if (uinfo?.fieldnames?.last_update_by) {
          params[uinfo.fieldnames.last_update_by] = uinfo.uid
        }
        // TODO : handle transactions
        const model_options= {transaction: undefined}    
        const data = await this.model.update(params, {id: params.id}, model_options)
        ctx.body= this._packBodyData(data)
      })
    }
    
    async remove(ctx, options) {
      await this._checkUserInfo(ctx, options, 'w', async (_uinfo) => {
        const params = ctx.request.fields
        // TODO : handle transactions
        const model_options= {transaction: undefined}    
        const data = await this.model.delete({id: params.id}, model_options)
        ctx.body = this._packBodyData(data)
      })
    }

    attachTo(router, path, options) {
      const avoid = options?.avoid || []
      
      if (avoid.indexOf('find')<0) 
        router.get (`${path}/find`     , (ctx) => this.find(ctx, options))
      if (avoid.indexOf('read')<0)
        router.get (`${path}/read`     , (ctx) => this.read(ctx, options))
      if (avoid.indexOf('distinct')<0)
        router.get (`${path}/distinct` , (ctx) => this.distinct(ctx, options))
      if (avoid.indexOf('save')<0)
        router.post(`${path}/save`     , (ctx) => this.save(ctx, options))
      if (avoid.indexOf('update')<0)
        router.post(`${path}/update`   , (ctx) => this.update(ctx, options))
      if (avoid.indexOf('remove')<0)
        router.post(`${path}/remove`   , (ctx) => this.remove(ctx, options))
      if (avoid.indexOf('key_list')<0)
        router.get (`${path}/key_list` , (ctx) => this.key_list(ctx, options))
    }
    
  }
  
  return new CalustraRouter()
}

export default createRouter