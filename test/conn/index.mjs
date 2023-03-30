import {postgres, sqlite, options} from '../common/config/index.mjs'
import data from '../common/data.mjs'
import test_crud from './units/test_crud.mjs'
import test_crud_cached_conn from './units/test_crud_cached_conn.mjs'
import test_inspector from './units/test_inspector.mjs'
import test_model from './units/test_model.mjs'

test_crud(postgres, options, data, true)
test_crud_cached_conn(postgres, options, data, true)
test_inspector(postgres, options, true)
test_model(postgres, options, data, false)

test_crud(sqlite, options, data, true)
test_crud_cached_conn(sqlite, options, data, true)
test_inspector(sqlite, options, true)
test_model(sqlite, options, data, true)
