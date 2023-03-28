import {getConnection as getConnectionCal} from 'calustra-orm'
import {calustraRouter, calustraRouterForAllTables} from './router/index.mjs'

function initCalustraDbContext(app, connOrConfig) {

  const getConnection = () => getConnectionCal(connOrConfig)

  const getModel = (name) => {
    const conn= getConnectionCal(connOrConfig)
    return conn.getModel(name)
  }

  app.context.db= {
    getConnection,
    getModel
  }

  return app
}

function initCalustraRouter(app, connOrConfig, routes) {

  const router= calustraRouter(connOrConfig, routes)
  
  if (router) {
    app.use(router.routes())
  }

  return app
}


async function initCalustraRouterForAllTables (app, connOrConfig, schema= 'public') {

  const router= await calustraRouterForAllTables(connOrConfig, schema)
  if (router) {
    app.use(router.routes())
  }

  return app
}


export {initCalustraDbContext, initCalustraRouter, initCalustraRouterForAllTables}
