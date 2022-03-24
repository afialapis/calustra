import Router    from 'koa-router'
import {routerCache} from './cache'
import {createDb} from './objects/createDb'
import createModel from './objects/createModel'
import createRouter from './objects/createRouter'
import { makeOptions } from './options'


async function calustraRouter(dbOrConfig, tables= '*', prefix= '/api', schema= 'public', options) {

  /*
    options: {
      body_field: 'result'
    }
  */

 const roptions= makeOptions(options)

  // Init db object and cache it
  const db= createDb(dbOrConfig)
  routerCache.saveDb(db)
    
  // Build tableList depending on tables param
  let tableList = []
  if (tables==='*') {
    const readFromDb= await db.getTableNames(schema)
    tableList= readFromDb.map((t) => {
      return {
        name: t,
        options: {}
      }
    })
  } else if (typeof tables == 'string') {
    tableList.push({name: tables, options: {}})
  } else {
    for (let tab of tables) {
      if (typeof tab == 'string') {
        tableList.push({name: tab, options: {}})
      } else {
        tableList.push(tab)
      }
    }
  }

  // Init the Koa Router
  const router = new Router()

  const promises= tableList.map((tab) => createModel(db, tab.name, tab.options))

  const models= await Promise.all(promises)

  models.map((model, idx) => {
    const tab= tableList[idx]

    routerCache.saveModel(db, tab.name, model)

    // Create the router
    const calustra_router= createRouter(model, roptions)

    // attah it to relative path for the table
    const tab_path = `${prefix}/${tab?.route || tab.name}`
    calustra_router.attachTo(router,  tab_path, tab.auth /*, ['find', 'key_list', 'remove']*/)    
  })

  // Return the router
  return router
}


export default calustraRouter