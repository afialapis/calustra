function _prepare_query_before_delete(check) {

  const [checkTable, checkField]= check.split('.')
  const query= `SELECT CAST(COUNT(1) AS int) as cnt FROM ${checkTable} WHERE ${checkField} = $1`
  return query
}

function prepare_queries_before_delete(checkBeforeDelete) {
  let queries= []

  if (checkBeforeDelete!=undefined) {
    try {
        for (const check of checkBeforeDelete) {
          const query = _prepare_query_before_delete(check)
          queries.push(query)
        }
    } catch(e) {}
  }

  return queries
}

export default prepare_queries_before_delete
