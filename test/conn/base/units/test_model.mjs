import assert from 'assert'

async function test_model(testContext, initCallback, data) { 

  describe(`[model][${testContext.dialect}] Testing the model`, function() {

    let conn 

    it(`[model][${testContext.dialect}] should init connection`, async function() {
      conn = await initCallback({
        reset: true,
        cache: false
      })
    })

    it(`[model][${testContext.dialect}] should prepare the database for testing`, async function() {
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

    it(`[model][${testContext.dialect}] should create a Model for test table`, function() {
      const _Test01 = conn.getModel('test_01')
    })

    it(`[model][${testContext.dialect}] should insert several records`, async function() {
      const Test01 = conn.getModel('test_01')
      for (const rec of data) {
        await Test01.insert(rec) //.catch((e) => {})
      }
    })

    it(`[model][${testContext.dialect}] should check all records have created_at=999`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {created_at: 999})
      assert.strictEqual(count, data.length)
    })    
    
    it(`[model][${testContext.dialect}] should update one record`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.strictEqual(count, 1)
    })

    it(`[model][${testContext.dialect}] should check one record have last_update_at=999`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {last_update_at: 999})
      assert.strictEqual(count, 1)
    })

    it(`[model][${testContext.dialect}] should update several records`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.update({name: 'Frederic'}, {counter: 99})
      assert.strictEqual(count, 2)
    })
    
    it(`[model][${testContext.dialect}] should delete one record`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.delete( {name: 'Jonny'})
      assert.strictEqual(count, 1)
    })
    
    it(`[model][${testContext.dialect}] should count 3 records`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {})
      assert.strictEqual(count, 3)
    })
    
    it(`[model][${testContext.dialect}] should count 2 records with name Frederic`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {name: 'Frederic'})
      assert.strictEqual(count, 2)
    })
    
    it(`[model][${testContext.dialect}] should count 2 distinct names, Frederic and Peter`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.count( {}, {distinct: 'name'})
      assert.strictEqual(count, 2)
    })
    
    it(`[model][${testContext.dialect}] should return distinct names, Frederic and Peter`, async function() {
      const Test01 = conn.getModel('test_01')
      const names= await Test01.distinct( 'name', {})
      assert.strictEqual(names.length, 2)
    })
    
    it(`[model][${testContext.dialect}] should delete other records`, async function() {
      const Test01 = conn.getModel('test_01')
      const count= await Test01.delete( {})
      assert.strictEqual(count, 3)
    })

    it(`[model][${testContext.dialect}] should check afterInsert() trigger returns a fake value`, async function() {
      const Test01 = conn.getModel('test_01')
      const rec= data[0]
      const nid= await Test01.insert(rec)
      assert.strictEqual(nid, 777)
    })  

    it(`[model][${testContext.dialect}] should get cached connection from selectors`, async function() {
      const isConn = testContext.isCalustraConnection(conn)

      assert.strictEqual(isConn, true)
    })


    it(`[model][${testContext.dialect}] should get cached connection from selectors and still use getModel`, async function() {
      const Test01 = conn.getModel('test_01')
      const rec= data[0]
      const nid= await Test01.insert(rec)
      assert.strictEqual(nid, 777)      
    })   
    
    it(`[model][${testContext.dialect}] should clean test database`, async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })   
    
    it(`[model][${testContext.dialect}] should close connection`, async function() {
      conn.close()
    })    
  })
}

export default test_model



