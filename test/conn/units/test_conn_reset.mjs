import {getConnection, dropConnection, dropConnections} from '../../../src/conn/index.mjs'
const expect= global.expect

function test_conn_off(config, options, data) {

  const db_name = config.database || config.filename

  describe(`[conn_reset][${config.dialect}] Test conn resets and so`, function() {
    
    it(`[conn_reset][${config.dialect}] should init and cache the conn`, async function() {
      const conn = await getConnection(config, {
        ...options,
        reset: true,
        //log: 'silly'
      })
      expect(conn.isOpen).to.deep.equal(true)
    })

    it(`[conn_reset][${config.dialect}] should drop test_01 table if exists`, async function() {
      const conn = await getConnection(db_name)
      const query = `DROP TABLE IF EXISTS test_01`
      await conn.execute(query)
    })

    it(`[conn_reset][${config.dialect}] should create test_01 table`, async function() {
      const conn = await getConnection(db_name)
      const query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await conn.execute(query)
    })

    it(`[conn_reset][${config.dialect}] should create test records`, async function() {
      const conn = await getConnection(db_name)

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

    it(`[conn_reset][${config.dialect}] should close connection`, async function() {
      const conn = await getConnection(db_name)
      conn.close()
      expect(conn.isOpen).to.deep.equal(false)
    })    

    it(`[conn_reset][${config.dialect}] should see conn unavailable after conn is closed`, async function() {
      try {
        const _conn = await getConnection(db_name)
      } catch(e) {
        expect(e.message.indexOf('Could not get cached connection')>0).to.deep.equal(true)
      }
    })    

    it(`[conn_reset][${config.dialect}] should reset the conn`, async function() {
      const conn = await getConnection(config, {
        ...options,
        reset: true
      })
      expect(conn.isOpen).to.deep.equal(true)
    })

    it(`[conn_reset][${config.dialect}] should update one record`, async function() {
      const conn = await getConnection(db_name)

      const query = `
          UPDATE test_01
              SET description = $1
            WHERE name = $2`
      const cnt= await conn.executeAndCount(query, ['A not so simple man', 'Peter'])

      expect(cnt).to.equal(1)
    })

    it(`[conn_reset][${config.dialect}] should update several records`, async function() {
      const conn = await getConnection(db_name)
      const query = `
          UPDATE test_01
              SET name = $1
            WHERE counter = $2`
      const cnt= await conn.executeAndCount(query, ['Frederic', 99])

      expect(cnt).to.equal(2)
    })

    it(`[conn_reset][${config.dialect}] should delete one record`, async function() {
      const conn = await getConnection(db_name)
      const query = `
          DELETE
            FROM test_01
            WHERE name = $1`
      const cnt= await conn.executeAndCount(query, ['Jonny'])

      expect(cnt).to.equal(1)
    })

    it(`[conn_reset][${config.dialect}] should drop all conns`, async function() {
      await dropConnections()
    })    

    it(`[conn_reset][${config.dialect}] should see conn unavailable after all conns are dopeed`, async function() {
      try {
        const _conn = await getConnection(db_name)
      } catch(e) {
        expect(e.message.indexOf('Could not get cached connection')>0).to.deep.equal(true)
      }
    })    

    it(`[conn_reset][${config.dialect}] should reset the conn`, async function() {
      const conn = await getConnection(config, {
        ...options,
        reset: true
      })
      expect(conn.isOpen).to.deep.equal(true)
    })

    it(`[conn_reset][${config.dialect}] should count 3 records`, async function() {
      const conn = await getConnection(db_name)
      const query = `
        SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)

      expect(res.cnt).to.equal(3)
    })

    it(`[conn_reset][${config.dialect}] should count 2 records with name Frederic`, async function() {
      const conn = await getConnection(db_name)
      const query = `
      SELECT CAST(COUNT(1) AS int) as cnt
          FROM test_01
          WHERE name = $1`
      const res= await conn.selectOne(query, ['Frederic'])
      
      expect(res.cnt).to.equal(2)
    })

    it(`[conn_reset][${config.dialect}] should drop this connection`, async function() {
      await dropConnection(db_name)
    })    

    it(`[conn_reset][${config.dialect}] should see conn unavailable after conn is dropped`, async function() {
      try {
        const _conn = await getConnection(db_name)
      } catch(e) {
        expect(e.message.indexOf('Could not get cached connection')>0).to.deep.equal(true)
      }
    })    

    it(`[conn_reset][${config.dialect}] should reset the conn`, async function() {
      const conn = await getConnection(config, {
        ...options,
        reset: true
      })
      expect(conn.isOpen).to.deep.equal(true)
    })


    it(`[conn_reset][${config.dialect}] should count 2 distinct names, Frederic and Peter`, async function() {
      const conn = await getConnection(db_name)
      const query = `
        SELECT CAST(COUNT(DISTINCT name) AS int) as cnt
          FROM test_01`
      const res= await conn.selectOne(query)
      
      expect(res.cnt).to.equal(2)
    })

    it(`[conn_reset][${config.dialect}] should return distinct names, Frederic and Peter`, async function() {
      const conn = await getConnection(db_name)
      const query = `
        SELECT DISTINCT name as cnt
          FROM test_01`
      const res= await conn.select(query)
      
      expect(res.length).to.equal(2)
    })

    it(`[conn_reset][${config.dialect}] should delete other records`, async function() {
      const conn = await getConnection(db_name)
      const query = `
          DELETE
            FROM test_01`
        const cnt= await conn.executeAndCount(query)
      
      expect(cnt).to.equal(3)
    })

    it(`[conn_reset][${config.dialect}] should close connection`, async function() {
      const conn = await getConnection(db_name)
      conn.close()
    }) 
  })
}

export default test_conn_off
