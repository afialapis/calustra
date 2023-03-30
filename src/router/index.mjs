import {calustraRouter, calustraRouterForAllTables} from './router.mjs'

function initCalustraRouter(app, connection, routes) {

  const router= calustraRouter(connection, routes)
  
  if (router) {
    app.use(router.routes())
  }

  return app
}


async function initCalustraRouterForAllTables (app, connection, prefix= '', schema= 'public') {

  const router= await calustraRouterForAllTables(connection, prefix, schema)
  if (router) {
    app.use(router.routes())
  }

  return app
}


export {initCalustraRouter, initCalustraRouterForAllTables}