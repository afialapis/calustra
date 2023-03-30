import Koa from 'koa'
import {initCalustraRouter, initCalustraRouterForAllTables} from '../../src/router/index.mjs'
import {server as config} from '../common/config/index.mjs'

const serve = (connection, routesConfig) => {

  const app = new Koa()

  app.context.connection= connection

  initCalustraRouter(app, connection, routesConfig)

  const server= app.listen(config.port, function () {
    //console.info('Listening on port ' + server_options.port)
    
  })
  return server
}

const serveAllTables = async (connection, prefix= '') => {

  const app = new Koa()

  app.context.connection= connection

  await initCalustraRouterForAllTables(app, connection, prefix)

  const server= app.listen(config.port, function () {
    //console.info('Listening on port ' + server_options.port)
    
  })
  return server
}



export {serve, serveAllTables}