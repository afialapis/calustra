import {test_model} from './units/test_model'
import {test_model_dates} from './units/test_model_dates'

import config from './config'
import data from './data'

test_model(config.connections.postgres, data)
test_model_dates(config.connections.postgres, data)

test_model(config.connections.sqlite, data)
test_model_dates(config.connections.sqlite, data)
