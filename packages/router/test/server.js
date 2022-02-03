import Koa from 'koa'
import config from './config'

let server

const start = (routes) => {

  const app = new Koa()

  if (routes!=undefined) {
    app.use(routes)
  }

  server= app.listen(config.server.port, function () {
    //console.info('Listening on port ' + config.server.port)
  })
}

const stop = () => {
  server.close()
}

export {start, stop}