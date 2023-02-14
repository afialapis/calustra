import queryStringToJson from '../../util/queryStringToJson.mjs'


function attachCrudRoutes(connection, router, crudConfig, logger) {
  
  const prefix= crudConfig.prefix

  crudConfig.routes.map(route => {

    const model= connection.getModel(route.name)

    if (! model) {
      logger.error(`[calustra-router] Could not get model for ${route.name}`)
      return
    }
        
    const _packBodyData = (data) => {
      if (route.bodyField == undefined) {
        return data
      }
      return {
        [route.bodyField]: data
      }
    }
    

    const _checkUserInfo = async (ctx, op, callback) => {
      let uid= undefined
      if (route.getUserId) {
        uid= route.getUserId(ctx)
      }

      let allowed= true

      const authUser = route.authUser

      const checkAuth= (authUser.require===true) || (authUser.require==='read-only' && op==='w')

      if (checkAuth) {

        if (uid===undefined) {

          if (authUser.action=='error') {
            
            logger.error(`[calustra-router] Unauthorized access. Throwing error ${authUser.error_code}`)
            ctx.throw(
              authUser.error_code,
              null,
              {}
            )
          } else {
            logger.error(`[calustra-router] Unauthorized access. Redirecting to ${authUser.redirect_url}`)
            ctx.redirect(authUser.redirect_url)
          }

          allowed= false
        }
      }

      let fieldNames= {}
      if (route.useUserFields.use===true) {
        fieldNames= route.useUserFields.fieldNames
      }

      const uinfo= {
        uid: uid,
        fieldNames,
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
        const options= {transaction: undefined}
        const data = await model.read(params, options)
        return _packBodyData(data)
      })
    }
    
    const route_key_list = async (ctx) => {
      await _checkUserInfo(ctx, 'r', async (_uinfo) => {
        // TODO : handle transactions
        const params = queryStringToJson(ctx.request.url)
        const options= {transaction: undefined}
        const data = await model.keyList(params, options)    
        return _packBodyData(data)
      })
    }
    
    const route_find = async (ctx) => {
      await _checkUserInfo(ctx, 'r', async (_uinfo) => {
        const params = queryStringToJson(ctx.request.url)
        // TODO : handle transactions
        const options= {transaction: undefined}    
        const data = await model.find(params.id, options)
        return _packBodyData(data)
      })
    }

    const route_distinct = async (ctx) => {
      await _checkUserInfo(ctx, 'r', async (_uinfo) => {
        const params = queryStringToJson(ctx.request.url)
        // TODO : handle transactions
        const options= {transaction: undefined}
        const data = await model.distinct(params.distinct_field, params, options)
        return _packBodyData(data)
      })
    }
    
    const route_save = async (ctx) => {
      await _checkUserInfo(ctx, 'w', async (uinfo) => {
        const params = ctx.request.fields
        if (uinfo?.fieldNames?.created_by) {
          params[uinfo.fieldNames.created_by] = uinfo.uid
        }
        // TODO : handle transactions
        const options= {transaction: undefined}
        const data = await model.insert(params, options)
        return _packBodyData(data)
      })
    }
    
    const route_update = async (ctx) => {
      await _checkUserInfo(ctx, 'w', async (uinfo) => {
        const params = ctx.request.fields
        if (uinfo?.fieldNames?.last_update_by) {
          params[uinfo.fieldNames.last_update_by] = uinfo.uid
        }
        // TODO : handle transactions
        const options= {transaction: undefined}    
        const data = await model.update(params, {id: params.id}, options)
        return _packBodyData(data)
      })
    }
    
    const route_delete = async (ctx) => {
      await _checkUserInfo(ctx, 'w', async (_uinfo) => {
        const params = ctx.request.fields
        // TODO : handle transactions
        const options= {transaction: undefined}    
        const data = await model.delete({id: params.id}, options)
        return _packBodyData(data)
      })
    }

    let url = (!prefix)
      ? `/${route.url}`
      : `/${prefix}/${route.url}`
    
    while (url.indexOf('//')>=0) {
      url= url.replace(/\/\//g, "/")
    }

    logger.info(`[calustra-router] Routing table ${route.name} to ${url}`)
    console.log(`[calustra-router] Routing table ${route.name} to ${url}`)

    const allowRead = route.mode.indexOf('r')>=0
    const allowDelete = route.mode.indexOf('w')>=0
    const allowUpsave = (route.mode.indexOf('u')>=0) || allowDelete
    
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
  })

  return router
}

export default attachCrudRoutes