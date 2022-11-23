import objToTuple from '../objToTuple'

function prepare_query_delete(tablename, tablefields, filter) {

  const wtuple = objToTuple(filter, tablefields)
  const wfields = wtuple[0]
  const wvalues = wtuple[1]

  let swhere = ''
  if (wfields.length > 0)
    swhere = ' WHERE ' + wfields.map((f, i) => f + ' = $' + (i + 1)).join(' AND ')

  const query = `DELETE FROM ${tablename} ${swhere}`  

  return [query, wvalues]
}

export default prepare_query_delete