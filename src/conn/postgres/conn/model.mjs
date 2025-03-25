import CalustraModelBase from '../base/conn/model.mjs'

class CalustraModelPostgres extends CalustraModelBase {
  constructor(connection, options) {
    super(connection, options)
  }
}

export default CalustraModelPostgres