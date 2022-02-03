import CalustraRouter from '../../src'
import {start} from '../server'

function router_test_start (conn, server) {

  it('[START]should init test_01 routes and server them', async function() {
    const router= await CalustraRouter(conn, 
                                   /*tables*/ '*', 
                                   /*prefix*/ server.url, 
                                   /*schema*/ 'public',
                                  /*options*/ {
                                    body_field: undefined
                                  })
    start(router.routes())
  })

}

export default router_test_start



