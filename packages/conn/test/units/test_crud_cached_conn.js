import assert from 'assert'
import {getConnection} from '../../src'

function test_crud(config, options, data, close= false) {

  const db_name = config.database || config.filename

  describe(`${config.dialect}: Test crud using cached conections (selector: ${db_name})`, function() {


    it('should drop test_01 table if exists', async function() {
      const conn = getConnection(config, options)
      const query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
    })

    it('should create test_01 table', async function() {
      const conn = getConnection(db_name)
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
      const conn = getConnection(db_name)

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
      const conn = getConnection(db_name)

      const query = `
          UPDATE test_01
              SET description = $1
            WHERE name = $2`
      const cnt= await conn.executeAndCount(query, ['A not so simple man', 'Peter'])

      assert.strictEqual(cnt, 1)
    })

    it('should update several records', async function() {
      const conn = getConnection(db_name)
      const query = `
          UPDATE test_01
              SET name = $1
            WHERE counter = $2`
      const cnt= await conn.executeAndCount(query, ['Frederic', 99])

      assert.strictEqual(cnt, 2)
    })

    it('should delete one record', async function() {
      const conn = getConnection(db_name)
      const query = `
          DELETE
            FROM test_01
            WHERE name = $1`
      const cnt= await conn.executeAndCount(query, ['Jonny'])

      assert.strictEqual(cnt, 1)
    })

    it('should count 3 records', async function() {
      const conn = getConnection(db_name)
      const query = `
        SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)

      assert.strictEqual(res.cnt, 3)
    })

    it('should count 2 records with name Frederic', async function() {
      const conn = getConnection(db_name)
      const query = `
      SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01
          WHERE name = $1`
      const res= await conn.selectOne(query, ['Frederic'])

      assert.strictEqual(res.cnt, 2)
    })
    

    it('should count 2 distinct names, Frederic and Peter', async function() {
      const conn = getConnection(db_name)
      const query = `
        SELECT CAST(COUNT(DISTINCT name) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)

      assert.strictEqual(res.cnt, 2)
    })

    it('should return distinct names, Frederic and Peter', async function() {
      const conn = getConnection(db_name)
      const query = `
        SELECT DISTINCT name as cnt
          FROM test_01`
      const res= await conn.select(query)

      assert.strictEqual(res.length, 2)
    })

    it('should delete other records', async function() {
      const conn = getConnection(db_name)
      const query = `
          DELETE
            FROM test_01`
        const cnt= await conn.executeAndCount(query)

      assert.strictEqual(cnt , 3)
    })

    it('should drop test_01', async function() {
      const conn = getConnection(db_name)
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })  

    it(`should ${close ? 'close' : 'uncache'} connection`, async function() {
      const conn = getConnection(db_name)
      if (close) {
        conn.close()
      } else {
        conn.uncache()
      }
    })      
  })

}

export default test_crud



