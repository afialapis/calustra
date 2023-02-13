import getTableNamesFromQuery from "../src/getTableNamesFromQuery.mjs"
import test_queries from './test_queries.mjs'
const expect = global.expect

function test_table_names() {

  describe(`Test getTableNamesFromQuery`, function() {

    it('should parse and test several queries', function() {

      test_queries.map(q => {
        const expected = q.tables
        const parsed= getTableNamesFromQuery(q.query)

        expect(parsed).to.deep.equal(expected)
      })
    })

  })
}

export default test_table_names