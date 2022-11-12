import assert from 'assert'
import {getConnection, getModel, initModelCache} from '../../src/index'


async function test_model_cached(config, options, data) { 
  describe(`CalustraOrm for ${config.dialect}. Testing the cached models`, function() {

    it('should prepare the database for testing', async function() {
      const conn = getConnection(config, options)

      let query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
      
      query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)

      query = `DROP TABLE IF EXISTS test_02`
      await conn.execute(query)
      
      query = `
        CREATE TABLE test_02 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)      
    })

    it('should initmodel cache', async function() {
      await initModelCache(config, options, ['test_01', 'test_02'])
    })

    it('should insert several records', async function() {
      const TestModel = getModel(config, 'test_01', options)
      for (const rec of data) {
        await TestModel.insert(rec) //.catch((e) => {})
      }
    })
    
    it('should update one record', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const count= await TestModel.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.strictEqual(count, 1)
    })

    it('should update several records', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const count= await TestModel.update({name: 'Frederic'}, {counter: 99})
      assert.strictEqual(count, 2)
    })
    
    it('should delete one record', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const count= await TestModel.delete( {name: 'Jonny'})
      assert.strictEqual(count, 1)
    })
    
    it('should count 3 records', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const count= await TestModel.count( {})
      assert.strictEqual(count, 3)
    })
    
    it('should count 2 records with name Frederic', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const count= await TestModel.count( {name: 'Frederic'})
      assert.strictEqual(count, 2)
    })
    
    it('should count 2 distinct names, Frederic and Peter', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const count= await TestModel.count( {}, {distinct: 'name'})
      assert.strictEqual(count, 2)
    })
    
    it('should return distinct names, Frederic and Peter', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const names= await TestModel.distinct( 'name', {})
      assert.strictEqual(names.length, 2)
    })
    
    it('should delete other records', async function() {
      const TestModel = getModel(config, 'test_01', options)
      const count= await TestModel.delete( {})
      assert.strictEqual(count, 3)
    })
    
    it('should clean and close test database', async function() {
      const conn = getConnection(config, options)
      let query = `DROP TABLE test_01`
      await conn.execute(query)
      query = `DROP TABLE test_02`
      await conn.execute(query)
      conn.close()
    })
    
  })
}

export {test_model_cached}


