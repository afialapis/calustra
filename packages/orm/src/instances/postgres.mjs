import CalustraModelBase from './base/index.mjs'

class CalustraModelPostgres extends CalustraModelBase {
  constructor(connection, modelConfig) {
    super(connection, modelConfig)
  }
}

export default CalustraModelPostgres