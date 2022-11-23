import assert from 'assert'
import {getConnection} from '../../src'
import {
  server_config, 
  conn_postgres, 
  conn_sqlite
 } from '../config'
 import data from '../data'
 import {serveAllTables} from '../server'
 import {fetchFromCrudAll} from '../fetch'



function _run_test_crud_all (name, connConfig, close= false) {  

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

    it(`[RUN][START] should start test server for all tables`, async function() {

      server = await serveAllTables(server_config, connConfig)
  
    })
            

    it(`should fetch test_01 from crud (read, unfiltered)`, async function() {

      const res = await fetchFromCrudAll(server_config, 'test_01', 'read')
      assert.strictEqual(res.length, data.length)

    })

    
    it(`should fetch test_01 from crud (read, filtered by name)`, async function() {

      const res = await fetchFromCrudAll(server_config, 'test_01', 'read?name=Peter')
      assert.strictEqual(res.length, data.filter(r => r.name=='Peter').length)
    })

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


function run_test_crud_all(close= false) {
  _run_test_crud_all('test_crud_all_pg_simple', conn_postgres, false)
  _run_test_crud_all('test_crud_all_pg_bodyfield', conn_postgres, close)

  _run_test_crud_all('test_crud_all_sl_simple', conn_sqlite,  false)
  _run_test_crud_all('test_crud_all_sl_bodyfield', conn_sqlite, close)
}


export {run_test_crud_all}
