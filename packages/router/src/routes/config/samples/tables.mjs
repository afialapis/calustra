[
  
  "table_name",

  {
    name: "table_name",
    schema: "public", // optional
    route: "custom/url",

    options: {

      mode: 'r', // 'rw' / 'ru' (read+update but not delete) / 'w' / 'u'

      useUserFields: {
        use: false,
        fieldNames: {
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
        fieldNames: {
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

]