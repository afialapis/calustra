import assert from 'assert'
import {getConnection} from '../../src'

function test_crud(config, data) {
  let conn= undefined

  describe(`${config.db.dialect}: Test crud`, function() {

    it('should create the database connection', function() {
      conn = getConnection(config)
    })

    it('should drop test_01 table if exists', async function() {
      const query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
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

    it('should create test records', async function() {
      for (const rec of data) {
        const query= `
          INSERT INTO test_01
            (name, description, counter)
          VALUES
            ($1, $2, $3)
        `
        await conn.execute(query, [rec.name, rec.description, rec.counter])
      }
    })

    it('should update one record', async function() {

      const query = `
          UPDATE test_01
              SET description = $1
            WHERE name = $2`
      const cnt= await conn.executeAndCount(query, ['A not so simple man', 'Peter'])

      assert.strictEqual(cnt, 1)
    })

    it('should update several records', async function() {
      const query = `
          UPDATE test_01
              SET name = $1
            WHERE counter = $2`
      const cnt= await conn.executeAndCount(query, ['Frederic', 99])

      assert.strictEqual(cnt, 2)
    })

    it('should delete one record', async function() {
      const query = `
          DELETE
            FROM test_01
            WHERE name = $1`
      const cnt= await conn.executeAndCount(query, ['Jonny'])

      assert.strictEqual(cnt, 1)
    })

    it('should count 3 records', async function() {
      const query = `
        SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)

      assert.strictEqual(res.cnt, 3)
    })

    it('should count 2 records with name Frederic', async function() {
      const query = `
      SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01
          WHERE name = $1`
      const res= await conn.selectOne(query, ['Frederic'])

      assert.strictEqual(res.cnt, 2)
    })
    

    it('should count 2 distinct names, Frederic and Peter', async function() {
      const query = `
        SELECT CAST(COUNT(DISTINCT name) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)

      assert.strictEqual(res.cnt, 2)
    })

    it('should return distinct names, Frederic and Peter', async function() {
      const query = `
        SELECT DISTINCT name as cnt
          FROM test_01`
      const res= await conn.select(query)

      assert.strictEqual(res.length, 2)
    })

    it('should delete other records', async function() {
      const query = `
          DELETE
            FROM test_01`
        const cnt= await conn.executeAndCount(query)

      assert.strictEqual(cnt , 3)
    })

    it('should drop test_01', async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })  

    it('should close connection', async function() {
      conn.close()
    })      
  })

}

export default test_crud



