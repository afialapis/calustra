const DEF_bodyField= 'result'

const DEF_getUserId = (ctx) => {
  let uid= ctx.headers['user-id']
  if (uid!=undefined) {
    return uid
  }
  return undefined
}

const DEF_authUser = {
  require: false,     // true / false / 'read-only'
  action: 'redirect', // 'error'
  redirect_url: '/',
  error_code: 401
}

const DEF_CRUD= {
  /**
    {
      prefix: '/crud,
      
      getUserId,
      authUser,
      
      routes: Can be:
        '*' => autodetect and create routes for every table on the daabase
        or
        an array of tables config, where each config can be:
        - a simple string with the table name
        - an object like this:
          {
            name: "table_name",
            schema: "public", // optional
            url: "custom/url",

            options: {

              mode: 'r' / 'rw' / 'ru' (read+update but not delete) / 'w' / 'u'

              useUserFields: {
                use: false,
                fieldnames: {
                  created_by: 'created_by', 
                  last_update_by: 'last_update_by'
                },
              },

              getUserId,
              authUser,
            }
          }      
    } 
  */

  prefix: '',
  routes: '*',
  /*
  authUser: {},
  */
}

const DEF_QUERIES= {
  /**
    {
      prefix: '/queries',
      routes: [
        List of objects like
        {
          url: '/crud/todos/fake',
          method: 'POST',
          callback: (ctx) => {},
          authUser: {
            require: true,
            action: 'redirect',
            redirect_url: '/'
          },  
        }
      ]
    }   
  */
  prefix: '',
  routes: []
}



const ROUTES_DEF= {
  bodyField: DEF_bodyField,
  getUserId: DEF_getUserId,
  authUser: DEF_authUser, 
  queries: DEF_QUERIES,
  crud: DEF_CRUD
}


