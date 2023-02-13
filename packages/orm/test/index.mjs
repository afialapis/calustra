import {test_model} from './units/test_model.mjs'
import {postgres, sqlite} from './config.mjs'
import data from './data.mjs'

test_model(postgres, data, false)
test_model(postgres, data, true)
/*
test_model(sqlite, data)
test_model(sqlite, data)*/