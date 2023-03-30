
import {server as config} from '../common/config/index.mjs'


const remoteParamsForRoute = (routesConfig) => {
  if (routesConfig==undefined) {
    return [`http://localhost:${config.port}`, undefined]
  }

  let base = routesConfig.crud!=undefined ? routesConfig.crud : routesConfig.queries

  let route= base.routes[0]

  const prefix = route?.prefix || base?.prefix || routesConfig?.prefix  || ''
  const bodyField = route?.bodyField || base?.bodyField || routesConfig?.bodyField  || undefined
  
  const last = typeof route == 'string'
    ? route
    : route.name != undefined ? route.name : route.url

  let url= `http://localhost:${config.port}/${prefix}/${last}`
  while (url.indexOf('//')>=0) {
    url= url.replace(/\/\//g, "/")
  }
  return [url, bodyField]
}


export {remoteParamsForRoute}