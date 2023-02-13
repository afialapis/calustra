const merge = (one, another) => {
  let obj = {}

  Object.assign(obj, one)
  Object.assign(obj, another)
  
  return obj
}

export default merge