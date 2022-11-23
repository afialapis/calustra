import objToTuple from '../objToTuple'

function prepare_query_select(tablename, tablefields, filter, onlyFields, sortBy, limit, offset) {

  const sselect = onlyFields != undefined 
                  ? onlyFields.join(',') 
                  : '*'

  const [wfields, wvalues] = objToTuple(filter, tablefields)
  
  let swhere= ''
  if (wfields.length > 0)
    swhere= ' WHERE ' + wfields.map((f, i) => {
      if (typeof wvalues[i] == 'object' && wvalues[i].constructor.name=='Array') {
        return f + ' IN ($' + (i + 1) + ':csv)'
      }
      else if (wvalues[i] === null || wvalues[i] === undefined) {
        return f + ' IS NULL'
      }
      else {
        return f + ' = $' + (i + 1)
      }
    }).join(' AND ')
  
  let query = `SELECT ${sselect} FROM ${tablename} ${swhere}`

  if (sortBy) {
    let name= '', dir= 1
    if (typeof sortBy == 'object') {
      name= sortBy[0]
      dir=sortBy[1]
    } else {
      name= sortBy
    }
    query+= ` SORT BY ${name} ${!dir ? 'DESC' : 'ASC'}`
  }

  if (! isNaN(limit)) {
    query += ` LIMIT ${limit} `
  }
  
  if (! isNaN(offset)) {
    query += ` OFFSET ${offset}`
  }

  return [query, wvalues]  
}

export default prepare_query_select