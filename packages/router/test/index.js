import {getConnection} from 'calustra-conn'
import router_test_prepare from './units/prepare'
import router_test_start from './units/start'
import router_test_fetch from './units/fetch'
import router_test_stop from './units/stop'
import router_test_clean from './units/clean'
import config from './config'
import data from './data'


function _router_test_unit(db, server) {

  const conn= getConnection(db)

  describe(`DiBiRouter: Prepare things for testing ${db.connection.dialect}`, function() {
    
    router_test_prepare (conn, data)

    router_test_start (conn, server)
    router_test_fetch (server, data)

    router_test_clean (conn)
    router_test_stop ()   
  })
}



_router_test_unit(config.db.postgres, config.server)
_router_test_unit(config.db.sqlite, config.server)
