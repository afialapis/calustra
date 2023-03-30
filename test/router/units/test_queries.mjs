import assert from 'assert'
import {getConnection} from '../../../src/conn/index.mjs'
 import data from '../../common/data.mjs'
 import {serve} from '../server.mjs'
 import {fetchFromQuery} from '../fetch.mjs'


function _run_test_queries (name, config, options, routesConfig, callback, close= false) {  

  let server

  describe(`calustra-router: Test ${name} under ${config.dialect}`, function() {
      
    it('[PREPARE] should drop test_01 table if exists', async function() {
      const conn= getConnection(config, options)
      const query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)

    })

    it('[PREPARE] should create test_01 table', async function() {
      const conn= getConnection(config, options)

      const query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)

    })

    it('[PREPARE] should create test records', async function() {
      const conn= getConnection(config, options)
      const Test01 = conn.getModel('test_01')

      for (const rec of data) {
        await Test01.insert(rec)
      }

    })

    it(`[RUN][START] should start test server`, function() {
      const conn= getConnection(config, options)
      server = serve(conn, routesConfig)
  
    })
            
    callback()

    it(`[RUN][STOP] should stop test server`, function() {

      server.close()
  
    })
    
    it('[CLEAN] should drop test_01', async function() {

      const conn= getConnection(config, options)
      const query = `DROP TABLE test_01`
      await conn.execute(query)
      
    })
  
    if (close) {
      it(`should close connection`, async function() {
        const conn = getConnection(config, options)
        conn.close()
      })    
    }

  })

}

function run_test_queries_noauth(name, config, options, routesConfig, close= false) {
  _run_test_queries (name, config, options, routesConfig, () => {
    it(`should fetch test_01 from query noauth (read, unfiltered)`, async function() {

      const response = await fetchFromQuery(routesConfig, '/query/noauth')
      let result= await response.json()

      assert.strictEqual(result.name, 'Peter')

    })
  }, close)
}

function run_test_queries_auth(name, config, options, routesConfig, close= false) {
  _run_test_queries (name, config, options, routesConfig, () => {
    it(`should fetch test_01 from query auth (returns error)`, async function() {

      const response = await fetchFromQuery(routesConfig, '/query/auth')
      assert.strictEqual(response.status, 404)

    })
  }, close)
}


export {run_test_queries_noauth, run_test_queries_auth}

