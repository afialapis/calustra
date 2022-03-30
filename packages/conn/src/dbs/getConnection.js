import CalustraConnPG from './postgres/connection'
import CalustraConnLT from './sqlite/connection'

function _isCalustraConn(obj) {
  try {
    return obj.constructor.name.indexOf('CalustraConn')>=0
  } catch(e) {}
  return false
}

function getConnection (config) {

  if (_isCalustraConn(config)) {
    return config
  }

  const dialect = config?.db?.dialect 

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