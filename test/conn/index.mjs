import {postgres, sqlite, options} from './config/index.mjs'
import data from './data.mjs'

import test_inspector from './units/test_inspector.mjs'
import test_model from './units/test_model.mjs'
import test_crud from './units/test_crud.mjs'
import test_crud_cached_conn from './units/test_crud_cached_conn.mjs'
import test_conn_reset from './units/test_conn_reset.mjs'


test_inspector(postgres, options)
test_inspector(sqlite, options)

test_model(postgres, options, data)
test_model(sqlite, options, data)

test_crud(postgres, options, data)
test_crud(sqlite, options, data)

test_crud_cached_conn(postgres, options, data)
test_crud_cached_conn(sqlite, options, data)

test_conn_reset(postgres, options, data)
test_conn_reset(sqlite, options, data)
