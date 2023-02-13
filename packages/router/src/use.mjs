import {getConnection as getConnectionCal} from 'calustra-orm'
import {calustraRouter, calustraRouterForAllTables} from './router/index.mjs'

function useCalustraDbContext(app, connOrConfig) {

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

function useCalustraRouter(app, connOrConfig, routes) {

  const router= calustraRouter(connOrConfig, routes)
  
  if (router) {
    app.use(router.routes())
  }

  return app
}


async function useCalustraRouterForAllTables (app, connOrConfig, schema= 'public') {

  const router= await calustraRouterForAllTables(connOrConfig, schema)
  if (router) {
    app.use(router.routes())
  }

  return app
}


export {useCalustraDbContext, useCalustraRouter, useCalustraRouterForAllTables}
