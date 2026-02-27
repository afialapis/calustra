
import {
  getConnection
} from '#conn-postgres/index.mjs'


import config from './config.mjs'

let conn

export async function calustra_postgres_conn_init(opts) {

  conn = await getConnection({
    ...config.config,
    ...opts
  }, config.options)
  return conn 
}


export function calustra_postgres_conn_get() {
  return conn
}

export async function calustra_postgres_conn_close() {
  await conn.close()
}