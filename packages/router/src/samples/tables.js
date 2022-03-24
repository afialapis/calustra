[
  
  "table_name",


  {
    name: "table_name",
    schema: "public", // optional
    route: "custom/url",
    require_user_id: false, 
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