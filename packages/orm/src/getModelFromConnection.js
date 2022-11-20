import CalustraModelPostgres from './models/postgres'
import CalustraModelSQLite from './models/sqlite'
import {getOrSetModelFromCache} from './cache'



function _initModel(connConfig, tableName, options) {
    let model
    
    if (connConfig.dialect == 'postgres') {
      model = new CalustraModelPostgres(connConfig, tableName, options)
    }
    else if (connConfig.dialect == 'sqlite') {
      model = new CalustraModelSQLite(connConfig, tableName, options)
    } else {
      throw `getModel: ${connConfig.dialect} is not a supported dialect`
    }

    return model
}

function getModelFromConnection(connection, tableName, options) {

  const model= getOrSetModelFromCache(connection, tableName, options, () => {
    return _initModel(connection.config, tableName, options)
  }) 
  return model
}


export default getModelFromConnection
