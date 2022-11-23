import {getConnection as getConnectionCal} from 'calustra-orm'
import {calustraRouter, calustraRouterForAllTables} from './router'

function useCalustraDbContext(app, config) {

  const getConnection = () => getConnectionCal(config)

  const getModel = (name) => {
    const conn= getConnectionCal(config)
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
