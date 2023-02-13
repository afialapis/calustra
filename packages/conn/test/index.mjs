import config from './config.mjs'
import data from './data.mjs'
import test_crud from './units/test_crud.mjs'
import test_crud_cached_conn from './units/test_crud_cached_conn.mjs'
import test_inspector from './units/test_inspector.mjs'

test_crud(config.connections.postgres, config.options, data, true)
test_crud_cached_conn(config.connections.postgres, config.options, data, true)
test_inspector(config.connections.postgres, config.options, true)

test_crud(config.connections.sqlite, config.options, data, true)
test_crud_cached_conn(config.connections.sqlite, config.options, data, true)
test_inspector(config.connections.sqlite, config.options, true)
