import CalustraConnPG from './postgres/connection'
import CalustraConnLT from './sqlite/connection'

function getConnection (config) {

  const dialect = config?.connection?.dialect 

  if (dialect == 'postgres') {
    const conn= new CalustraConnPG(config)
    return conn
  }

  if (dialect == 'sqlite') {
    const conn= new CalustraConnLT(config)
    return conn
  }

  throw `getConnection: ${dialect} is not a supported dialect`
}


export default getConnection