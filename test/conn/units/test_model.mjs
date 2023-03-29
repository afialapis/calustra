import assert from 'assert'
import {getConnection} from '../../../src/conn/index.mjs'
import { isCalustraConnection } from '../../../src/conn/checks.mjs'


async function test_model(config, options, data, close= false) { 
  const dialect= config.dialect
  describe(`CalustraOrm for ${dialect}. Testing the model`, function() {

    it('should prepare the database for testing', async function() {
      const conn = getConnection(config, options)
      let query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
      
      query = `
        CREATE TABLE test_01 (
          id             serial,
          name           text not null,
          description    text null,
          counter        integer,
          created_at     int,
          last_update_at int
        )`
      await conn.execute(query)
    })

    it('should create a CalustraOrm model for test table', function() {
      const conn = getConnection(dialect)
      const _Test01 = conn.getModel('test_01')
    })

    it('should insert several records', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      for (const rec of data) {
        await Test01.insert(rec) //.catch((e) => {})
      }
    })

    it('should check all records have created_at=999', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {created_at: 999})
      assert.strictEqual(count, data.length)
    })    
    
    it('should update one record', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.strictEqual(count, 1)
    })

    it('should check one record have last_update_at=999', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {last_update_at: 999})
      assert.strictEqual(count, 1)
    })

    it('should update several records', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.update({name: 'Frederic'}, {counter: 99})
      assert.strictEqual(count, 2)
    })
    
    it('should delete one record', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.delete( {name: 'Jonny'})
      assert.strictEqual(count, 1)
    })
    
    it('should count 3 records', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {})
      assert.strictEqual(count, 3)
    })
    
    it('should count 2 records with name Frederic', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {name: 'Frederic'})
      assert.strictEqual(count, 2)
    })
    
    it('should count 2 distinct names, Frederic and Peter', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {}, {distinct: 'name'})
      assert.strictEqual(count, 2)
    })
    
    it('should return distinct names, Frederic and Peter', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const names= await Test01.distinct( 'name', {})
      assert.strictEqual(names.length, 2)
    })
    
    it('should delete other records', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const count= await Test01.delete( {})
      assert.strictEqual(count, 3)
    })

    it('should check afterInsert() trigger returns a fake value', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const rec= data[0]
      const nid= await Test01.insert(rec)
      assert.strictEqual(nid, 777)
    })  

    it('should get cached connection from selectors', async function() {
      const conn = getConnection(dialect)      
      const isConn = isCalustraConnection(conn)

      assert.strictEqual(isConn, true)
    })


    it('should get cached connection from selectors and still use getModel', async function() {
      const conn = getConnection(dialect)
      const Test01 = conn.getModel('test_01')
      const rec= data[0]
      const nid= await Test01.insert(rec)
      assert.strictEqual(nid, 777)      
    })   
    
    it('should clean test database', async function() {
      const conn = getConnection(dialect)
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })   
    
    if (close) {
      it(`should close connection`, async function() {
        const conn = getConnection(dialect)
        conn.close()
      })    
    }
  })
}

export default test_model



