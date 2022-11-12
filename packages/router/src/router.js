import Router    from 'koa-router'
import {getConnection} from 'calustra-orm'
import defaults from './defaults'

import createCrudList from './objects/createCrudList'
import createRoutesForCrud from './objects/createRoutesForCrud'
import createRoutesForQueries from './objects/createRoutesForQueries'


async function calustraRouter(connOrConfig, options) {

 const router_options= {
    ...defaults,
    ...options || {}
  }


  // Init connection object and cache it
  const conn= getConnection(connOrConfig, options)


  // Build crudList depending on tables param
  const crudList = await createCrudList(conn, router_options.crud.routes, router_options.schema)

  // Init the Koa Router
  const router = new Router()
  
  // create models and routes for each table
  for (const table of crudList) {
    await createRoutesForCrud(conn, table, router, router_options.crud.prefix, router_options, conn.log)
  }

  // create routes for queries
  await createRoutesForQueries(conn, router, router_options, conn.log)

  // Return the router
  return router
}


export default calustraRouter