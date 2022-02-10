import cleandAndInline from "./cleanAndInline"

function queryMainAction(query) {
  const q= cleandAndInline(query).toLowerCase()

  if (q.indexOf('create ')>=0) {
    return 'create'
  }

  if (q.indexOf('alter ')>=0) {
    return 'alter'
  }

  if (q.indexOf('drop ')>=0) {
    return 'drop'
  }

  if (q.indexOf('delete')>=0) {
    return 'delete'
  }
  
  // INSERT queries could have the keyword UPDATE 
  //   (conflict solving), so lets search INSERT first
  if (q.indexOf('insert ')>=0) {
    return 'insert'
  } 

  if (q.indexOf('update ')>=0) {
    return 'update'
  }
  


  return 'select'
}

export default queryMainAction