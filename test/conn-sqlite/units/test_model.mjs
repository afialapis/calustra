import test from 'node:test'
import assert from 'node:assert'
import {
  isCalustraConnection
} from '#conn-sqlite/index.mjs'
import { calustra_sqlite_conn_init } from '../conn.mjs'
import data from '../data.mjs'

test(`[sqlite][model] Testing the model`, async function(t) {

  let conn 

  t.test(`[sqlite][model] should init connection`, async function() {
    conn = await calustra_sqlite_conn_init({
      reset: true,
      cache: false
    })
  })

  t.test(`[sqlite][model] should prepare the database for testing`, async function() {
    let query = `DROP TABLE IF EXISTS test_01`
    await conn.execute(query)
    
    query = `
      CREATE TABLE test_01 (
        id             serial,
        name           text not null,
        description    text null,
        counter        integer,
        created_at     int,
        last_update_at int
      )`
    await conn.execute(query)
  })

  t.test(`[sqlite][model] should create a Model for test table`, function() {
    const _Test01 = conn.getModel('test_01')
  })

  t.test(`[sqlite][model] should insert several records`, async function() {
    const Test01 = conn.getModel('test_01')
    for (const rec of data) {
      await Test01.insert(rec) //.catch((e) => {})
    }
  })

  t.test(`[sqlite][model] should check all records have created_at=999`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.count( {created_at: 999})
    assert.strictEqual(count, data.length)
  })    
  
  t.test(`[sqlite][model] should update one record`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.update({description: 'A not so simple man'}, {name: 'Peter'})
    assert.strictEqual(count, 1)
  })

  t.test(`[sqlite][model] should check one record have last_update_at=999`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.count( {last_update_at: 999})
    assert.strictEqual(count, 1)
  })

  t.test(`[sqlite][model] should update several records`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.update({name: 'Frederic'}, {counter: 99})
    assert.strictEqual(count, 2)
  })
  
  t.test(`[sqlite][model] should delete one record`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.delete( {name: 'Jonny'})
    assert.strictEqual(count, 1)
  })
  
  t.test(`[sqlite][model] should count 3 records`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.count( {})
    assert.strictEqual(count, 3)
  })
  
  t.test(`[sqlite][model] should count 2 records with name Frederic`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.count( {name: 'Frederic'})
    assert.strictEqual(count, 2)
  })
  
  t.test(`[sqlite][model] should count 2 distinct names, Frederic and Peter`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.count( {}, {distinct: 'name'})
    assert.strictEqual(count, 2)
  })
  
  t.test(`[sqlite][model] should return distinct names, Frederic and Peter`, async function() {
    const Test01 = conn.getModel('test_01')
    const names= await Test01.distinct( 'name', {})
    assert.strictEqual(names.length, 2)
  })
  
  t.test(`[sqlite][model] should delete other records`, async function() {
    const Test01 = conn.getModel('test_01')
    const count= await Test01.delete( {})
    assert.strictEqual(count, 3)
  })

  t.test(`[sqlite][model] should check afterInsert() trigger returns a fake value`, async function() {
    const Test01 = conn.getModel('test_01')
    const rec= data[0]
    const nid= await Test01.insert(rec)
    assert.strictEqual(nid, 777)
  })  

  t.test(`[sqlite][model] should get cached connection from selectors`, async function() {
    const isConn = isCalustraConnection(conn)

    assert.strictEqual(isConn, true)
  })


  t.test(`[sqlite][model] should get cached connection from selectors and still use getModel`, async function() {
    const Test01 = conn.getModel('test_01')
    const rec= data[0]
    const nid= await Test01.insert(rec)
    assert.strictEqual(nid, 777)      
  })   
  
  t.test(`[sqlite][model] should clean test database`, async function() {
    const query = `DROP TABLE test_01`
    await conn.execute(query)
  })   
  
  t.test(`[sqlite][model] should close connection`, async function() {
    conn.close()
  })    
})


