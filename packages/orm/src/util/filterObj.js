export default (obj, onlyFields) => {
  if (obj == undefined || onlyFields == undefined) {
    return obj
  }

  let out = {}
  
  Object.keys(obj)
    .filter((k) => onlyFields.indexOf(k) >=0)
    .map((k) => {
      out[k] = obj[k]
    })

  return out
}