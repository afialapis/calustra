import queryStringToJson from '../util/queryStringToJson'
import {getModel} from 'calustra-orm'


function createRoutesForCrud(connection, route, router, prefix, router_options, logger) {
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

    route.options is like:

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


  const model_options= {
    ...router_options, 
    ...route?.options || {}
  }

  const model= getModel(connection, route.name, model_options)
      
  const _packBodyData = (data) => {
    const body_field= router_options?.body_field
    if (body_field == undefined) {
      return data
    }
    return {
      [body_field]: data
    }
  }
  

  const _checkUserInfo = async (ctx, op, callback) => {
    const getUserId = route?.options?.getUserId || router_options.getUserId
    const uid= getUserId(ctx)

    let allowed= true

    const authUser = {
      require: false,
      ...router_options?.authUser || {},
      ...router_options?.crud?.authUser || {},
      ...route?.options?.authUser || {},
    }
    const checkAuth= (authUser.require===true) || (authUser.require==='read-only' && op==='w')

    if (checkAuth) {

      if (uid===undefined) {

        if (authUser.action=='error') {
          
          logger.error(`Unauthorized access. Throwing error ${authUser.error_code}`)
          ctx.throw(
            authUser.error_code,
            null,
            {}
          )
        } else {
          logger.error(`Unauthorized access. Redirecting to ${authUser.redirect_url}`)
          ctx.redirect(authUser.redirect_url)
        }

        allowed= false
      }
    }

    let fieldnames= {}
    if (route?.options?.useUserFields?.use===true) {
      fieldnames= route?.options?.useUserFields?.fieldnames || {
        created_by: 'created_by', 
        last_update_by: 'last_update_by'
      }
    }

    const uinfo= {
      uid: uid,
      fieldnames,
    }
    
    let res= {}
    if (allowed) {
      res= await callback(uinfo)
    }
    ctx.body = res
  }

  const route_read = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await model.read(params, model_options)
      return _packBodyData(data)
    })
  }
  
  const route_key_list = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      // TODO : handle transactions
      const params = queryStringToJson(ctx.request.url)
      const model_options= {transaction: undefined}
      const data = await model.keyList(params, model_options)    
      return _packBodyData(data)
    })
  }
  
  const route_find = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await model.find(params.id, model_options)
      return _packBodyData(data)
    })
  }

  const route_distinct = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await model.distinct(params.distinct_field, params, model_options)
      return _packBodyData(data)
    })
  }
  
  const route_save = async (ctx) => {
    await _checkUserInfo(ctx, 'w', async (uinfo) => {
      const params = ctx.request.fields
      if (uinfo?.fieldnames?.created_by) {
        params[uinfo.fieldnames.created_by] = uinfo.uid
      }
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await model.insert(params, model_options)
      return _packBodyData(data)
    })
  }
  
  const route_update = async (ctx) => {
    await _checkUserInfo(ctx, 'w', async (uinfo) => {
      const params = ctx.request.fields
      if (uinfo?.fieldnames?.last_update_by) {
        params[uinfo.fieldnames.last_update_by] = uinfo.uid
      }
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await model.update(params, {id: params.id}, model_options)
      return _packBodyData(data)
    })
  }
  
  const route_delete = async (ctx) => {
    await _checkUserInfo(ctx, 'w', async (_uinfo) => {
      const params = ctx.request.fields
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await model.delete({id: params.id}, model_options)
      return _packBodyData(data)
    })
  }

  const url = `${prefix}/${route?.url || route.name}`.replace(/\/\//g, "/")

  logger.info(`Routing table ${route.name} to ${url}`)

  const mode = route?.options?.mode || 'rw'

  const allowRead = mode.indexOf('r')>=0
  const allowDelete = mode.indexOf('w')>=0
  const allowUpsave = (mode.indexOf('u')>=0) || allowDelete
  
  if (allowRead) {
    router.get (`${url}/find`     , (ctx) => route_find(ctx))
    router.get (`${url}/read`     , (ctx) => route_read(ctx))
    router.get (`${url}/distinct` , (ctx) => route_distinct(ctx))
    router.get (`${url}/key_list` , (ctx) => route_key_list(ctx)) 
  }

  if (allowUpsave) {
    router.post(`${url}/save`     , (ctx) => route_save(ctx))
    router.post(`${url}/update`   , (ctx) => route_update(ctx))
  }
  if (allowDelete) {
    router.post(`${url}/delete`   , (ctx) => route_delete(ctx))
  }

  return model
}

export default createRoutesForCrud