import test from 'node:test'
import assert from 'node:assert'
import {
  dropConnections
} from '#conn-postgres/index.mjs'
import {
  cacheConnectionGet
} from '#conn-base/cache/index.mjs'
import data from '../data.mjs'
import { calustra_postgres_conn_init } from '../conn.mjs'

const DB_SELECTOR = 'calustra'

test(`[postgres][crud][cache] Test crud using cached conections (selector: ${DB_SELECTOR})`, async function(t) {
  let connid_prev = 0

  t.test(`[postgres][crud][cache] should init and cache the conn`, async function() {
    const conn = await calustra_postgres_conn_init({
      reset: false,
      cache: true
    })
    assert.strictEqual(conn.isOpen, true)
    connid_prev = conn.connid
  })

  t.test(`[postgres][crud][cache] should drop test_01 table if exists`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `DROP TABLE IF EXISTS test_01`
    await cached_conn.execute(query)
  })

  t.test(`[postgres][crud][cache] should create test_01 table`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      CREATE TABLE IF NOT EXISTS test_01 (
        id           serial,
        name         TEXT NOT NULL,
        description  TEXT NULL,
        counter      INTEGER
      )`
    await cached_conn.execute(query)
  })

  t.test(`[postgres][crud][cache] should create test records`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)

    for (const rec of data) {
      const query= `
        INSERT INTO test_01
          (name, description, counter)
        VALUES
          ($1, $2, $3)
      `
      await cached_conn.execute(query, [rec.name, rec.description, rec.counter])
    }
  })

  t.test(`[postgres][crud][cache] should update one record`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)

    const query = `
        UPDATE test_01
            SET description = $1
          WHERE name = $2`
    const cnt= await cached_conn.executeAndCount(query, ['A not so simple man', 'Peter'])

    assert.strictEqual(cnt, 1)
  })

  t.test(`[postgres][crud][cache] should update several records`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
        UPDATE test_01
            SET name = $1
          WHERE counter = $2`
    const cnt= await cached_conn.executeAndCount(query, ['Frederic', 99])

    assert.strictEqual(cnt, 2)
  })

  t.test(`[postgres][crud][cache] should delete one record`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
        DELETE
          FROM test_01
          WHERE name = $1`
    const cnt= await cached_conn.executeAndCount(query, ['Jonny'])

    assert.strictEqual(cnt, 1)
  })

  t.test(`[postgres][crud][cache] should close connection`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    cached_conn.close()
  }) 

  t.test(`[postgres][crud][cache] should find cached connection but closed`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    assert.strictEqual(cached_conn.isOpen, false)
  })     

  t.test(`[postgres][crud][cache] should re-init connection`, async function() {
    const conn = await calustra_postgres_conn_init({
      reset: false,
      cache: true
    })
    assert.strictEqual(conn.isOpen, true)
    assert.strictEqual(conn.connid, connid_prev+1)
    connid_prev = conn.connid
  })  

  t.test(`[postgres][crud][cache] should count 3 records`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      SELECT CAST(COUNT(1) AS int) as cnt
        FROM test_01`
    const res= await cached_conn.selectOne(query)

    assert.strictEqual(res.cnt, 3)
  })

  t.test(`[postgres][crud][cache] should count 2 records with name Frederic`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
    SELECT CAST(COUNT(1) AS int) as cnt
        FROM test_01
        WHERE name = $1`
    const res= await cached_conn.selectOne(query, ['Frederic'])
    
    assert.strictEqual(res.cnt, 2)
  })

  t.test(`[postgres][crud][cache] should count 2 distinct names, Frederic and Peter`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      SELECT CAST(COUNT(DISTINCT name) AS int) as cnt
        FROM test_01`
    const res= await cached_conn.selectOne(query)
    
    assert.strictEqual(res.cnt, 2)
  })

  t.test(`[postgres][crud][cache] should return distinct names, Frederic and Peter`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      SELECT DISTINCT name as cnt
        FROM test_01`
    const res= await cached_conn.select(query)
    
    assert.strictEqual(res.length, 2)
  })

  t.test(`[postgres][crud][cache] should delete other records`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
        DELETE
          FROM test_01`
      const cnt= await cached_conn.executeAndCount(query)
    
    assert.strictEqual(cnt, 3)
  })

  t.test(`[postgres][crud][cache] should drop test_01`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `DROP TABLE test_01`
    await cached_conn.execute(query)
  })

  t.test(`[postgres][crud][cache] should close connection`, async function() {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    cached_conn.close()
  })
  
  t.test(`[postgres][conn_reset] should drop connections`, async function() {
    await dropConnections()
  })  
})

