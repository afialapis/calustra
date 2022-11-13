function createCrudList(routes) {
  if (routes=='*') {
    throw `[calustra-router] Error on createCrudList: routes=*, so you need to call createCrudListAsync`
  }

  // Build crudList depending on crud param
  let crudList = []
  if (typeof routes == 'string') {
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

async function createCrudListAsync(connection, schema= 'public') {
  // Build crudList for every table
  const readFromDatabase= await connection.getTableNames(schema)
  const crudList= readFromDatabase.map((t) => {
    return {
      name: t,
      options: {}
    }
  })
  
  return crudList
}


export {createCrudList, createCrudListAsync}
