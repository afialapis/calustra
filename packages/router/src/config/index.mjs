const DEFAULT_BODY_FIELD= undefined //'result'

const DEFAULT_GET_USER_ID = (ctx) => {
  let uid= ctx.headers['user-id']
  if (uid!=undefined) {
    return uid
  }
  return undefined
}

const DEFAULT_AUTH_USER = {
  require: false,     // true / false / 'read-only'
  action: 'redirect', // 'error'
  redirect_url: '/',
  error_code: 401
}

const DEFAULT_USE_USER_FIELDS = {
  use: false,
  fieldNames: {
    created_by: 'created_by', 
    last_update_by: 'last_update_by'
  }
}



// const DEF_CRUD= {
// 
// 
//   prefix: '',
//   routes: '*',
//   /*
//   authUser: {},
//   */
// }
// 
// const DEF_QUERIES= {
// 
//   prefix: '',
//   routes: []
// }
// 
// 
// 
// const _ROUTES_DEF= {
//   bodyField: DEFAULT_BODY_FIELD,
//   getUserId: DEFAULT_GET_USER_ID,
//   authUser: DEFAULT_AUTH_USER, 
//   queries: DEF_QUERIES,
//   crud: DEF_CRUD
// }


export {
  DEFAULT_BODY_FIELD,
  DEFAULT_GET_USER_ID,
  DEFAULT_AUTH_USER,
  DEFAULT_USE_USER_FIELDS
}