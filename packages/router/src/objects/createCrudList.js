async function createCrudList(db, crud, schema= 'public') {
  // Build crudList depending on crud param
  let crudList = []
  if (crud==='*') {
    const readFromDb= await db.getTableNames(schema)
    crudList= readFromDb.map((t) => {
      return {
        name: t,
        options: {}
      }
    })
  } else if (typeof crud == 'string') {
    crudList.push({name: crud, options: {}})
  } else {
    for (let tab of crud) {
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
