import config from './config'
import data from './data'
import test_crud from './units/test_crud'
import test_inspector from './units/test_inspector'

test_crud(config.connections.postgres, data)
test_inspector(config.connections.postgres)

test_crud(config.connections.sqlite, data)
test_inspector(config.connections.sqlite)