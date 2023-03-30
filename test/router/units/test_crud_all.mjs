import assert from 'assert'
import {getConnection} from '../../../src/conn/index.mjs'
import data from '../../common/data.mjs'
import {serveAllTables} from '../server.mjs'
import {fetchFromCrudAll} from '../fetch.mjs'



function run_test_crud_all (name, config, options, routesConfig, close= false) {  

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

    it(`[RUN][START] should start test server for all tables`, async function() {
      const conn= getConnection(config, options)
      server = await serveAllTables(conn)
  
    })
            

    it(`should fetch test_01 from crud (read, unfiltered)`, async function() {

      const res = await fetchFromCrudAll('test_01', 'read')
      assert.strictEqual(res.length, data.length)

    })

    
    it(`should fetch test_01 from crud (read, filtered by name)`, async function() {

      const res = await fetchFromCrudAll('test_01', 'read?name=Peter')
      assert.strictEqual(res.length, data.filter(r => r.name=='Peter').length)
    })

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



export {run_test_crud_all}
