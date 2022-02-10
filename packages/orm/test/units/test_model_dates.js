import assert from 'assert'
import {getConnection} from 'calustra-conn'
import {getModel} from '../../src/index'

/*
DO SOMETHING HERE USING DATES OPTIONS

THEN ON ANOTHER TEST TRY CUSTOM HOOKS
--- MAYBE INSTEAD OF HOOKS CALL THEM TRIGERS
*/

function test_model_dates(config, data) {
  const model_options= {
    useDates: true
  }
  
  let conn= undefined, TestModel= undefined

  describe(`CalustraOrm for ${config.connection.dialect}. Testing the model automatic dates`, function() {

    it('should prepare the database for testing', async function() {
      conn = getConnection(config)
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

    it('should create a CalustraOrm model for test table', async function() {
      TestModel = await getModel(conn, 'test_01', model_options)
    })

    it('should insert several records', async function() {
      for (const rec of data) {
        await TestModel.insert(rec) //.catch((e) => {})
      }
    })
    
    it('should update one record', async function() {
      const count= await TestModel.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.strictEqual(count, 1)
    })

    it('should update several records', async function() {
      const count= await TestModel.update({name: 'Frederic'}, {counter: 99})
      assert.strictEqual(count, 2)
    })
    
    it('should delete one record', async function() {
      const count= await TestModel.delete( {name: 'Jonny'})
      assert.strictEqual(count, 1)
    })
    
    it('should count 3 records', async function() {
      const count= await TestModel.count( {})
      assert.strictEqual(count, 3)
    })
    
    it('should count 2 records with name Frederic', async function() {
      const count= await TestModel.count( {name: 'Frederic'})
      assert.strictEqual(count, 2)
    })
    
    it('should count 2 distinct names, Frederic and Peter', async function() {
      const count= await TestModel.count( {}, {distinct: 'name'})
      assert.strictEqual(count, 2)
    })
    
    it('should return distinct names, Frederic and Peter', async function() {
      const names= await TestModel.distinct( 'name', {})
      assert.strictEqual(names.length, 2)
    })
    
    it('should delete other records', async function() {
      const count= await TestModel.delete( {})
      assert.strictEqual(count, 3)
    })
    
    it('should clean and close test database', async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
      conn.close()
    })
    
  })
}

export {test_model_dates}



