import createCrudRouteConfig from "./createCrudRouteConfig.mjs"

async function createCrudConfigForAllTables(connection, prefix= '', schema= 'public') {
  // Build crudList for every table
  const readFromDatabase= await connection.getTableNames(schema)
  const routes= readFromDatabase.map((name) => createCrudRouteConfig(name))
  
  return {
    prefix,
    routes
  }
}


export default createCrudConfigForAllTables
