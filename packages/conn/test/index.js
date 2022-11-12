import config from './config'
import data from './data'
import test_crud from './units/test_crud'
import test_crud_cached_conn from './units/test_crud_cached_conn'
import test_inspector from './units/test_inspector'

test_crud(config.connections.postgres, config.options, data)
test_crud_cached_conn(config.connections.postgres, config.options, data)
test_inspector(config.connections.postgres, config.options)

test_crud(config.connections.sqlite, config.options, data)
test_crud_cached_conn(config.connections.sqlite, config.options, data)
test_inspector(config.connections.sqlite, config.options)