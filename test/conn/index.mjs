import {getConnection} from '../../src/conn/index.mjs'
import {postgres, sqlite, options} from '../common/config/index.mjs'
import data from '../common/data.mjs'
import test_crud from './units/test_crud.mjs'
import test_crud_cached_conn from './units/test_crud_cached_conn.mjs'
import test_inspector from './units/test_inspector.mjs'
import test_model from './units/test_model.mjs'
import test_conn_off from './units/test_conn_off.mjs'

test_crud_cached_conn(postgres, options, data, false)
test_crud_cached_conn(sqlite, options, data, false)

const postgres_conn = getConnection(postgres, options)

test_crud(postgres_conn, data)
test_inspector(postgres_conn)
test_model(postgres_conn, data, true)
test_conn_off(postgres_conn)


const sqlite_conn = getConnection(sqlite, options)

test_crud(sqlite_conn, data)
test_inspector(sqlite_conn)
test_model(sqlite_conn, data, true)
test_conn_off(sqlite_conn)
