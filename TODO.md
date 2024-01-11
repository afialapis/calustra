# conn

## Add log prefix option

To be used instead of `[calustra]`

## Logging queries

If a query takes more than X time, log the complete SQL instead of the resume

# Model

## filtering by null values

if pased a NULL value on the filter, query should do "...AND field IS NULL"



## Connect more databases

### MySql 

  https://github.com/sidorares/node-mysql2/blob/master/documentation/Promise-Wrapper.md
  https://school.geekwall.in/p/YOFpTb6a/node-js-async-await-using-with-mysql
  https://stackoverflow.com/a/51690276


### Sqlite3 
  - plus this:

  https://www.scriptol.com/sql/sqlite-async-await.php
  https://stackoverflow.com/a/62455304

  - or

  https://github.com/kriasoft/node-sqlite#readme

### Oracle

  https://github.com/oracle/node-oracledb/blob/master/examples/select1.js



# orm

-- convert `null` to `undefined`
   - add {options} parameter?
 => notice null===undefined is false but null==undefined is true


