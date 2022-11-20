import assert from 'assert'
import {getConnection} from '../../src/index'

/*
DO SOMETHING HERE USING DATES OPTIONS

THEN ON ANOTHER TEST TRY CUSTOM HOOKS
--- MAYBE INSTEAD OF HOOKS CALL THEM TRIGERS
*/

function test_model_from_conn(config, options, data) {
  const model_options= {
    useDateFields: true
  }

  describe(`CalustraOrm for ${config.dialect}. Testing the model being retrieved from connection itself.`, function() {

    it('should prepare the database for testing', async function() {
      const conn = getConnection(config, options)
      let query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
      
      query = `
        CREATE TABLE test_01 (
          id              serial,
          name            TEXT NOT NULL,
          description     TEXT NULL,
          counter         INTEGER,
          created_at      INTEGER,
          last_update_at  INTEGER,
          created_by      INTEGER,
          last_update_by  INTEGER           
        )`
      await conn.execute(query)
    })
    it('should insert several records', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)      
      for (const rec of data) {
        await TestModel.insert(rec) //.catch((e) => {})
      }
    })
    
    it('should update one record', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)      
      const count= await TestModel.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.strictEqual(count, 1)
    })

    it('should update several records', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)
      const count= await TestModel.update({name: 'Frederic'}, {counter: 99})
      assert.strictEqual(count, 2)
    })
    
    it('should delete one record', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)
      const count= await TestModel.delete( {name: 'Jonny'})
      assert.strictEqual(count, 1)
    })
    
    it('should count 3 records', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)
      const count= await TestModel.count( {})
      assert.strictEqual(count, 3)
    })
    
    it('should count 2 records with name Frederic', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)
      const count= await TestModel.count( {name: 'Frederic'})
      assert.strictEqual(count, 2)
    })
    
    it('should count 2 distinct names, Frederic and Peter', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)
      const count= await TestModel.count( {}, {distinct: 'name'})
      assert.strictEqual(count, 2)
    })
    
    it('should return distinct names, Frederic and Peter', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)
      const names= await TestModel.distinct( 'name', {})
      assert.strictEqual(names.length, 2)
    })
    
    it('should delete other records', async function() {
      const conn = getConnection(config, options)
      const TestModel = conn.getModel('test_01', model_options)
      const count= await TestModel.delete( {})
      assert.strictEqual(count, 3)
    })
    
    it('should clean and close test database', async function() {
      const conn = getConnection(config, options)
      const query = `DROP TABLE test_01`
      await conn.execute(query)
      conn.close()
    })
    
  })
}

export {test_model_from_conn}



