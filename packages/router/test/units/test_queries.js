import assert from 'assert'
import {getConnection} from '../../src'
import {
  server_config, 
  conn_postgres, 
  conn_sqlite,
  rou_queries_noauth,
  rou_queries_auth
 } from '../config'
 import data from '../data'
 import {serve} from '../server'
 import {fetchFromQuery} from '../fetch'



function _run_test_queries (name, connConfig, routesConfig, callback, close= false) {  

  let server

  describe(`calustra-router: Test ${name} under ${connConfig.connection.database.dialect}`, function() {
      
    it('[PREPARE] should drop test_01 table if exists', async function() {
      const conn= getConnection(connConfig)
      const query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)

    })

    it('[PREPARE] should create test_01 table', async function() {
      const conn= getConnection(connConfig)

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
      const conn= getConnection(connConfig)
      const Test01 = conn.getModel('test_01')

      for (const rec of data) {
        await Test01.insert(rec)
      }

    })

    it(`[RUN][START] should start test server`, function() {

      server = serve(server_config, connConfig, routesConfig)
  
    })
            
    callback()

    it(`[RUN][STOP] should stop test server`, function() {

      server.close()
  
    })
    
    it('[CLEAN] should drop test_01', async function() {

      const conn= getConnection(connConfig)
      const query = `DROP TABLE test_01`
      await conn.execute(query)
      
    })
  
    if (close) {
      it(`should close connection`, async function() {
        const conn = getConnection(connConfig)
        conn.close()
      })    
    }

  })

}

function run_test_queries_noauth(name, connConfig, close= false) {
  _run_test_queries (name, connConfig, rou_queries_noauth, () => {
    it(`should fetch test_01 from query noauth (read, unfiltered)`, async function() {

      const response = await fetchFromQuery(server_config, rou_queries_noauth, '/query/noauth')
      let result= await response.json()

      assert.strictEqual(result.name, 'Peter')

    })
  }, close)
}

function run_test_queries_auth(name, connConfig, close= false) {
  _run_test_queries (name, connConfig, rou_queries_auth, () => {
    it(`should fetch test_01 from query auth (returns error)`, async function() {

      const response = await fetchFromQuery(server_config, rou_queries_auth, '/query/auth')
      assert.strictEqual(response.status, 404)

    })
  }, close)
}



function run_test_queries() {
  run_test_queries_noauth('test_queries_pg_noauth', conn_postgres, false)
  run_test_queries_auth('test_queries_pg_auth', conn_postgres, true)

  run_test_queries_noauth('test_queries_sl_noauth', conn_sqlite, false)
  run_test_queries_auth('test_queries_sl_auth', conn_sqlite, true)
}


export {run_test_queries}

