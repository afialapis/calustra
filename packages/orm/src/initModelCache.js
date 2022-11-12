import getConnection from './getConnectionWrap'
import getModel from './getModel'

const initModelCache = async (connOrConfigOrSelector, options, tableList= []) => {

  const connection= getConnection(connOrConfigOrSelector, options)

  const logger= connection.log
  let logger_prev_prefix
  try {
    logger_prev_prefix= logger.prefix
    logger.set_prefix('calustra-orm')
  } catch(_) {}

  logger.debug('Initing models cache...')

  const tableNames = ( (tableList!=undefined) && (Array.isArray(tableList)) && (tableList.length>0))
    ? tableList
    : await connection.getTableNames()
  
    logger.debug(`Initing models cache for tables ${tableNames.join(',')}`)
  
  for (const tableName of tableNames) {
    getModel(connection, tableName, options)
  }

  logger.debug('Inited models cache')

  try {
    logger.set_prefix(logger_prev_prefix)
  } catch(_) {}

}

export default initModelCache