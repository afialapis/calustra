import {getConnection} from '../../../src/conn/index.mjs'
import data from '../../common/data.mjs'
import {serve, serveAllTables} from '../server.mjs'
import { remoteParamsForRoute } from '../fetch.mjs'
import { Fetcher } from '../../../src/fetcher/index.mjs'



function _run_test_base (name, config, options, close, callback) {  

  

  describe(`calustra-router: Test ${name} under ${config.dialect}`, function() {
      
    it('[PREPARE] should prepare database', async function() {
      const conn= getConnection(config, options)
      let query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
      query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)

      const Test01 = conn.getModel('test_01')
      for (const rec of data) {
        await Test01.insert(rec)
      }
    })

    callback()
            
    
    it('[CLEAN] should clean [and close] database', async function() {
      const conn= getConnection(config, options)
      const query = `DROP TABLE test_01`
      await conn.execute(query)

      if (close) {
        conn.close()
      }
    })
  })
}

function run_test_base_for_routes (name, config, options, routesConfig, close, callback) {  
  let server
  const fetcher = new Fetcher()
  const [url, bodyField]= remoteParamsForRoute(routesConfig)

  _run_test_base (name, config, options, close, () => {
    it(`[RUN][START] should start test server`, function() {
      const conn= getConnection(config, options)
      server = serve(conn, routesConfig)
    })

    callback(fetcher, url, bodyField)
            
    it(`[RUN][STOP] should stop test server`, function() {
      server.close()
    })
  })
}


function run_test_base_for_all (name, config, options, close, callback) {  
  let server
  const fetcher = new Fetcher()
  const [url, _]= remoteParamsForRoute(undefined)

  _run_test_base (name, config, options, close, () => {
    it(`[RUN][START] should start test server`, async function() {
      const conn= getConnection(config, options)
      server = await serveAllTables(conn)
    })

    callback(fetcher, url)
            
    it(`[RUN][STOP] should stop test server`, function() {
      server.close()
    })
  })
}




export {run_test_base_for_routes, run_test_base_for_all}
