import Koa from 'koa'
import assert from 'assert'
import fetch from 'node-fetch'
import {useCalustraDbContext, useCalustraRouter, useCalustraRouterAsync} from '../../../src'
import data from './data'



function router_test_run (config, server_options, name, calustra) {

  let server

  it(`[RUN][${name}][START] should init crud/queries and server them`, async function() {

    const app = new Koa()

    useCalustraDbContext(app, config, calustra)

    if (calustra.crud.routes=='*') {
      await useCalustraRouterAsync(app, config, calustra)
    } else {
      useCalustraRouter(app, config, calustra)
    }

    server= app.listen(server_options.port, function () {
      //console.info('Listening on port ' + server_options.port)
      
    })


  })

  it(`[RUN][${name}][FETCH] should fetch test_01 from crud (READ)`, async function() {

    const url= `http://localhost:${server_options.port}${calustra.crud.prefix}/test_01/read`
    const response= await fetch(url)

    let result= await response.json()

    if (calustra.bodyField != undefined) {
      result= result[calustra.bodyField]
    }
    assert.strictEqual(result.length, data.length)

  })

  const queries= calustra?.queries?.routes || []
  if (queries.length>0) {
    const query= queries[0]

    it(`[RUN][${name}][FETCH] should fetch query on ${query.url}`, async function() {
      
      const url= `http://localhost:${server_options.port}${calustra.queries.prefix}${query.url}`
      const response= await fetch(url)
      await query._test_check(response, assert)
    })
  }


  it(`[RUN][${name}][STOP] should stop test server`, function() {

    server.close()

  })

}

export default router_test_run
