import {getConnection} from 'calustra-orm'

function router_test_clean (connConfig) {  

  it('[CLEAN] should drop test_01', async function() {

    const conn= getConnection(connConfig)
    const query = `DROP TABLE test_01`
    await conn.execute(query)
    conn.close()
    
  })

}

export default router_test_clean
