import test from 'node:test'
import assert from 'node:assert'
import getTableNames from '#query/getTableNames.mjs'
import test_queries from './queries.mjs'

test(`[query] Test getTableNames`, async function(t) {

  t.test('[query] should parse and test several queries', async function() {

    test_queries.map(q => {
      const expected = q.tables
      const parsed= getTableNames(q.query)

      assert.deepEqual(parsed, expected)
    })
  })

})
