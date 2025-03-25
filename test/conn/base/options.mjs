const tables= [
  {
    name: 'test_01',
    schema: 'public',
    useDateFields: {
      use: true,
      fieldNames: {
        created_at: 'created_at', 
        last_update_at: 'last_update_at'
      },
      now: () => 999
    },
    triggers: {
      afterInsert: async (conn, id, params, options) => {
        return 777
      }
    }
  }
]

const options= {
  log: 'warn',
  tables
}

export default options
