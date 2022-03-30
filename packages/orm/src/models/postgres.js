import ModelBase from './base'

class ModelPG extends ModelBase {
  constructor(conn, tablename, definition, options) {
    super(conn, tablename, definition, options)
  }
}

export default ModelPG