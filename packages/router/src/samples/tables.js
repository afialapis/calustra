[
  
  "table_name",


  {
    name: "table_name",
    schema: "public", // optional
    route: "custom/url",
    auth: {
      require: false,
      action: 'redirect', // 'error'
      redirect_path: '/',
      error_code: 401
    },    
    options: {
      
      useCalustraRouterDates: true/false,

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
      },

    }
  }

]