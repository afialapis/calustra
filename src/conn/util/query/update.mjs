import objToTuple from '../objToTuple.mjs'

function prepare_query_update(tablename, tablefields, values, filter) {

  const utuple = objToTuple(values, tablefields)
  const ufields = utuple[0]
  const uvalues = utuple[1]

  if (ufields.length == 0) {
    return [undefined, undefined]
  }

  const sfields = 'SET ' + ufields.map((f, i) => f + ' = $' + (i + 1)).join(',')

  const wtuple = objToTuple(filter, tablefields)
  const wfields = wtuple[0]
  const wvalues = wtuple[1]

  let swhere = ''
  if (wfields.length > 0)
    swhere = ' WHERE ' + wfields.map((f, i) => f + ' = $' + (i + 1 + ufields.length)).join(' AND ')    

  const allvalues= uvalues.concat(wvalues)
  const query = `UPDATE ${tablename} ${sfields} ${swhere}`


  return [query, allvalues]
}

export default prepare_query_update