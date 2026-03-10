function isCalustraConnection(obj) {
  try {
    return obj.constructor.name.indexOf("CalustraConn") >= 0
  } catch (_) {}
  return false
}

function isCalustraSelector(obj) {
  return typeof obj === "string"
}

function isCalustraModel(obj) {
  try {
    return obj.constructor.name.indexOf("CalustraModel") >= 0
  } catch (_) {}
  return false
}

export { isCalustraConnection, isCalustraSelector, isCalustraModel }
