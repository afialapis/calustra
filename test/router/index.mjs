import {postgres, sqlite, options, routes} from '../common/config/index.mjs'

import { run_test_crud } from "./units/test_crud.mjs";
import { run_test_crud_all } from "./units/test_crud_all.mjs";
import { run_test_queries_noauth, run_test_queries_auth } from './units/test_queries.mjs'

const close= true

run_test_crud('test_crud_pg_simple', postgres, options, routes.rou_crud_simple, false)
run_test_crud('test_crud_pg_bodyfield', postgres, options, routes.rou_crud_body_field, false)
run_test_crud('test_crud_sl_simple', sqlite,  options, routes.rou_crud_simple, false)
run_test_crud('test_crud_sl_bodyfield', sqlite, options, routes.rou_crud_body_field, false)


run_test_crud_all('test_crud_all_pg_simple', postgres, options, routes.rou_crud_simple, false)
run_test_crud_all('test_crud_all_pg_bodyfield', postgres, options, routes.rou_crud_body_field, false)
run_test_crud_all('test_crud_all_sl_simple', sqlite,  options, routes.rou_crud_simple, false)
run_test_crud_all('test_crud_all_sl_bodyfield', sqlite, options, routes.rou_crud_body_field, false)

run_test_queries_noauth('test_queries_pg_noauth', postgres, options, routes.rou_queries_noauth, false)
run_test_queries_auth('test_queries_pg_auth', postgres, options, routes.rou_queries_auth, true)

run_test_queries_noauth('test_queries_sl_noauth', sqlite, options, routes.rou_queries_noauth, false)
run_test_queries_auth('test_queries_sl_auth', sqlite, options, routes.rou_queries_auth, true)
