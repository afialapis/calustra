import {getConnection} from 'calustra-orm'

function router_test_clean (config, options) {  

  it('[CLEAN] should drop test_01', async function() {

    const conn= getConnection(config, options)
    const query = `DROP TABLE test_01`
    await conn.execute(query)
    conn.close()
    
  })

}

export default router_test_clean
