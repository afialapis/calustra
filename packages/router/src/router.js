import Router    from 'koa-router'
import {getConnection} from 'calustra-orm'
import defaults from './defaults'

import {createCrudList, createCrudListAsync} from './objects/createCrudList'
import createRoutesForCrud from './objects/createRoutesForCrud'
import createRoutesForQueries from './objects/createRoutesForQueries'


function calustraRouter(connOrConfig, options) {

 const router_options= {
    ...defaults,
    ...options || {}
  }

  const crudRoutes= router_options?.crud?.routes
  const queryRoutes= router_options?.queries?.routes

  if (crudRoutes=='*') {
    throw `[calustra-router] If you want to router every database table, call async calustraRouterAll`
  }

  // Init the Koa Router
  const router = new Router()
  
  const crudRoutesOk= (crudRoutes!=undefined) && (crudRoutes.length>0)
  const queryRoutesOk= (queryRoutes!=undefined) && (queryRoutes.length>0)

  if ( (!crudRoutesOk) && (!queryRoutesOk)) {
    return router
  }  

  // Init connection object and cache it
  const conn= getConnection(connOrConfig, options)
  

  // Build crudList depending on tables param
  if (crudRoutesOk) {
    const crudList = createCrudList(crudRoutes)
 
    // create models and routes for each table
    for (const table of crudList) {
      createRoutesForCrud(conn, table, router, router_options.crud.prefix, router_options, conn.log)
    }
  }

  // create routes for queries
  if (crudRoutesOk) {
    createRoutesForQueries(router, router_options, conn.log)
  }

  // Return the router
  return router
}


async function calustraRouterAll(connOrConfig, options) {

  const router_options= {
    ...defaults,
    ...options || {}
  }

  const crudRoutes= router_options?.crud?.routes
  const queryRoutes= router_options?.queries?.routes

  if ( (crudRoutes!=undefined) && (crudRoutes!='*')) {
    throw `[calustra-router] If you want to router an specific table list, call async calustraRouter`
  }

  // Init the Koa Router
  const router = new Router()

  const crudRoutesOk= (crudRoutes!=undefined) && (crudRoutes.length>0)
  const queryRoutesOk= (queryRoutes!=undefined) && (queryRoutes.length>0)

  if ( (!crudRoutesOk) && (!queryRoutesOk)) {
    return router
  }  

  // Init connection object and cache it
  const conn= getConnection(connOrConfig, options)
  

  // Build crudList depending on tables param
  if (crudRoutesOk) {
    const crudList = await createCrudListAsync(conn, router_options.schema)
 
    // create models and routes for each table
    for (const table of crudList) {
      createRoutesForCrud(conn, table, router, router_options.crud.prefix, router_options, conn.log)
    }
  }

  // create routes for queries
  if (crudRoutesOk) {
    createRoutesForQueries(router, router_options, conn.log)
  }

  // Return the router
  return router
 }


export {calustraRouter, calustraRouterAll}