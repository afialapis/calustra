import getTableNamesFromQuery from './getTableNamesFromQuery.mjs'
import queryMainAction from './queryMainAction.mjs'

const _rows = (rows) => {
  if (isNaN(rows)) {
    return ' '
  }
  return ` ${rows} rows `
}

const _time = (time) => {
  if (time==undefined) {
    return ''
  }
  return ` (time: ${time})`
}

const _tables = (tables) => {
  if (tables==undefined || tables.length==0) {
    return ''
  }
  if (tables.length==1) {
    return tables[0] || '??'
  }
  const last= tables.pop()
  return `${tables.join(', ')} and ${last}`
}


const queryDescriptionForCreate = (tables, rows, time) =>  `Created table ${tables}${_time(time)}`

const queryDescriptionForAlter = (tables, rows, time) =>  `Altered table ${tables}${_time(time)}`

const queryDescriptionForDrop = (tables, rows, time) =>  `Dropped table ${tables}${_time(time)}`

const queryDescriptionForDelete = (tables, rows, time) =>  `Deleted${_rows(rows)}from ${tables}${_time(time)}`

const queryDescriptionForUpdate = (tables, rows, time) =>  `Updated${_rows(rows)}from ${tables}${_time(time)}`

const queryDescriptionForInsert = (tables, rows, time) =>  `Inserted${_rows(rows)}into ${tables}${_time(time)}`

const queryDescriptionForSelect = (tables, rows, time) =>  `Selected${_rows(rows)}from ${_tables(tables)}${_time(time)}`




function queryDescription(query, rows, time) {
  
  const tables= getTableNamesFromQuery(query)
  const action= queryMainAction(query)

  if (action == 'create') {
    return queryDescriptionForCreate(tables, rows, time)
  }

  if (action == 'alter') {
    return queryDescriptionForAlter(tables, rows, time)
  }

  if (action == 'drop') {
    return queryDescriptionForDrop(tables, rows, time)
  }

  if (action == 'delete') {
    return queryDescriptionForDelete(tables, rows, time)
  }

  if (action == 'update') {
    return queryDescriptionForUpdate(tables, rows, time)
  }

  if (action == 'insert') {
    return queryDescriptionForInsert(tables, rows, time)
  } 

  return queryDescriptionForSelect(tables, rows, time)
}

export default queryDescription