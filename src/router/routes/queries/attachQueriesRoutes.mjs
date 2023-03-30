function attachQueriesRoutes(router, queriesConfig, logger) {
  const prefix= queriesConfig.prefix

  queriesConfig.routes.map(route => {
    
    let url = (!prefix)
      ? `/${route.url}`
      : `${prefix}/${route.url}`
    while (url.indexOf('//')>=0) {
      url= url.replace(/\/\//g, "/")
    }
    

    logger.info(`Routing callback ${route.callback?.name || ''} to ${url}`)

    const _route_callback = async (ctx) => {
      let uid= undefined
      if (route.getUserId) {
        uid= route.getUserId(ctx)
      }
  
      const authUser = route.authUser
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
  
      const result= await route.callback(ctx)
      return result
    }

    if (route.method == 'POST') {
      router.post(url, (ctx) => _route_callback(ctx, route))
    } else {
      router.get(url, (ctx) => _route_callback(ctx, route))
    }
  })

}

export default attachQueriesRoutes