module.exports= {
  schema: 'public', 

  /**
    <crud>
    {
      prefix: '/crud,
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

              avoid: ['find', 'key_list', 'remove'],

              useUserFields: {
                use: false,
                fieldnames: {
                  created_by: 'created_by', 
                  last_update_by: 'last_update_by'
                },
              },

              getUserId: (ctx) => {
                let uid= ctx.headers['user-id']
                if (uid!=undefined) {
                  return uid
                }
                return undefined
              },

              authUser: {
                require: false,     // true / false / 'read-only'
                action: 'redirect', // 'error'
                redirect_url: '/',
                error_code: 401
              },   

              // calustra-orm options

              useDateFields: {
                use: false,
                fieldnames: {
                  created_at: 'created_at', 
                  last_update_at: 'last_update_at'
                },
                now: () => 0 // epoch_now()
              },

              checkBeforeDelete: [
                "another_table.field_id"
              ],
              
              triggers: {
                beforeRead   : undefined,
                afterRead    : undefined,
                beforeInsert : undefined,
                afterInsert  : undefined,

                beforeUpdate : undefined,
                afterUpdate  : undefined,

                beforeDelete : undefined,
                afterDelete  : undefined
              }
            }
          }      
    } 
   */
  crud: {
    prefix: '',
    routes: '*',
    /*
    authUser: {},
    */
  },
  
  /**
    <queries>
    {
      prefix: '/queries',
      routes: [
        List of objects like
        {
          url: '/crud/todos/fake',
          method: 'POST',
          callback: (ctx, conn) => {},
          authUser: {
            require: true,
            action: 'redirect',
            redirect_url: '/'
          },  
        }
      ]
    }
   */
  queries: undefined,

  body_field: 'result',
  
  getUserId: (ctx) => {
    let uid= ctx.headers['user-id']
    if (uid!=undefined) {
      return uid
    }
    return undefined
  },

  authUser: {
    require: false,     // true / false / 'read-only'
    action: 'redirect', // 'error'
    redirect_url: '/',
    error_code: 401
  }, 
}
