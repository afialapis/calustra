import {getConnection} from '../../src'
import data from '../data'


function router_test_prepare (connConfig) {  

  it('[PREPARE] should drop test_01 table if exists', async function() {
    const conn= getConnection(connConfig)
    const query = `DROP TABLE IF EXISTS test_01`
    await conn.execute(query)

  })

  it('[PREPARE] should create test_01 table', async function() {
    const conn= getConnection(connConfig)

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
    const conn= getConnection(connConfig)
    const Test01 = conn.getModel('test_01')

    for (const rec of data) {
      await Test01.insert(rec)
    }

  })
}

export default router_test_prepare