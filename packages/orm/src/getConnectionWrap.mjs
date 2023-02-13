import {getConnection, isCalustraConnection, isCalustraSelector} from 'calustra-conn'
import {getConnectionConfig, getModelConfig} from './config.mjs'
import {getOrSetModelFromCache} from './cache.mjs'
import initModel from './instances/index.mjs'

const getConnectionWrap = (options) => {
  
  let connection, connConfig

  if (isCalustraConnection(options)) {
    connection= options
    connConfig= {
      database: connection.config,
      options: {log: connection.log}
    }
  } else if (isCalustraSelector(options)) {
    connection= getConnection(options)
    connConfig= {
      database: connection.config,
      options: {log: connection.log}
    }
  } else {
    connConfig= getConnectionConfig(options)
    connection= getConnection(connConfig.database, connConfig.options)
  }
  
  const getModel = (tableName) => {
    const modelConfig = getModelConfig(tableName, options)

    const model= getOrSetModelFromCache(connection, modelConfig, () => {
      return initModel(connection, modelConfig)
    }) 
    
    return model
  }

  connection.getModel= getModel

  return connection
}

export default getConnectionWrap
