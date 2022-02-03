import ModelBase from './base'

class ModelPG extends ModelBase {
  constructor(db, tablename, definition, options) {
    super(db, tablename, definition, options)
  }
}

export default ModelPG