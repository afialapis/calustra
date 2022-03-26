import {getConnection} from 'calustra'

function router_test_clean (db) {  

  it('[CLEAN] should drop test_01', async function() {

    const conn= getConnection(db)
    const query = `DROP TABLE test_01`
    await conn.execute(query)
    conn.close()
    
  })

}

export default router_test_clean
