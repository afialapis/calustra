import test from 'node:test'
import assert from 'node:assert'
import { calustra_postgres_conn_init } from '../conn.mjs'

test(`[postgres][inspector] Test inspectors`, async function(t) {
  let conn

  t.test(`[postgres][inspector] should init and cache the conn`, async function() {
    conn = await calustra_postgres_conn_init({
      reset: true,
      cache: false
    })
  })

  t.test(`[postgres][inspector] should drop test_01 table if exists`, async function() {
    const query = `DROP TABLE IF EXISTS test_01`
    await conn.execute(query)
  })
  
  t.test(`[postgres][inspector] should drop test_02 table if exists`, async function() {
    const query = `DROP TABLE IF EXISTS test_02`
    await conn.execute(query)
  })
  
  t.test(`[postgres][inspector] should create test_01 table`, async function() {
    const query = `
      CREATE TABLE test_01 (
        id           serial,
        name         TEXT NOT NULL,
        description  TEXT NULL,
        counter      INTEGER
      )`
    await conn.execute(query)
  })

  t.test(`[postgres][inspector] should create test_02 table`, async function() {
    const query = `
      CREATE TABLE test_02 (
        id           serial,
        foo          INTEGER,
        bar          TEXT
      )`
    await conn.execute(query)
  })

  t.test(`[postgres][inspector] should list table names`, async function() {
    const res= await conn.getTableNames()

    assert.deepStrictEqual(res, ['test_01', 'test_02'])
  })

  t.test(`[postgres][inspector] should drop test_01`, async function() {
    const query = `DROP TABLE test_01`
    await conn.execute(query)
  })

  t.test(`[postgres][inspector] should drop test_02`, async function() {
    const query = `DROP TABLE test_02`
    await conn.execute(query)
  })

  t.test(`[postgres][inspector] should close connection`, async function() {
    conn.close()
  })            
})
