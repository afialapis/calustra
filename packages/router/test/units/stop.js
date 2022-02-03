import {stop} from '../server'

function router_test_stop () {
  it('[STOP]should stop test server', async function() {
    stop()
  })
}

export default router_test_stop
