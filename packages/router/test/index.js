import config from './config'
import router_test_prepare from './units/prepare'
import router_test_run from './units/run'
import router_test_clean from './units/clean'

function _router_test_unit(config, server, name, calustra) {  
  describe(`DiBiRouter: Prepare things for testing ${name} under ${config.dialect}`, function() {
    
    router_test_prepare (config, calustra)

    router_test_run (config, server, name, calustra)

    router_test_clean (config, calustra)
  })
}

for (const [name, calustra] of Object.entries(config.calustra)) {
  _router_test_unit(config.connections.postgres, config.server, name, calustra)
  _router_test_unit(config.connections.sqlite, config.server, name, calustra)
}
