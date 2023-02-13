import Koa from 'koa'
import {useCalustraDbContext, useCalustraRouter, useCalustraRouterForAllTables} from '../src/index.mjs'

const serve = (config, connOrConfig, routesConfig) => {

  const app = new Koa()

  useCalustraDbContext(app, connOrConfig)

  useCalustraRouter(app, connOrConfig, routesConfig)

  const server= app.listen(config.port, function () {
    //console.info('Listening on port ' + server_options.port)
    
  })
  return server
}

const serveAllTables = async (config, connOrConfig, prefix= '') => {

  const app = new Koa()

  useCalustraDbContext(app, connOrConfig)

  await useCalustraRouterForAllTables(app, connOrConfig, prefix)

  const server= app.listen(config.port, function () {
    //console.info('Listening on port ' + server_options.port)
    
  })
  return server
}



export {serve, serveAllTables}