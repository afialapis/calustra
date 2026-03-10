import assert from "node:assert"
import test from "node:test"
import getTableNames from "#query/getTableNames.mjs"
import test_queries from "./queries.mjs"

test(`[query] Test getTableNames`, async (t) => {
  t.test("[query] should parse and test several queries", async () => {
    test_queries.forEach((q) => {
      const expected = q.tables
      const parsed = getTableNames(q.query)

      assert.deepEqual(parsed, expected)
    })
  })
})
