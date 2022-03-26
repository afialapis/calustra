import {getConnection} from 'calustra'
import data from './data'

let conn

function router_test_prepare (db) {  

  it('[PREPARE] create connection', function() {

    conn= getConnection(db)

  })

  it('[PREPARE] should drop test_01 table if exists', async function() {

    const query = `DROP TABLE IF EXISTS test_01`
    await conn.execute(query)

  })

  it('[PREPARE] should create test_01 table', async function() {

    const query = `
      CREATE TABLE test_01 (
        id           serial,
        name         TEXT NOT NULL,
        description  TEXT NULL,
        counter      INTEGER
      )`
    await conn.execute(query)

  })

  it('[PREPARE] should create test records', async function() {

    for (const rec of data) {
      const query= `
        INSERT INTO test_01
          (name, description, counter)
        VALUES
          ($1, $2, $3)`
      await conn.execute(query, [rec.name, rec.description, rec.counter])
    }

  })
}

export default router_test_prepare