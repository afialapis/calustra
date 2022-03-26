async function createRoutesForQueries(db, router, router_options, logger) {
  /*
    queries is a list of [{
    
      url: '/crud/todos/fake',
      method: 'POST',
      callback: q_todos_insert_fake,
      authUser: {
        require: true,
        action: 'redirect',
        redirect_url: '/'
      },         
    
    }]
  */

  const _query_callback = async (ctx, query) => {
    const getUserId = query?.getUserId || router_options.getUserId
    const uid= getUserId(ctx)

    const authUser = {
      require: false,
      ...router_options?.authUser || {},
      ...query?.authUser || {},
    }
    const checkAuth= (authUser.require===true) || (authUser.require==='read-only' && query.method==='POST')

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

    const result= await query.callback(ctx, db)
    return result
  }

  const queries= router_options?.queries

  if (queries == undefined || queries.length==0) {
    return
  }

  queries.map(query => {
    
    const url = `${router_options.prefix}/${query.url}`.replace(/\/\//g, "/")

    if (query.method == 'POST') {
      router.post(url, (ctx) => _query_callback(ctx, query))
    } else {
      router.get(url, (ctx) => _query_callback(ctx, query))
    }

  })



}

export default createRoutesForQueries