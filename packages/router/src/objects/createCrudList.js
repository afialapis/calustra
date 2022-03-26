async function createCrudList(db, routes, schema= 'public') {
  // Build crudList depending on crud param
  let crudList = []
  if (routes==='*') {
    const readFromDb= await db.getTableNames(schema)
    crudList= readFromDb.map((t) => {
      return {
        name: t,
        options: {}
      }
    })
  } else if (typeof routes == 'string') {
    crudList.push({name: routes, options: {}})
  } else {
    for (let tab of routes) {
      if (typeof tab == 'string') {
        crudList.push({name: tab, options: {}})
      } else {
        crudList.push(tab)
      }
    }
  }
  
  return crudList
}

export default createCrudList
