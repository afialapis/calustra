import config from './config'
import router_test_prepare from './units/prepare'
import router_test_run from './units/run'
import router_test_clean from './units/clean'

function _router_test_unit(db, server, name, calustra) {  
  describe(`DiBiRouter: Prepare things for testing ${name} under ${db.connection.dialect}`, function() {
    
    router_test_prepare (db)

    router_test_run (db, server, name, calustra)

    router_test_clean (db)
  })
}

for (const [name, calustra] of Object.entries(config.calustra)) {
  _router_test_unit(config.db.postgres, config.server, name, calustra)
  _router_test_unit(config.db.sqlite, config.server, name, calustra)
}
