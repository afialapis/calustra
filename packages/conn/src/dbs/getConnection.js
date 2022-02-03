import CalustraConnPG from './postgres/connection'
import CalustraConnLT from './sqlite/connection'

function getConnection (config, options) {

  if (config.dialect == 'postgres') {
    const conn= new CalustraConnPG(config, options)
    return conn
  }

  if (config.dialect == 'sqlite') {
    const conn= new CalustraConnLT(config, options)
    return conn
  }

  throw `getConnection: ${config.dialect} is not a supported dialect`
}


export default getConnection