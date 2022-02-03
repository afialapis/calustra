import assert from 'assert'
import fetch from 'node-fetch'

function router_test_fetch (server, rows) {

  it('[FETCH]should fetch test_01 from api (READ)', async function() {

    const response = await fetch(`http://localhost:${server.port}${server.url}/test_01/read`)
    const data = await response.json()
    assert.strictEqual(data.length, rows.length)

  })  
}

export default router_test_fetch