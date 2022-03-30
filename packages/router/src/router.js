import Router    from 'koa-router'
import {routerCache} from './cache'
import createOptions from './objects/createOptions'
import createConnection from './objects/createConnection'
import createCrudList from './objects/createCrudList'
import createRoutesForCrud from './objects/createRoutesForCrud'
import createRoutesForQueries from './objects/createRoutesForQueries'


async function calustraRouter(connOrConfig, options) {

 const router_options= createOptions(options)

  // Init connection object and cache it
  const conn= createConnection(connOrConfig)
  routerCache.saveConnection(conn)


  // Build crudList depending on tables param
  const crudList = await createCrudList(conn, router_options.crud.routes, router_options.schema)

  // Init the Koa Router
  const router = new Router()
  
  // create models and routes for each table
  const promises= crudList.map((table) => 
    createRoutesForCrud(conn, table, router, router_options.crud.prefix, router_options, conn.log)
  )

  // read all models returned by createRoutesForCrud
  const models= await Promise.all(promises)
  
  // cache the models
  models.map((model) => routerCache.saveModel(conn, model.tablename, model))

  // create routes for queries
  await createRoutesForQueries(conn, router, router_options, conn.log)

  // Return the router
  return router
}


export default calustraRouter