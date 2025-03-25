
import getTableNames from '../../lib/query/getTableNames.cjs'
import test_table_names from './units/table_names.mjs'

test_table_names(getTableNames.default)