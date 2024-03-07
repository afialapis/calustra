const expect= global.expect

function test_inspector(conn/*, close= false*/) {
  describe(`[crud][inspector][${conn.config.dialect}] Test inspectors`, function() {
    
    it(`[crud][inspector][${conn.config.dialect}] should create test_01 table`, async function() {
      const query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)
    })

    it(`[crud][inspector][${conn.config.dialect}] should create test_02 table`, async function() {
      const query = `
        CREATE TABLE test_02 (
          id           serial,
          foo          INTEGER,
          bar          TEXT
        )`
      await conn.execute(query)
    })

    it(`[crud][inspector][${conn.config.dialect}] should list table names`, async function() {
      const res= await conn.getTableNames()

      expect(res).to.deep.equal(['test_01', 'test_02'])

    })

    it(`[crud][inspector][${conn.config.dialect}] should drop test_01`, async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })

    it(`[crud][inspector][${conn.config.dialect}] should drop test_02`, async function() {
      const query = `DROP TABLE test_02`
      await conn.execute(query)
    }) 
    

    // it(`[crud][inspector][${conn.config.dialect}] should ${close ? 'close' : 'uncache'} connection`, async function() {
    //   if (close) {
    //     conn.close()
    //   } else {
    //     conn.uncache()
    //   }
    // })            
  })
}

export default test_inspector
