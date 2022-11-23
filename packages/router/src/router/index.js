import Router    from 'koa-router'
import {getConnection} from 'calustra-orm'

import getCrudConfig from './crud/getCrudConfig'
import attachCrudRoutes from './crud/attachCrudRoutes'
import createCrudConfigForAllTables from './crud/createCrudConfigForAllTables'

import getQueriesConfig from './queries/getQueriesConfig'
import attachQueriesRoutes from './queries/attachQueriesRoutes'


function calustraRouter(connOrConfig, routes) {

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

    // Init connection object
    const connection= getConnection(connOrConfig)

    // Check connection
    if ( !connection ) {
      throw "[calustra-router] Could not get any connection from the passed <connOrConfig> param"
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
    console.error(connOrConfig)
    console.error('[calustra-router] routes:')
    console.error(routes)
    
  }

  // Return the router
  return router
}



async function calustraRouterForAllTables(connOrConfig, prefix= '', schema= 'public') {

  // Init connection object
  const connection= getConnection(connOrConfig)

  // Check connection
  if ( !connection ) {
    throw "[calustra-router] Could not get any connection from the passed <connOrConfig> param"
  }  
  
  const crudConfig = await createCrudConfigForAllTables(connection, prefix, schema)

  // check routes
  const crudRoutesOk= ((crudConfig?.routes!=undefined) && (crudConfig.routes.length>0))

  if ( !crudRoutesOk ) {
    throw "[calustra-router] Could not get any route for the passed <connOrConfig> param"
  }  

  // Init the Koa Router
  const router = new Router()

  // attach CRUD routes
  attachCrudRoutes(connection, router, crudConfig, connection.log)


  // Return the router
  return router  
}


export {calustraRouter, calustraRouterForAllTables}