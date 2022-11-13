function createRoutesForQueries(connection, router, router_options, logger) {
  /*
    router_options.queries
    {
      prefix: '',
      routes: a list of [{
      
        url: '/crud/todos/fake',
        method: 'POST',
        callback: q_todos_insert_fake,
        authUser: {
          require: true,
          action: 'redirect',
          redirect_url: '/'
        },         
      
      }]
    }
  */

  const _route_callback = async (ctx, route) => {
    const getUserId = route?.getUserId || router_options.getUserId
    let uid= undefined
    if (getUserId) {
      uid= getUserId(ctx)
    }

    const authUser = {
      require: false,
      ...router_options?.authUser || {},
      ...route?.authUser || {},
    }
    const checkAuth= (authUser.require===true) || (authUser.require==='read-only' && route.method==='POST')

    if (checkAuth) {

      if (uid===undefined) {

        if (authUser.action=='error') {
          logger.error(`Unauthorized access. Throwing error ${authUser.error_code}`)
          return ctx.throw(
            authUser.error_code,
            null,
            {}
          )
        } else {
          logger.error(`Unauthorized access. Redirecting to ${authUser.redirect_url}`)
          return ctx.redirect(authUser.redirect_url)
        }
      }
    }

    const result= await route.callback(ctx, connection)
    return result
  }

  const queries= router_options?.queries

  if (queries == undefined) {
    return
  }

  const routes = queries?.routes
  if (routes == undefined || routes.length == 0) {
    return
  }

  const prefix = queries?.prefix || ''

  routes.map(route => {
    
    const url = `${prefix}/${route.url}`.replace(/\/\//g, "/")

    logger.info(`Routing callback ${route.callback?.name || ''} to ${url}`)

    if (route.method == 'POST') {
      router.post(url, (ctx) => _route_callback(ctx, route))
    } else {
      router.get(url, (ctx) => _route_callback(ctx, route))
    }

  })



}

export default createRoutesForQueries