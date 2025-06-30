import { getConnection as getConnectionPG,
        getConnectionFromCache as getConnectionFromCachePG,
        dropConnection as dropConnectionPG,
        dropConnections,
        isCalustraConnection } from '../../src/conn/postgres/index.mjs'
import { getConnection as getConnectionLT,
         getConnectionFromCache as getConnectionFromCacheLT,
         dropConnection as dropConnectionLT} from '../../src/conn/sqlite/index.mjs'


import postgres from './postgres/config.mjs'
import sqlite from './sqlite/config.mjs'

import { calustra_conn_test_run } from './run.mjs'

const testContextPG = {
  getConnection: getConnectionPG,
  isCalustraConnection,
  getConnectionFromCache: getConnectionFromCachePG,
  dropConnection: dropConnectionPG,
  dropConnections,
  config: postgres,
  dbName: postgres.database,
  dialect: 'postgres'
}

const testContextLT = {
  getConnection: getConnectionLT,
  isCalustraConnection,
  getConnectionFromCache: getConnectionFromCacheLT,
  dropConnection: dropConnectionLT,
  dropConnections,
  config: sqlite,
  dbName: sqlite.filename,
  dialect: 'sqlite'
}


calustra_conn_test_run(testContextPG)

calustra_conn_test_run(testContextLT)
