import assert from "node:assert"
import test from "node:test"
import { isCalustraConnection } from "#conn-postgres/index.mjs"
import { calustra_postgres_conn_init } from "../conn.mjs"
import data from "../data.mjs"

test(`[postgres][model] Testing the model`, async (t) => {
  let conn

  t.test(`[postgres][model] should init connection`, async () => {
    conn = await calustra_postgres_conn_init({
      reset: true,
      cache: false
    })
  })

  t.test(`[postgres][model] should prepare the database for testing`, async () => {
    let query = `DROP TABLE IF EXISTS test_01`
    await conn.execute(query)

    query = `
      CREATE TABLE test_01 (
        id             serial,
        name           text not null,
        description    text null,
        counter        integer,
        created_at     int,
        last_update_at int
      )`
    await conn.execute(query)
  })

  t.test(`[postgres][model] should create a Model for test table`, () => {
    const _Test01 = conn.getModel("test_01")
  })

  t.test(`[postgres][model] should insert several records`, async () => {
    const Test01 = conn.getModel("test_01")
    for (const rec of data) {
      await Test01.insert(rec) //.catch((e) => {})
    }
  })

  t.test(`[postgres][model] should check all records have created_at=999`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.count({ created_at: 999 })
    assert.strictEqual(count, data.length)
  })

  t.test(`[postgres][model] should update one record`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.update({ description: "A not so simple man" }, { name: "Peter" })
    assert.strictEqual(count, 1)
  })

  t.test(`[postgres][model] should check one record have last_update_at=999`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.count({ last_update_at: 999 })
    assert.strictEqual(count, 1)
  })

  t.test(`[postgres][model] should update several records`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.update({ name: "Frederic" }, { counter: 99 })
    assert.strictEqual(count, 2)
  })

  t.test(`[postgres][model] should delete one record`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.delete({ name: "Jonny" })
    assert.strictEqual(count, 1)
  })

  t.test(`[postgres][model] should count 3 records`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.count({})
    assert.strictEqual(count, 3)
  })

  t.test(`[postgres][model] should count 2 records with name Frederic`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.count({ name: "Frederic" })
    assert.strictEqual(count, 2)
  })

  t.test(`[postgres][model] should count 2 distinct names, Frederic and Peter`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.count({}, { distinct: "name" })
    assert.strictEqual(count, 2)
  })

  t.test(`[postgres][model] should return distinct names, Frederic and Peter`, async () => {
    const Test01 = conn.getModel("test_01")
    const names = await Test01.distinct("name", {})
    assert.strictEqual(names.length, 2)
  })

  t.test(`[postgres][model] should delete other records`, async () => {
    const Test01 = conn.getModel("test_01")
    const count = await Test01.delete({})
    assert.strictEqual(count, 3)
  })

  t.test(`[postgres][model] should check afterInsert() trigger returns a fake value`, async () => {
    const Test01 = conn.getModel("test_01")
    const rec = data[0]
    const nid = await Test01.insert(rec)
    assert.strictEqual(nid, 777)
  })

  t.test(`[postgres][model] should get cached connection from selectors`, async () => {
    const isConn = isCalustraConnection(conn)

    assert.strictEqual(isConn, true)
  })

  t.test(
    `[postgres][model] should get cached connection from selectors and still use getModel`,
    async () => {
      const Test01 = conn.getModel("test_01")
      const rec = data[0]
      const nid = await Test01.insert(rec)
      assert.strictEqual(nid, 777)
    }
  )

  t.test(`[postgres][model] should clean test database`, async () => {
    const query = `DROP TABLE test_01`
    await conn.execute(query)
  })

  t.test(`[postgres][model] should close connection`, async () => {
    conn.close()
  })
})
