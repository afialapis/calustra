
import fetch from 'node-fetch'
import {server as config} from '../common/config/index.mjs'

const fetchFromCrud = async (routesConfig, name= 'test_01', call= 'read') => {
  
  const route = routesConfig.crud.routes.filter(r => r.name==name)[0]
  
  const prefix = route?.prefix || routesConfig?.crud?.prefix || routesConfig?.prefix  || ''
  const bodyField = route?.bodyField || routesConfig?.crud?.bodyField || routesConfig?.bodyField  || undefined

  let url= `http://localhost:${config.port}/${prefix}/${name}/${call}`
  while (url.indexOf('//')>=0) {
    url= url.replace(/\/\//g, "/")
  }

  const response= await fetch(url)
  let result= await response.json()

  if (bodyField != undefined) {
    result= result[bodyField]
  }
  return result
}

const fetchFromCrudAll = async (name= 'test_01', call= 'read') => {
  
  const url= `http://localhost:${config.port}/${name}/${call}`

  const response= await fetch(url)
  let result= await response.json()
  return result
}


const fetchFromQuery = async (routesConfig, turl) => {
  const route = routesConfig.queries.routes.filter(r => r.url==turl)[0]
  
  const prefix = route?.prefix || routesConfig?.queries?.prefix || routesConfig?.prefix  || ''
  //const bodyField = route?.bodyField || routesConfig?.queries?.bodyField || routesConfig?.bodyField  || undefined

  let url= `http://localhost:${config.port}/${prefix}/${route.url}`
  while (url.indexOf('//')>=0) {
    url= url.replace(/\/\//g, "/")
  }

  const response= await fetch(url)
  return response

}

export {fetchFromCrud, fetchFromCrudAll, fetchFromQuery}