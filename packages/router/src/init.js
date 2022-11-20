import {getConnection as getConnectionCal, getModel as getModelCal} from 'calustra-orm'
import {calustraRouter, calustraRouterAll} from './router'

function useCalustraDbContext(app, config, options) {

  const getConnection = () => {
    const conn = getConnectionCal(config, options)
    return conn
  }
  const getModel = (tableName, model_options) => {
    const all_options= {
      ...options || {},
      ...model_options || {}
    }
    const model = getModelCal(config, tableName, all_options)
    
    return model    
  }

  app.context.db= {
    getConnection,
    getModel
  }

  return app
}

function useCalustraRouter(app, connOrConfig, config) {

  if (! config) {
    return undefined
  }

  const conn= getConnectionCal(connOrConfig)
  const router= calustraRouter(conn, config)
  app.use(router.routes())

  return app
}


async function useCalustraRouterAsync (app, connOrConfig, config) {
  if (! config) {
    return undefined
  }
  
  const conn= getConnectionCal(connOrConfig)
  const router= await calustraRouterAll(conn, config)
  app.use(router.routes())

  return app
}


export {useCalustraDbContext, useCalustraRouter, useCalustraRouterAsync}
