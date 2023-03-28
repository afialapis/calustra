import Koa from 'koa'
import {initCalustraDbContext, initCalustraRouter, initCalustraRouterForAllTables} from '../src/index.mjs'

const serve = (config, connOrConfig, routesConfig) => {

  const app = new Koa()

  initCalustraDbContext(app, connOrConfig)

  initCalustraRouter(app, connOrConfig, routesConfig)

  const server= app.listen(config.port, function () {
    //console.info('Listening on port ' + server_options.port)
    
  })
  return server
}

const serveAllTables = async (config, connOrConfig, prefix= '') => {

  const app = new Koa()

  initCalustraDbContext(app, connOrConfig)

  await initCalustraRouterForAllTables(app, connOrConfig, prefix)

  const server= app.listen(config.port, function () {
    //console.info('Listening on port ' + server_options.port)
    
  })
  return server
}



export {serve, serveAllTables}