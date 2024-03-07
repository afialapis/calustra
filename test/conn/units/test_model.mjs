import assert from 'assert'
import { isCalustraConnection } from '../../../src/conn/checks.mjs'


async function test_model(conn, data, close= false) { 

  describe(`[crud][model][${conn.config.dialect}] Testing the model`, function() {

    it(`[crud][model][${conn.config.dialect}] should prepare the database for testing`, async function() {
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

    it(`[crud][model][${conn.config.dialect}] should create a CalustraOrm model for test table`, function() {
      const _Test01 = conn.getModel('test_01')
    })

    it(`[crud][model][${conn.config.dialect}] should insert several records`, async function() {
      const Test01 = conn.getModel('test_01')
      for (const rec of data) {
        await Test01.insert(rec) //.catch((e) => {})
      }
    })

    it(`[crud][model][${conn.config.dialect}] should check all records have created_at=999`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {created_at: 999})
      assert.strictEqual(count, data.length)
    })    
    
    it(`[crud][model][${conn.config.dialect}] should update one record`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.strictEqual(count, 1)
    })

    it(`[crud][model][${conn.config.dialect}] should check one record have last_update_at=999`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {last_update_at: 999})
      assert.strictEqual(count, 1)
    })

    it(`[crud][model][${conn.config.dialect}] should update several records`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.update({name: 'Frederic'}, {counter: 99})
      assert.strictEqual(count, 2)
    })
    
    it(`[crud][model][${conn.config.dialect}] should delete one record`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.delete( {name: 'Jonny'})
      assert.strictEqual(count, 1)
    })
    
    it(`[crud][model][${conn.config.dialect}] should count 3 records`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {})
      assert.strictEqual(count, 3)
    })
    
    it(`[crud][model][${conn.config.dialect}] should count 2 records with name Frederic`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {name: 'Frederic'})
      assert.strictEqual(count, 2)
    })
    
    it(`[crud][model][${conn.config.dialect}] should count 2 distinct names, Frederic and Peter`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {}, {distinct: 'name'})
      assert.strictEqual(count, 2)
    })
    
    it(`[crud][model][${conn.config.dialect}] should return distinct names, Frederic and Peter`, async function() {
      const Test01 = conn.getModel('test_01')
      const names= await Test01.distinct( 'name', {})
      assert.strictEqual(names.length, 2)
    })
    
    it(`[crud][model][${conn.config.dialect}] should delete other records`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.delete( {})
      assert.strictEqual(count, 3)
    })

    it(`[crud][model][${conn.config.dialect}] should check afterInsert() trigger returns a fake value`, async function() {
      const Test01 = conn.getModel('test_01')
      const rec= data[0]
      const nid= await Test01.insert(rec)
      assert.strictEqual(nid, 777)
    })  

    it(`[crud][model][${conn.config.dialect}] should get cached connection from selectors`, async function() {
      const isConn = isCalustraConnection(conn)

      assert.strictEqual(isConn, true)
    })


    it(`[crud][model][${conn.config.dialect}] should get cached connection from selectors and still use getModel`, async function() {
      const Test01 = conn.getModel('test_01')
      const rec= data[0]
      const nid= await Test01.insert(rec)
      assert.strictEqual(nid, 777)      
    })   
    
    it(`[crud][model][${conn.config.dialect}] should clean test database`, async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })   
    
    if (close) {
      it(`[crud][model][${conn.config.dialect}] should close connection`, async function() {
        conn.close()
      })    
    }
  })
}

export default test_model



