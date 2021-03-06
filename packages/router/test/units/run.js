import assert from 'assert'
import fetch from 'node-fetch'
import {getConnection} from 'calustra'
import CalustraRouter from '../../src'
import {start, stop} from './server'
import data from './data'

function router_test_run (config, server, name, calustra) {

  it(`[RUN][${name}][START] should init crud/queries and server them on ${calustra.prefix}`, async function() {

    const conn= getConnection(config)
    const router = await CalustraRouter(conn, calustra)
    start(server, router.routes())

  })

  it(`[RUN][${name}][FETCH] should fetch test_01 from crud (READ)`, async function() {

    const url= `http://localhost:${server.port}${calustra.crud.prefix}/test_01/read`
    const response= await fetch(url)
    let result= await response.json()
    if (calustra.body_field != undefined) {
      result= result[calustra.body_field]
    }
    assert.strictEqual(result.length, data.length)

  })

  const queries= calustra?.queries?.routes || []
  if (queries.length>0) {
    const query= queries[0]

    it(`[RUN][${name}][FETCH] should fetch query on ${query.url}`, async function() {
      
      const url= `http://localhost:${server.port}${calustra.queries.prefix}${query.url}`
      const response= await fetch(url)
      await query._test_check(response, assert)
    })
  }


  it(`[RUN][${name}][STOP] should stop test server`, function() {

    stop()

  })

}

export default router_test_run
