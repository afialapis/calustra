const filterObj = (obj, onlyFields) => {
  if (obj === undefined || onlyFields === undefined) {
    return obj
  }

  const out = {}

  Object.keys(obj)
    .filter((k) => onlyFields.indexOf(k) >= 0)
    .forEach((k) => {
      out[k] = obj[k]
    })

  return out
}

export default filterObj
