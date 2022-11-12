import CalustraModelBase from './base'

class CalustraModelPostgres extends CalustraModelBase {
  constructor(conn, tablename, definition, options) {
    super(conn, tablename, definition, options)
  }
}

export default CalustraModelPostgres