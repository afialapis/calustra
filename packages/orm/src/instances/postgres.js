import CalustraModelBase from './base'

class CalustraModelPostgres extends CalustraModelBase {
  constructor(connection, modelConfig) {
    super(connection, modelConfig)
  }
}

export default CalustraModelPostgres