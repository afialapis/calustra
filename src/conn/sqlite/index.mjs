import { getConnectionBase, dropConnection, dropConnections, isCalustraConnection } from '#conn-base/api/base.mjs'
import CalustraConnLT from './connection.mjs'

async function getConnection (configOrSelector, options) {
  const conn = await getConnectionBase(configOrSelector, options, () => {
    return new CalustraConnLT(configOrSelector, options)
  })
  return conn
}

export {getConnection, dropConnection, dropConnections, isCalustraConnection}
