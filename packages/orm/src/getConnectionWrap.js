import {getConnection} from 'calustra'
import getModelFromConnection from './getModelFromConnection'

const getConnectionWrap = (connOrConfigOrSelector, options) => {

  const conn_options= {
    ...options,
    cache_fallback: false,
    cache_error_log: true
  }

  const connection= getConnection(connOrConfigOrSelector, conn_options)
  
  const getModel = (tableName, moptions) => {
    const all_options= {
      ...options || {},
      ...moptions || {}
    }
    const model= getModelFromConnection(connection, tableName, all_options)
    return model
  }

  connection.getModel= getModel

  return connection
}

export default getConnectionWrap
