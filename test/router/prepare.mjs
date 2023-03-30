import {getConnection} from '../../src/conn/index.mjs'
import data from '../common/data.mjs'
import {serve} from './server.mjs'

async function router_tests_prepare_db (config, options) {  

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

  return conn
}

async function router_tests_clean_db (conn, close= false) {

  const query = `DROP TABLE test_01`
  await conn.execute(query)
    
  if (close) {
    conn.close()   
  }

}


async function router_tests_server_start (conn, routesConfig) {  

  const server = serve(conn, routesConfig)

  return server, conn
}

async function router_tests_server_stop (server) {

  server.close()
  

}


export {router_tests_prepare_db, router_tests_clean_db, router_tests_server_start, router_tests_server_stop}
