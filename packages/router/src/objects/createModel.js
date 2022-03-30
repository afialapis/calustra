import {getModel} from 'calustra-orm'

const createModel = async (connection, tablename, options) => {

  const model= await getModel(connection, tablename, options)
  return model

}

export default createModel