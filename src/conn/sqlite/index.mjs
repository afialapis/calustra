import { getConnectionBase, getConnectionFromCache, dropConnection, dropConnections, isCalustraConnection } from "./base/api/base.mjs"
import CalustraConnLT from './conn/connection.mjs'

async function getConnection (configOrSelector, options) {
  const conn = await getConnectionBase(configOrSelector, options, () => {
    return new CalustraConnLT(configOrSelector, options)
  })
  return conn
}

export {getConnection, getConnectionFromCache, dropConnection, dropConnections, isCalustraConnection}
