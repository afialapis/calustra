import {test_model} from './units/test_model'
import {test_model_dates} from './units/test_model_dates'
import {test_model_cached} from './units/test_model_cached'
import {test_model_from_conn} from './units/test_model_from_conn'


import config from './config'
import data from './data'


test_model(config.connections.postgres, config.options, data)
test_model_dates(config.connections.postgres, config.options, data)
test_model_cached(config.connections.postgres, config.options, data)
test_model_from_conn(config.connections.postgres, config.options, data)

test_model(config.connections.sqlite, config.options, data)
test_model_dates(config.connections.sqlite, config.options, data)
test_model_cached(config.connections.sqlite, config.options, data)
test_model_from_conn(config.connections.sqlite, config.options, data)
