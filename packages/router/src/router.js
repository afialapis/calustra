import Router    from 'koa-router'
import {routerCache} from './cache'
import createOptions from './objects/createOptions'
import createDb from './objects/createDb'
import createCrudList from './objects/createCrudList'
import createRoutesForCrud from './objects/createRoutesForCrud'
import createRoutesForQueries from './objects/createRoutesForQueries'


async function calustraRouter(dbOrConfig, options) {

 const router_options= createOptions(options)

  // Init db object and cache it
  const db= createDb(dbOrConfig)
  routerCache.saveDb(db)


  // Build crudList depending on tables param
  const crudList = await createCrudList(db, router_options.crud, router_options.schema)

  // Init the Koa Router
  const router = new Router()
  
  // create models and routes for each table
  const promises= crudList.map((table) => 
    createRoutesForCrud(db, table, router, router_options)
  )

  // read all models returned by createRoutesForCrud
  const models= await Promise.all(promises)
  
  // cache the models
  models.map((model) => routerCache.saveModel(db, model.tablename, model))

  // create routes for queries
  await createRoutesForQueries(db, router, router_options)

  // Return the router
  return router
}


export default calustraRouter