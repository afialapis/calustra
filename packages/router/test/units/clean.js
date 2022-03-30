import {getConnection} from 'calustra'

function router_test_clean (config) {  

  it('[CLEAN] should drop test_01', async function() {

    const conn= getConnection(config)
    const query = `DROP TABLE test_01`
    await conn.execute(query)
    conn.close()
    
  })

}

export default router_test_clean
