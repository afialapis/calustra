import cleanAndInline from './cleanAndInline.mjs'
import findAdjacents from './utils/findAdjacents.mjs'

function getTableNamesFromQuery (query) {
  const q = cleanAndInline(query)

  let ignore = ['(', ')', 'select', 'with', 'if']
  const aliases = findAdjacents(q, 'with', ignore)
  if (aliases.length) {
    ignore= [
      ...ignore,
      ...aliases
    ]
  }
  return [
    ...findAdjacents(q, 'from', ignore),
    ...findAdjacents(q, 'join', ignore),
    ...findAdjacents(q, 'into', ignore),
    ...findAdjacents(q, 'update', ignore),
    ...findAdjacents(q, 'table if exists', ignore),
    ...findAdjacents(q, 'table', ignore)
  ]
}

/*
  Motivated by:

  https://stackoverflow.com/questions/281041/regular-expression-to-find-all-table-names-in-a-query
  https://stackoverflow.com/questions/32949259/how-to-parse-sql-query-to-get-table-names-involved-in-that-query-in-access
*/


export default getTableNamesFromQuery

