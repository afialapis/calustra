import {epoch_now} from 'intre'

export default {
  useDateFields: {
    use: false,
    fieldnames: {
      created_at: 'created_at', 
      last_update_at: 'last_update_at'
    },
    now: () => epoch_now()
  },
  /*
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
  */
}
