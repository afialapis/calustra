import assert from 'assert'
import getTableNamesFromQuery from "../src/getTableNamesFromQuery"
import test_queries from './test_queries'

function test_table_names() {

  describe(`Test getTableNamesFromQuery`, function() {

    it('should parse and test several queries', function() {

      test_queries.map(q => {
        const expected = q.tables
        const parsed= getTableNamesFromQuery(q.query)
        
        assert.deepEqual(expected, parsed)
      })
    })

  })
}

export default test_table_names