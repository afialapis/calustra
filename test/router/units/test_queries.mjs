import assert from 'assert'
 import { run_test_base_for_routes } from './_base.mjs'

function run_test_queries_noauth(name, config, options, routesConfig, close= false) {
  run_test_base_for_routes(name, config, options, routesConfig, close, (fetcher, url, bodyField) => {
    it(`should fetch test_01 from query noauth (read, unfiltered)`, async function() {
      const response= await fetcher.get(url)
      const data= response.data
      const res = bodyField!=undefined ? data[bodyField] : data
      assert.strictEqual(res.name, 'Peter')

    })
  }, close)
}

function run_test_queries_auth(name, config, options, routesConfig, close= false) {
  run_test_base_for_routes(name, config, options, routesConfig, close, (fetcher, url, bodyField) => {
    it(`should fetch test_01 from query auth (returns error)`, async function() {
      const response= await fetcher.get(url)
      assert.strictEqual(response.status, 404)
    })
  }, close)
}


export {run_test_queries_noauth, run_test_queries_auth}

