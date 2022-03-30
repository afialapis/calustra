import {getConnection} from 'calustra'
import ModelPG from './models/postgres'
import ModelLT from './models/sqlite'

const getModel = async (connOrConfig, tableName, options) => {

  const connection= getConnection(connOrConfig)
  
  const definition= await connection.getTableDetails(tableName /*, 'public'*/ )

  let model
  
  if (connection.dialect == 'postgres') {
    model = new ModelPG(connection, tableName, definition, options)
  }

  if (connection.dialect == 'sqlite') {
    model = new ModelLT(connection, tableName, definition, options)
  }

  if (model) {
    return model
  }

  throw `getModel: ${connection.dialect} is not a supported dialect`

}

export default getModel