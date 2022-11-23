import {test_model} from './units/test_model'
import {postgres, sqlite} from './config'
import data from './data'

test_model(postgres, data, false)
test_model(postgres, data, true)
/*
test_model(sqlite, data)
test_model(sqlite, data)*/