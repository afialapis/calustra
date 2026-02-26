
import {
  getConnection
} from '../../src/conn/sqlite/index.mjs'


import config from './config.mjs'

let conn

export async function calustra_sqlite_conn_init(opts) {

  conn = await getConnection({
    ...config.config,
    ...opts
  }, config.options)
  return conn 
}


export function calustra_sqlite_conn_get() {
  return conn
}

export async function calustra_sqlite_conn_close() {
  await conn.close()
}