function isCalustraConnection(obj) {
  try {
    return obj.constructor.name.indexOf('CalustraConn')>=0
  } catch(e) {}
  return false
}

function isCalustraSelector(obj) {
  return typeof obj == 'string'
}

export {isCalustraConnection, isCalustraSelector}