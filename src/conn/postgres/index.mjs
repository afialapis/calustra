import {
  dropConnection,
  dropConnections,
  getConnectionBase,
  isCalustraConnection
} from "#conn-base/api/base.mjs"
import CalustraConnPG from "./connection.mjs"

async function getConnection(configOrSelector, options) {
  const conn = await getConnectionBase(configOrSelector, options, () => {
    return new CalustraConnPG(configOrSelector, options)
  })
  return conn
}

export { getConnection, dropConnection, dropConnections, isCalustraConnection }
