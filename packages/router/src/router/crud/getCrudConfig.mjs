import {
  DEFAULT_BODY_FIELD,
  DEFAULT_GET_USER_ID,
  DEFAULT_AUTH_USER,
  DEFAULT_USE_USER_FIELDS
} from "../../config/index.mjs"

/**
  {
    prefix: '/crud,
    
    getUserId,
    authUser,
    bodyField,
    
    routes: Can be:
      '*' => autodetect and create routes for every table on the daabase
      or
      an array of tables config, where each config can be:
      - a simple string with the table name
      - an object like this:
        {
          name: "table_name",
          url: "custom/url",

          mode: 'r' / 'rw' / 'ru' (read+update but not delete) / 'w' / 'u'

          useUserFields: {
            use: false,
            fieldnames: {
              created_by: 'created_by', 
              last_update_by: 'last_update_by'
            },
          },

          getUserId,
          authUser
        }      
  } 
*/

const getCrudConfig = (config) => {

  const routes= config?.crud?.routes

  if (! routes) {
    return undefined
  }

  if (! Array.isArray(routes)) {
    return undefined
  }
  
  const comm_bodyField = config?.crud?.bodyField || config?.bodyField || DEFAULT_BODY_FIELD

  const comm_authUser= {
    ...DEFAULT_AUTH_USER,
    ...config?.crud?.authUser || {},
    ...config?.authUser || {}
  }
  const comm_getUserId= config?.crud?.getUserId || config?.getUserId ||DEFAULT_GET_USER_ID
  
  let parsed_routes= []

  for (const troute of routes) {

    const route = (typeof troute === 'string')
      ? {name: troute}
      : troute

    if (! route.name) {
      continue
    }

    const parsed_route= {
      name: route.name,
      url: route?.url || route.name,
      mode: route?.mode || 'rw',

      bodyField: route?.bodyField || comm_bodyField,
      useUserFields: {
        ...DEFAULT_USE_USER_FIELDS,
        ...route?.useUserFields || {}
      },
      authUser: {
        ...comm_authUser,
        ...route?.authUser  || {}
      },
      getUserId: route?.getUserId  || comm_getUserId
    }

    parsed_routes.push(parsed_route)
  }

  return {
    prefix: config?.crud?.prefix || '',
    routes: parsed_routes
  }

}

export default getCrudConfig
