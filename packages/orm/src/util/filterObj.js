export default (obj, onlyFields) => {
  let out = {}
  
  Object.keys(obj)
    .filter((k) => onlyFields.indexOf(k) >=0)
    .map((k) => {
      out[k] = obj[k]
    })

  return out
}