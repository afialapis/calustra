function router_test_clean (conn) {  
  it('[CLEAN]should drop test_01', async function() {
    const query = `DROP TABLE test_01`
    await conn.execute(query)
    conn.close()
  })

}

export default router_test_clean
