import queryStringToJson from '../util/queryStringToJson'
import createModel from './createModel'


async function createRoutesForCrud(connection, route, router, prefix, router_options, logger) {
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
  const model= await createModel(connection, route.name, route?.options || {})
      
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
      fieldnames
    }

    await callback(uinfo)
  }

  const read = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await model.read(params, model_options)
      ctx.body = _packBodyData(data)
    })
  }
  
  const key_list = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      // TODO : handle transactions
      const params = queryStringToJson(ctx.request.url)
      const model_options= {transaction: undefined}
      const data = await model.keyList(params, model_options)    
      ctx.body = _packBodyData(data)
    })
  }
  
  const find = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await model.find(params.id, model_options)
      ctx.body = _packBodyData(data)
    })
  }

  const distinct = async (ctx) => {
    await _checkUserInfo(ctx, 'r', async (_uinfo) => {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await model.distinct(params.distinct_field, params, model_options)
      ctx.body = _packBodyData(data)
    })
  }
  
  const save = async (ctx) => {
    await _checkUserInfo(ctx, 'w', async (uinfo) => {
      const params = ctx.request.fields
      if (uinfo?.fieldnames?.created_by) {
        params[uinfo.fieldnames.created_by] = uinfo.uid
      }
      // TODO : handle transactions
      const model_options= {transaction: undefined}
      const data = await model.insert(params, model_options)
      ctx.body= _packBodyData(data)
    })
  }
  
  const update = async (ctx) => {
    await _checkUserInfo(ctx, 'w', async (uinfo) => {
      const params = ctx.request.fields
      if (uinfo?.fieldnames?.last_update_by) {
        params[uinfo.fieldnames.last_update_by] = uinfo.uid
      }
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await model.update(params, {id: params.id}, model_options)
      ctx.body= _packBodyData(data)
    })
  }
  
  const remove = async (ctx) => {
    await _checkUserInfo(ctx, 'w', async (_uinfo) => {
      const params = ctx.request.fields
      // TODO : handle transactions
      const model_options= {transaction: undefined}    
      const data = await model.delete({id: params.id}, model_options)
      ctx.body = _packBodyData(data)
    })
  }

  const url = `${prefix}/${route?.url || route.name}`.replace(/\/\//g, "/")

  logger.info(`Routing table ${route.name} to ${url}`)

  const avoid = route?.options?.avoid || []
  
  if (avoid.indexOf('find')<0) 
    router.get (`${url}/find`     , (ctx) => find(ctx))
  if (avoid.indexOf('read')<0)
    router.get (`${url}/read`     , (ctx) => read(ctx))
  if (avoid.indexOf('distinct')<0)
    router.get (`${url}/distinct` , (ctx) => distinct(ctx))
  if (avoid.indexOf('save')<0)
    router.post(`${url}/save`     , (ctx) => save(ctx))
  if (avoid.indexOf('update')<0)
    router.post(`${url}/update`   , (ctx) => update(ctx))
  if (avoid.indexOf('remove')<0)
    router.post(`${url}/remove`   , (ctx) => remove(ctx))
  if (avoid.indexOf('key_list')<0)
    router.get (`${url}/key_list` , (ctx) => key_list(ctx)) 

  return model
}

export default createRoutesForCrud