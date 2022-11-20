import config from './config'
import router_test_prepare_one from './server_one/prepare'
import router_test_run_one from './server_one/run'
import router_test_clean_one from './server_one/clean'
import router_test_prepare_two from './server_two/prepare'
import router_test_run_two from './server_two/run'
import router_test_clean_two from './server_two/clean'

function _router_test_one(config, server, name, calustra) {  
  describe(`calustra-router: Prepare things for testing ${name} under ${config.dialect}`, function() {
    
    router_test_prepare_one (config, calustra)
    router_test_run_one (config, server, name, calustra)
    router_test_clean_one (config, calustra)
  })
}

function _router_test_two(config, server, name, calustra) {  
  describe(`calustra-router: Prepare things for testing ${name} under ${config.dialect}`, function() {
    
    router_test_prepare_two (config, calustra)
    router_test_run_two (config, server, name, calustra)
    router_test_clean_two (config, calustra)
  })
}


for (const [name, calustra] of Object.entries(config.calustra)) {
  //_router_test_one(config.connections.postgres, config.server, name, calustra)
  //_router_test_one(config.connections.sqlite, config.server, name, calustra)
  _router_test_two(config.connections.postgres, config.server, name, calustra)
  //_router_test_two(config.connections.sqlite, config.server, name, calustra)
}
