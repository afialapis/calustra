const merge = (one, another) => {
  let obj = {}

  if (one!=undefined) {
    Object.assign(obj, one)
  }

  if (another!=undefined) {
    Object.assign(obj, another)
  }
  
  return obj
}

export default merge