import assert from 'assert'
import data from '../../common/data.mjs'
import { run_test_base_for_all } from './_base.mjs'

function run_test_crud_all (name, config, options, close= false) {  

  run_test_base_for_all(name, config, options, close, (fetcher, url) => {

    it(`should fetch test_01 from crud (read, unfiltered)`, async function() {
      const res= await fetcher.read(`${url}/test_01`)
      assert.strictEqual(res.length, data.length)
    })
    
    it(`should fetch test_01 from crud (read, filtered by name)`, async function() {
      const res= await fetcher.read(`${url}/test_01`, {name: 'Peter'})
      assert.strictEqual(res.length, data.filter(r => r.name=='Peter').length)
    })
  })
}



export {run_test_crud_all}
