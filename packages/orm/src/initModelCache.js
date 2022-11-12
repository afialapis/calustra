import getConnection from './getConnectionWrap'
import getModel from './getModel'

const initModelCache = async (connOrConfigOrSelector, options, tableList= []) => {

  const connection= getConnection(connOrConfigOrSelector, options)

  const logger= connection.log
  const logger_prev_prefix= logger.prefix
  logger.set_prefix('calustra-orm')

  logger.debug('Initing models cache...')

  const tableNames = ( (tableList!=undefined) && (Array.isArray(tableList)) && (tableList.length>0))
    ? tableList
    : await connection.getTableNames()
  
    logger.debug(`Initing models cache for tables ${tableNames.join(',')}`)
  
  for (const tableName of tableNames) {
    getModel(connection, tableName, options)
  }

  logger.debug('Inited models cache')

  logger.set_prefix(logger_prev_prefix)

}

export default initModelCache