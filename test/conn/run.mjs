import data from './base/data.mjs'
import options from './base/options.mjs'

/*
import { initConnectionPG, PG_DB_NAME } from './postgres/init.mjs'
import { initConnectionLT, LT_DB_NAME } from './sqlite/init.mjs'
*/
import test_inspector from './base/units/test_inspector.mjs'
import test_model from './base/units/test_model.mjs'
import test_crud from './base/units/test_crud.mjs'
import test_crud_cached_conn from './base/units/test_crud_cached_conn.mjs'
import test_conn_reset from './base/units/test_conn_reset.mjs'



export function calustra_conn_test_run(testContext) {
  /*
  // Test Postgres
  test_inspector(testContext, 'postgres', initConnectionPG)
  test_model(testContext, 'postgres', initConnectionPG, data)
  test_crud(testContext, 'postgres', initConnectionPG, data)
  test_crud_cached_conn(testContext, 'postgres', PG_DB_NAME, initConnectionPG, data)
  test_conn_reset(testContext, 'postgres', PG_DB_NAME, initConnectionPG, data)


  // Test SQLite
  test_inspector(testContext, 'sqlite', initConnectionLT)
  test_model(testContext, 'sqlite', initConnectionLT, data)
  test_crud(testContext, 'sqlite', initConnectionLT, data)
  test_crud_cached_conn(testContext, 'sqlite', LT_DB_NAME, initConnectionLT, data)
  test_conn_reset(testContext, 'sqlite', LT_DB_NAME, initConnectionLT, data)
  */

  
  async function initCallback (test_options) {
    const postgres = await testContext.getConnection(testContext.config, {
      ...options,
      ...test_options
    })
    return postgres  
  }  


  test_inspector(testContext, initCallback)
  test_model(testContext, initCallback, data)
  test_crud(testContext, initCallback, data)
  test_crud_cached_conn(testContext, initCallback, data)
  test_conn_reset(testContext, initCallback, data)  
}
