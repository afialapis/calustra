const expect= global.expect

function test_conn_off(conn) {
  describe(`[crud][conn_off][${conn.config.dialect}] Test conn is offs`, function() {
    


    it(`[crud][conn_off][${conn.config.dialect}] should list table names`, async function() {
      const res= await conn.execute('SELECT 1')
      expect(res).to.deep.equal(undefined)
    })

        
  })
}

export default test_conn_off
