const expect= global.expect

function test_inspector(testContext, initCallback) {
  
  describe(`[inspector][${testContext.dialect}] Test inspectors`, function() {
    let conn

    it(`[inspector][${testContext.dialect}] should init and cache the conn`, async function() {
      conn = await initCallback({
        reset: true,
        cache: false
      })
    })

    it(`[inspector][${testContext.dialect}] should drop test_01 table if exists`, async function() {
      const query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
    })

    it(`[inspector][${testContext.dialect}] should drop test_02 table if exists`, async function() {
      const query = `DROP TABLE IF EXISTS test_02`
      await conn.execute(query)
    })
    
    it(`[inspector][${testContext.dialect}] should create test_01 table`, async function() {
      const query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)
    })

    it(`[inspector][${testContext.dialect}] should create test_02 table`, async function() {
      const query = `
        CREATE TABLE test_02 (
          id           serial,
          foo          INTEGER,
          bar          TEXT
        )`
      await conn.execute(query)
    })

    it(`[inspector][${testContext.dialect}] should list table names`, async function() {
      const res= await conn.getTableNames()

      expect(res).to.deep.equal(['test_01', 'test_02'])
    })

    it(`[inspector][${testContext.dialect}] should drop test_01`, async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })

    it(`[inspector][${testContext.dialect}] should drop test_02`, async function() {
      const query = `DROP TABLE test_02`
      await conn.execute(query)
    })    

    it(`[inspector][${testContext.dialect}] should close connection`, async function() {
      conn.close()
    })            
  })
}

export default test_inspector
