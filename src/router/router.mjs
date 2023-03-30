import Router    from 'koa-router'
import getCrudConfig from './routes/crud/getCrudConfig.mjs'
import attachCrudRoutes from './routes/crud/attachCrudRoutes.mjs'
import createCrudConfigForAllTables from './routes/crud/createCrudConfigForAllTables.mjs'

import getQueriesConfig from './routes/queries/getQueriesConfig.mjs'
import attachQueriesRoutes from './routes/queries/attachQueriesRoutes.mjs'


function calustraRouter(connection, routes) {

  // Init the Koa Router
  const router = new Router()
  
  try {
    // Parse routes
    const crudConfig= getCrudConfig(routes)
    const queriesConfig= getQueriesConfig(routes)
    
    // check routes
    const crudRoutesOk= ((crudConfig?.routes!=undefined) && (crudConfig.routes.length>0))
    const queriesRoutesOk= ((queriesConfig?.routes!=undefined) && (queriesConfig.routes.length>0))

    if ( (!crudRoutesOk) && (!queriesRoutesOk)) {
      throw "[calustra-router] Could not get any route from the passed <routes> param"
    }  

    // attach CRUD routes
    if (crudRoutesOk) {
      attachCrudRoutes(connection, router, crudConfig, connection.log)
    }

    // create routes for queries
    if (queriesRoutesOk) {
      attachQueriesRoutes(router, queriesConfig, connection.log)
    }
  } catch(e) {
    console.error(e)
    console.error('[calustra-router] Error initing the router. Probably config objects are not ok')
    console.error('[calustra-router] connOrConfig:')
    console.error(connection?.config)
    console.error('[calustra-router] routes:')
    console.error(routes)
    
  }

  // Return the router
  return router
}



async function calustraRouterForAllTables(connection, prefix= '', schema= 'public') {
  const crudConfig = await createCrudConfigForAllTables(connection, prefix, schema)

  // check routes
  const crudRoutesOk= ((crudConfig?.routes!=undefined) && (crudConfig.routes.length>0))

  if ( !crudRoutesOk ) {
    throw "[calustra-router] Could not get any route for the connection"
  }  

  // Init the Koa Router
  const router = new Router()

  // attach CRUD routes
  attachCrudRoutes(connection, router, crudConfig, connection.log)


  // Return the router
  return router  
}


export {calustraRouter, calustraRouterForAllTables}