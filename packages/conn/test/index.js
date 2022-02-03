import config from './config'
import data from './data'
import test_crud from './units/test_crud'
import test_inspector from './units/test_inspector'

test_crud(config.db.postgres, data)
test_inspector(config.db.postgres)

test_crud(config.db.sqlite, data)
test_inspector(config.db.sqlite)