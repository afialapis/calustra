import Koa from 'koa'

let server

const start = (config, routes) => {

  const app = new Koa()

  if (routes!=undefined) {
    app.use(routes)
  }

  server= app.listen(config.port, function () {
    //console.info('Listening on port ' + config.server.port)
  })
}

const stop = () => {
  server.close()
}

export {start, stop}