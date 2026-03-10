import assert from "node:assert"
import test from "node:test"
import { cacheConnectionGet } from "#conn-base/cache/index.mjs"
import { dropConnection, dropConnections } from "#conn-sqlite/index.mjs"

import { calustra_sqlite_conn_init } from "../conn.mjs"
import data from "../data.mjs"

const DB_SELECTOR = "calustra"

test(`[sqlite][conn_reset] Test conn resets and so`, async (t) => {
  let conn

  t.test(`[sqlite][conn_reset] should init and cache the conn`, async () => {
    conn = await calustra_sqlite_conn_init({
      reset: true
    })
    assert.strictEqual(conn.isOpen, true)
  })

  t.test(`[sqlite][conn_reset] should drop test_01 table if exists`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `DROP TABLE IF EXISTS test_01`
    await cached_conn.execute(query)
  })

  t.test(`[sqlite][conn_reset] should create test_01 table`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      CREATE TABLE test_01 (
        id           serial,
        name         TEXT NOT NULL,
        description  TEXT NULL,
        counter      INTEGER
      )`
    await cached_conn.execute(query)
  })

  t.test(`[sqlite][conn_reset] should create test records`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)

    for (const rec of data) {
      const query = `
        INSERT INTO test_01
          (name, description, counter)
        VALUES
          ($1, $2, $3)
      `
      await cached_conn.execute(query, [rec.name, rec.description, rec.counter])
    }
  })

  t.test(`[sqlite][conn_reset] should close connection`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    cached_conn.close()
    assert.strictEqual(cached_conn.isOpen, false)
  })

  t.test(`[sqlite][conn_reset] should see conn unavailable after conn is closed`, async () => {
    try {
      const _cached_conn = await cacheConnectionGet(DB_SELECTOR)
    } catch (e) {
      assert.strictEqual(e.message.indexOf("Could not get cached connection") > 0, true)
    }
  })

  t.test(`[sqlite][conn_reset] should reset the conn`, async () => {
    conn = await calustra_sqlite_conn_init({
      reset: true
    })
    assert.strictEqual(conn.isOpen, true)
  })

  t.test(`[sqlite][conn_reset] should update one record`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)

    const query = `
        UPDATE test_01
            SET description = $1
          WHERE name = $2`
    const cnt = await cached_conn.executeAndCount(query, ["A not so simple man", "Peter"])

    assert.strictEqual(cnt, 1)
  })

  t.test(`[sqlite][conn_reset] should update several records`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
        UPDATE test_01
            SET name = $1
          WHERE counter = $2`
    const cnt = await cached_conn.executeAndCount(query, ["Frederic", 99])

    assert.strictEqual(cnt, 2)
  })

  t.test(`[sqlite][conn_reset] should delete one record`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
        DELETE
          FROM test_01
          WHERE name = $1`
    const cnt = await cached_conn.executeAndCount(query, ["Jonny"])

    assert.strictEqual(cnt, 1)
  })

  t.test(`[sqlite][conn_reset] should drop all conns`, async () => {
    await dropConnections()
  })

  t.test(
    `[sqlite][conn_reset] should see conn unavailable after all conns are dopeed`,
    async () => {
      try {
        const _cached_conn = await cacheConnectionGet(DB_SELECTOR)
      } catch (e) {
        assert.strictEqual(e.message.indexOf("Could not get cached connection") > 0, true)
      }
    }
  )

  t.test(`[sqlite][conn_reset] should reset the conn`, async () => {
    conn = await calustra_sqlite_conn_init({
      reset: true
    })
    assert.strictEqual(conn.isOpen, true)
  })

  t.test(`[sqlite][conn_reset] should count 3 records`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      SELECT CAST(COUNT(1) AS int) as cnt
        FROM test_01`
    const res = await cached_conn.selectOne(query)

    assert.strictEqual(res.cnt, 3)
  })

  t.test(`[sqlite][conn_reset] should count 2 records with name Frederic`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
    SELECT CAST(COUNT(1) AS int) as cnt
        FROM test_01
        WHERE name = $1`
    const res = await cached_conn.selectOne(query, ["Frederic"])

    assert.strictEqual(res.cnt, 2)
  })

  t.test(`[sqlite][conn_reset] should drop this connection`, async () => {
    await dropConnection(DB_SELECTOR)
  })

  t.test(`[sqlite][conn_reset] should see conn unavailable after conn is dropped`, async () => {
    try {
      const cached_conn = await cacheConnectionGet(DB_SELECTOR)
      assert.strictEqual(cached_conn, undefined)
    } catch (e) {
      assert.strictEqual(e.message.indexOf("Could not get cached connection") > 0, true)
    }
  })

  t.test(`[sqlite][conn_reset] should reset the conn`, async () => {
    conn = await calustra_sqlite_conn_init({
      reset: true
    })
    assert.strictEqual(conn.isOpen, true)
  })

  t.test(`[sqlite][conn_reset] should count 2 distinct names, Frederic and Peter`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      SELECT CAST(COUNT(DISTINCT name) AS int) as cnt
        FROM test_01`
    const res = await cached_conn.selectOne(query)

    assert.strictEqual(res.cnt, 2)
  })

  t.test(`[sqlite][conn_reset] should return distinct names, Frederic and Peter`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
      SELECT DISTINCT name as cnt
        FROM test_01`
    const res = await cached_conn.select(query)

    assert.strictEqual(res.length, 2)
  })

  t.test(`[sqlite][conn_reset] should delete other records`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    const query = `
        DELETE
          FROM test_01`
    const cnt = await cached_conn.executeAndCount(query)

    assert.strictEqual(cnt, 3)
  })

  t.test(`[sqlite][conn_reset] should close connection`, async () => {
    const cached_conn = await cacheConnectionGet(DB_SELECTOR)
    cached_conn.close()
  })
})
