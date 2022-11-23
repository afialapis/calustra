import {
  DEFAULT_BODY_FIELD,
  DEFAULT_GET_USER_ID,
  DEFAULT_AUTH_USER
} from "../../config"

/**
  {
    prefix: '/queries',

    getUserId,
    authUser,
    bodyField,

    routes: [
      List of objects like
      {
        url: '/crud/todos/fake',
        method: 'GET', // 'POST'
        callback: (ctx) => {},
        authUser,
        getUserId  
      }
    ]
  }   
*/

const getQueriesConfig = (config) => {

  const routes= config?.queries?.routes

  if (! routes) {
    return undefined
  }

  if (! Array.isArray(routes)) {
    return undefined
  }

  const comm_bodyField = config?.crud?.bodyField || config?.bodyField || DEFAULT_BODY_FIELD

  const comm_authUser= {
    ...DEFAULT_AUTH_USER,
    ...config?.queries?.authUser || {},
    ...config?.authUser || {}
  }
  const comm_getUserId= config?.crud?.getUserId || config?.getUserId ||DEFAULT_GET_USER_ID
  
  let parsed_routes= []

  for (const route of routes) {

    if (! route.url) {
      continue
    }

    if (! route.callback) {
      continue
    }

    const parsed_route= {
      url: route.url,
      method: route?.method || 'GET', 
      callback: route.callback,

      bodyField: route?.bodyField || comm_bodyField,
      authUser: {
        ...comm_authUser,
        ...route?.authUser  || {}
      },
      getUserId: route?.getUserId  || comm_getUserId
    }

    parsed_routes.push(parsed_route)
  }

  return {
    prefix: config?.queries?.prefix || '',
    routes: parsed_routes
  }

}

export default getQueriesConfig
