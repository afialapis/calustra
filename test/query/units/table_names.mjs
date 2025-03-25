import test_queries from '../queries.mjs'
const expect = global.expect

function test_table_names(getTableNames) {


  describe(`[query] Test getTableNames`, function() {

    it('[query] should parse and test several queries', function() {

      test_queries.map(q => {
        const expected = q.tables
        const parsed= getTableNames(q.query)

        expect(parsed).to.deep.equal(expected)
      })
    })

  })
}

export default test_table_names