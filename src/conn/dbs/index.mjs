import CalustraConnPG from './postgres/connection.mjs'
import CalustraConnLT from './sqlite/connection.mjs'

export function initConnection(config, options) {
  const dialect = config?.dialect 

  if (dialect == 'postgres') {
    const conn= new CalustraConnPG(config, options)
    return conn
  }

  if (dialect == 'sqlite') {
    const conn= new CalustraConnLT(config, options)
    return conn
  }
  
  throw new Error(`[calustra] Could not init connection: unknown dialect ${dialect}`)
}
