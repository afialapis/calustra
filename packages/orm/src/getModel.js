import ModelPG from './models/postgres'
import ModelLT from './models/sqlite'

const getModel = async (db, tableName, options) => {
  
  const definition= await db.getTableDetails(tableName /*, 'public'*/ )

  let model
  
  if (db.dialect == 'postgres') {
    model = new ModelPG(db, tableName, definition, options)
  }

  if (db.dialect == 'sqlite') {
    model = new ModelLT(db, tableName, definition, options)
  }

  if (model) {
    return model
  }

  throw `getModel: ${db.dialect} is not a supported dialect`

}

export default getModel