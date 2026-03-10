function objToTuple(obj, onlyFields) {
  const fields = [],
    values = []
  for (const fld in obj) {
    if (onlyFields.indexOf(fld) >= 0) {
      fields.push(fld)
      values.push(obj[fld])
    }
  }
  return [fields, values]
}

export default objToTuple
