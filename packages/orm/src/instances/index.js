import CalustraModelPostgres from './postgres'
import CalustraModelSQLite from './sqlite'


function initModel(connection, modelConfig) {
  let model
  
  if (connection.dialect == 'postgres') {
    model = new CalustraModelPostgres(connection, modelConfig)
  }
  else if (connection.dialect == 'sqlite') {
    model = new CalustraModelSQLite(connection, modelConfig)
  } else {
    throw `[calustra-orm] ${connection.dialect} is not a supported dialect`
  }

  return model
}



export default initModel
