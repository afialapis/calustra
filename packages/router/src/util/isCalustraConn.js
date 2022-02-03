function isCalustraConn(obj) {
  return obj.constructor.name.indexOf('CalustraConn')>=0
}

export default isCalustraConn