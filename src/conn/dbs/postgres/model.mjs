import CalustraModelBase from '../base/model.mjs'

class CalustraModelPostgres extends CalustraModelBase {
  constructor(connection, options) {
    super(connection, options)
  }
}

export default CalustraModelPostgres