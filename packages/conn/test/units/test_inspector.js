import assert from 'assert'
import {getConnection} from '../../src'


function test_inspector(config) {
  let conn= undefined

  describe(`${config.connection.dialect}: Test inspectors`, function() {

    it('should create the database connection', function() {
      conn = getConnection(config)
    })
    
    it('should create test_01 table', async function() {
      const query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)
    })

    it('should create test_02 table', async function() {
      const query = `
        CREATE TABLE test_02 (
          id           serial,
          foo          INTEGER,
          bar          TEXT
        )`
      await conn.execute(query)
    })

    it('should list table names', async function() {
      const res= await conn.getTableNames()
      assert.deepStrictEqual(res, ['test_01', 'test_02'])
    })

    it('should drop test_01', async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })

    it('should drop test_02', async function() {
      const query = `DROP TABLE test_02`
      await conn.execute(query)
    }) 
    
    it('should close connection', async function() {
      conn.close()
    })        
  })
}

export default test_inspector
