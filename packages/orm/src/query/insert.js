import {objToTuple} from '../util'

function prepare_query_insert(tablename, tablefields, values, returning) {

  const ituple = objToTuple(values, tablefields)
  const ifields = ituple[0]
  const ivalues = ituple[1]

  const sfields = ifields.join(',')
  const sinsert = ifields.map((f, i) => '$' + (i + 1)).join(',')

  const sreturning = returning===true ? 'RETURNING id' : ''
  
  const query = `INSERT INTO ${tablename} (${sfields}) VALUES (${sinsert}) ${sreturning}`

  return [query, ivalues]
}

export default prepare_query_insert