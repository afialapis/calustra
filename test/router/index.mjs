import fetch from 'node-fetch'

import {postgres, sqlite, options, routes} from '../common/config/index.mjs'

import { run_test_crud } from "./units/test_crud.mjs";
import { run_test_crud_all } from "./units/test_crud_all.mjs";
import { run_test_queries_noauth, run_test_queries_auth } from './units/test_queries.mjs'

global.fetch= fetch

run_test_crud('crud - postgres - simple', postgres, options, routes.rou_crud_simple, false)
run_test_crud('crud - postgres - bodyfield', postgres, options, routes.rou_crud_body_field, false)
run_test_crud('crud - sqlite - simple', sqlite,  options, routes.rou_crud_simple, false)
run_test_crud('crud - sqlite - bodyfield', sqlite, options, routes.rou_crud_body_field, false)


run_test_crud_all('crud(all) - postgres', postgres, options, false)
run_test_crud_all('crud(all) - sqlite', sqlite,  options, false)


run_test_queries_noauth('queries - postgres - noauth', postgres, options, routes.rou_queries_noauth, false)
run_test_queries_auth('queries - postgres - auth', postgres, options, routes.rou_queries_auth, true)

run_test_queries_noauth('queries - sqlite - noauth', sqlite, options, routes.rou_queries_noauth, false)
run_test_queries_auth('queries - sqlite - auth', sqlite, options, routes.rou_queries_auth, true)
