import getTableNames from './getTableNames.mjs'
import getMainAction from './getMainAction.mjs'

const _rows = (rows) => {
  if (isNaN(rows)) {
    return ' -null- rows '
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


const _getDescriptionForCreate = (tables, rows, time) =>  `Created table ${tables}${_time(time)}`

const _getDescriptionForAlter = (tables, rows, time) =>  `Altered table ${tables}${_time(time)}`

const _getDescriptionForDrop = (tables, rows, time) =>  `Dropped table ${tables}${_time(time)}`

const _getDescriptionForDelete = (tables, rows, time) =>  `Deleted${_rows(rows)}from ${tables}${_time(time)}`

const _getDescriptionForUpdate = (tables, rows, time) =>  `Updated${_rows(rows)}from ${tables}${_time(time)}`

const _getDescriptionForInsert = (tables, rows, time) =>  `Inserted${_rows(rows)}into ${tables}${_time(time)}`

const _getDescriptionForSelect = (tables, rows, time) =>  `Selected${_rows(rows)}from ${_tables(tables)}${_time(time)}`




function getDescription(query, rows, time) {
  
  const tables= getTableNames(query)
  const action= getMainAction(query)

  if (action == 'create') {
    return _getDescriptionForCreate(tables, rows, time)
  }

  if (action == 'alter') {
    return _getDescriptionForAlter(tables, rows, time)
  }

  if (action == 'drop') {
    return _getDescriptionForDrop(tables, rows, time)
  }

  if (action == 'delete') {
    return _getDescriptionForDelete(tables, rows, time)
  }

  if (action == 'update') {
    return _getDescriptionForUpdate(tables, rows, time)
  }

  if (action == 'insert') {
    return _getDescriptionForInsert(tables, rows, time)
  } 

  return _getDescriptionForSelect(tables, rows, time)
}

export default getDescription