import {getConnection} from '../../src/index.mjs'
const expect= global.expect

function test_crud(config, options, data, close= false) {
  let conn= undefined


  
  describe(`${config.dialect}: Test crud`, function() {

    it('should create the database connection', function() {
      conn = getConnection(config, options)
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

      expect(cnt).to.equal(1)
    })

    it('should update several records', async function() {
      const query = `
          UPDATE test_01
              SET name = $1
            WHERE counter = $2`
      const cnt= await conn.executeAndCount(query, ['Frederic', 99])

      expect(cnt).to.equal(2)
    })

    it('should delete one record', async function() {
      const query = `
          DELETE
            FROM test_01
            WHERE name = $1`
      const cnt= await conn.executeAndCount(query, ['Jonny'])

      expect(cnt).to.equal(1)
    })

    it('should count 3 records', async function() {
      const query = `
        SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)

      expect(res.cnt).to.equal(3)
    })

    it('should count 2 records with name Frederic', async function() {
      const query = `
      SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01
          WHERE name = $1`
      const res= await conn.selectOne(query, ['Frederic'])

      expect(res.cnt).to.equal(2)
    })
    

    it('should count 2 distinct names, Frederic and Peter', async function() {
      const query = `
        SELECT CAST(COUNT(DISTINCT name) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)

      expect(res.cnt).to.equal(2)
    })

    it('should return distinct names, Frederic and Peter', async function() {
      const query = `
        SELECT DISTINCT name as cnt
          FROM test_01`
      const res= await conn.select(query)
      
      expect(res.length).to.equal(2)
    })

    it('should delete other records', async function() {
      const query = `
          DELETE
            FROM test_01`
        const cnt= await conn.executeAndCount(query)
      
      expect(cnt).to.equal(3)
    })

    it('should drop test_01', async function() {
      const query = `DROP TABLE test_01`
      await conn.execute(query)
    })  

    it(`should ${close ? 'close' : 'uncache'} connection`, async function() {
      if (close) {
        conn.close()
      } else {
        conn.uncache()
      }
    })      
  })

}

export default test_crud



