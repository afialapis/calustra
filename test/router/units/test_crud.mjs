import assert from 'assert'
import data from '../../common/data.mjs'
import { run_test_base_for_routes } from './_base.mjs'

function run_test_crud (name, config, options, routesConfig, close= false) {  

  run_test_base_for_routes(name, config, options, routesConfig, close, (fetcher, url, bodyField) => {

    it(`should fetch test_01 from crud (read, unfiltered)`, async function() {
      const response= await fetcher.read(url)
      const res = bodyField!=undefined ? response[bodyField] : response
      
      assert.strictEqual(res.length, data.length)
    })

    
    it(`should fetch test_01 from crud (read, filtered by name)`, async function() {
      const response= await fetcher.read(url, {name: 'Peter'})
      const res = bodyField!=undefined ? response[bodyField] : response

      assert.strictEqual(res.length, data.filter(r => r.name=='Peter').length)
    })
  })

}





export {run_test_crud}
