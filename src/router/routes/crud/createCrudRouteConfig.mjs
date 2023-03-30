import {
  DEFAULT_BODY_FIELD,
  DEFAULT_GET_USER_ID,
  DEFAULT_AUTH_USER,
  DEFAULT_USE_USER_FIELDS
} from "../config/index.mjs"

const createCrudRouteConfig = (name) => {

  const config= {
    name: name,
    url: name,
    mode: 'rw',

    bodyField: DEFAULT_BODY_FIELD,
    useUserFields: {
      ...DEFAULT_USE_USER_FIELDS
    },
    authUser: {
      ...DEFAULT_AUTH_USER
    },
    getUserId: DEFAULT_GET_USER_ID
  }

  return config

}



export default createCrudRouteConfig
