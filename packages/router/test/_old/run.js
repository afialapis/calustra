import router_test_prepare from './prepare'
import router_test_clean from './clean'
import {serve, serveAllTables} from '../common/server'

function router_test_run(name, serverConfig, connConfig, routesConfig, callback) {  
  let server

  describe(`calustra-router: Prepare things for testing ${name} under ${connConfig.connection.database.dialect}`, function() {
    
    router_test_prepare (connConfig)

    it(`[RUN][START] should start test server`, function() {

      server = serve(serverConfig, connConfig, routesConfig)
  
    })
            
    callback(serverConfig, connConfig, routesConfig, name)

    it(`[RUN][STOP] should stop test server`, function() {

      server.close()
  
    })

    router_test_clean (connConfig)
  })
}

async function router_test_run_all_tables(name, serverConfig, connConfig, callback) {  
  let server

  describe(`calustra-router: Prepare things for testing ${name} under ${connConfig.connection.database.dialect}`, function() {
    
    router_test_prepare (connConfig)

    it(`[RUN][START] should start test server`, function() {

      server = serveAllTables(serverConfig, connConfig)
  
    })
            
    callback()

    it(`[RUN][STOP] should stop test server`, function() {

      server.close()
  
    })

    router_test_clean (connConfig)
  })
}



export {router_test_run, router_test_run_all_tables}