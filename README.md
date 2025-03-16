# calustra
[![NPM Version](https://badge.fury.io/js/calustra.svg)](https://www.npmjs.com/package/calustra)
[![NPM Downloads](https://img.shields.io/npm/dm/calustra.svg?style=flat)](https://www.npmjs.com/package/calustra)

![Calustra logo](https://www.afialapis.com/os/calustra/logo.png)

---

> **[calustra](https://academia.gal/dicionario/-/termo/calustra)**. substantivo femenino:

> **Construción rural, de forma xeralmente rectangular, feita sobre columnas e con moitas aberturas nas paredes para facilitar a ventilación, que se utiliza fundamentalmente para gardar o millo e outros produtos agrícolas.**

> _Gardan o millo na calustra._

---


## Intro

[`calustra`](https://www.afialapis.com/os/calustra) is a database connector.

Currently, supported databases are:

 * PostgreSQL (through [pg-promise](https://github.com/vitaly-t/pg-promise)). 
 * SQLite (through [sqlite3](https://github.com/TryGhost/node-sqlite3)). 

We may add support for other databases (`MySql`, `MsSql`, ...) in the future. Or may not.

## Install

```
npm install calustra
```

## Getting Started

`calustra` exposes just the method `getConnection` which returns a [Connection object](#connection-object).
With that connection, you may `select(query)`, `selectOne(query)`, `execute(query)` or `executeAndCount(query)` some `SQL` query.

You can also do `.getModel(table_name)`, which returns a [Model object](#model-object).

You can also import some interesting `SQL` query tools from [`calustra/query`](#calustraquery-tools).

```js
import {getConnection} from 'calustra'

// Init connection
const config= {
  dialect:  'postgres',
  host:     'localhost',
  port:     5432,
  database: 'calustra',
  user:     'postgres',
  password: 'postgres'
}
const options= {
  log: 'debug',
  tables: ['screw_stock'],
  cache: {type: 'memory'},
  reset: true
}
const conn = await getConnection(config, options)

// create a table
const q_drop = `DROP TABLE IF EXISTS screw_stock`
await conn.execute(q_drop)

const q_create = `
  CREATE TABLE screw_stock (
    id           serial,
    screw_type   TEXT NOT NULL,
    stock        INT
  )`
await conn.execute(q_create)

// fill table
const data = [
  ['Wood Screws', 1034],
  ['Machine Screws', 3545],
  ['Thread Cutting Machine Screws', 466],
  ['Sheet Metal Screws', 6436],
  ['Self Drilling Screws', 265],
  ['Hex Bolts', 3653],
  ['Carriage Bolts', 63],
  ['Tag Bolts', 3573]
]

//
// Let's play using connection directly
//
const q_insert = 'INSERT INTO screw_stock (screw_type, stock) VALUES ($1, $2)
for (const d of data) {
  await conn.execute(q_insert, d)
}

// select many records
const q_select = 'SELECT * FROM screw_stock'
const screws = await conn.select(q_select)

// select one record
const q_select_one = 'SELECT * FROM screw_stock WHERE screw_type = $1'
const hex_bolts = await conn.selectOne(q_select_one, ['Hex Bolts'])

// clean some records
const q_del = 'DELETE FROM screw_stock WHERE stock >= $1'
const del_records = await conn.executeAndCount(q_del, [1000])

//
// Let's play using models
//

const ScrewStock = connection.getModel('screw_stock')

// fill table
for (const d of data) {
  await ScrewStock.insert({screw_type: d[0], stock: d[1]})
}

// select many records
const read_filter = {screw_type: ['Hex Bolts', 'Tag Bolts']}
const screws = await ScrewStock.read(read_filter)

// update one record
const upd_data = {stock: 1234}
const upd_filter = {screw_type: 'Tag Bolts'}
const upd_rows = await ScrewStock.update(upd_data, upd_filter)

// clean some records
const del_filter = {screw_type: 'Tag Bolts'}
const del_rows = await ScrewStock.delete(del_filter)
```


## API

### `await getConnection(configOrSelector, options)`

Initializes and returns a [connection object](#connection-object). 

Connections are cached. The first time you init the connection, you have to pass a [`config`](#config) object. But for further usages of the connection, you can take the cached connection just by passing a [`selector`](#selector).

#### `config` 

Contains the connection parameters (which depend on the database).

For `PostgreSQL`:

```js
  config= {
    dialect:  'postgres',
    host:     'localhost',
    port:     5432,
    database: 'calustra',
    user:     'postgres',
    password: 'postgres',
    // Maximum/Minimum number of connection in pool
    max: 5,
    min: 0,
    // The maximum time, in milliseconds, that a connection can be idle before being released. 
    // Use with combination of evict for proper working, for more details read 
    // https://github.com/coopernurse/node-pool/issues/178#issuecomment-327110870
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true
  }
```
For `SQLite`:

```js
  config={
    dialect:  'sqlite',
    filename: ':memory:',

    verbose:   true,
    
    // https://github.com/mapbox/node-sqlite3/wiki/Caching
    cached:    true,
    
    /*user:     'sqlite',
    password: 'sqlite'*/

    trace: undefined,
    profile: undefined,
    busyTimeout: undefined
  }
```

#### `selector`

It will be matched against the `config` object you had initialized the connection with. 

Given this, the most easy thing to do is to just specify the `database` as the selector if using PostgreSQL, or the `filename` if using SQLite. But that's up to you!

#### `options`

##### `log`

It can be a string with the log level (`silly`, `debug`, `info`, `warn`, `error`) or a class exposing methods named as those log levels.

Some examples:

```js
  options= {    
    log: 'debug'
  }
```

```js
class CustomLogger {
  _log(l, s) {
    console.log(`[${l}] ${s}`)
  }
  
  silly(s) { this.log('silly', s) }
  debug(s) { this.log('debug', s) }
  info(s)  { this.log('info', s) }
  warn(s)  { this.log('warn', s) }
  error(s) { this.log('error', s) }
}

const options= {    
    log: CustomLogger
}
```

##### `cache`
Options to be passed to [`cacheiro`](https://github.com/afialapis/cacheiro). Default cache type is `memory`.

If `false`, connections are not cached.

##### `reset`
If `true`, cached connections will be ignored. Connection will be re-created. Default is `false`.


##### `tables`

List of tables in the database which will be accessible trough [`getModel()`](#connectiongetmodeltablename). Each item in the list may be an `string` (the table name) or an object like this:

```js
{
  name: 'table_name',
  schema: 'public',
  useDateFields: {
    use: false,
    fieldNames: {
      created_at: 'created_at', 
      last_update_at: 'last_update_at'
    },
    now: () => intre_now()
  },
  
  checkBeforeDelete: [
    "another_table.field_id"
  ],
  
  triggers: {
    beforeRead   : <callback>,
    afterRead    : <callback>,
    beforeInsert : <callback>,
    afterInsert  : <callback>,
    beforeUpdate : <callback>,
    afterUpdate  : <callback>,
    beforeDelete : <callback>,
    afterDelete  : <callback>
  },
}
```

###### `table.checkBeforeDelete`

An array of db fields like `['table_one.field_two', 'table_three.field_one']`.

It is used to prevent unwanted deletions which are not covered by a SQL relation.

It only affects to deletions which are filtered by `id`. For example:

```js

const conn = await getConnection(config, {
  tables: [{
    name: 'screw_stock',
    checkBeforeDelete: ['screw_stats.screw_stock_id']
  }]
})

const ScrewStock = connection.getModel('screw_stock')

const del_filter = {id: 1}
const del_rows = await ScrewStock.delete(del_filter)

```

If some record exists in `screw_stats` table with `screw_stock_id= 1`, then
the `ScrewStock.delete` will fail.


###### `table.useDateFields`

`calustra` knows that a very extended approach is to have fields like
`created_at` or `last_update_at` in your tables. This option will help with that.

Here you can specify an object like this:

```js
import {intre_now} from 'intre'

const conn = await getConnection(config, {
  tables: [{
    name: 'screw_stock',
    useDateFields: {
      use: true,
      fieldNames: {
        created_at: 'created_at', 
        last_update_at: 'last_update_at'
      },
      now: () => intre_now()
    }
  }]
})
```

You can also simply specify a `boolean` value. If `true`, above defaults will be used.

As you can imagine, `calustra` will automatically update this fields after every insert
(`created_at` field) or update (`last_update_at` field).


###### `table.triggers`

Triggers are used to customize every query phase. A `trigger` is a function containing specific parameters
and returning specific array of values. Available ones are:

- `beforeInsert(conn params, options)` returns `[params, options, allow]`
- `afterInsert(conn id, params, options)` return `id`
- `beforeUpdate(conn params, filter, options)` returns `[params, filter, options, allow]`
- `afterUpdate(conn rows, params, filter, options)` returns `rows`
- `beforeDelete(conn filter, options)` returns `[filter, options, allow]`
- `afterDelete(conn rows, filter, options)` returns `rows`

You can use them to abort queries (`allow=false`), to customize `params` on the fly before
the query is executed, to customize the returning results, etc.


### Connection object

#### `async connection.select(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call
  - `silent_fail`: can be `true` (will return `undefined` as query results) or `false` (default, exception will be propagated).

Returns an array of objects with the result of the query.

#### `async connection.selectOne(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call
  - `omitWarning`: by default, if query returns more than one record, a logging warning is shown. If `omitWarning` is `true`, this warning is ignored.
  - `silent_fail`: can be `true` (will return `undefined` as query results) or `false` (default, exception will be propagated).

Returns an object with the result of the query.

#### `async connection.execute(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call
  - `silent_fail`: can be `true` (will return `undefined` as query results) or `false` (default, exception will be propagated).

Returns an array of objects with the result of the query.


#### `async connection.executeAndCount(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call

Returns an integer with the number of rows affected by the query.


#### `async connection.getTableNames(schema= 'public')`

Returns an array with the table names present in the specified database `schema`:

Notice the results of this method will be in-memory cached: so query runs just once per connection.


#### `async connection.getTableDetails(tableName, schema= 'public')`

Returns an object with the details of a database table definition, like:

```js
{
  'field_name': {
      type     : <type identifier>,
      key      : <bool>,
      nullable : <bool>,
      default  : <default value>   
  },...
}
```

Notice the results of this method will be in-memory cached: so query runs just once per connection and table.

#### `async connection.getModel(table_name, schema= 'public')`

- `table_name`: name of a table which was included on `options.tables` value.

Returns a [Model object](#model-object).


### Model object

In `calustra`, a Model object always refers to the database table; it never refers to a single record.

In other words: unlike other ORMs, you will not do `const model= Model.create(); model.fieldA= 'value'; model.save()`.
In `calustra` you will do `Model.insert({data})` or `Model.update({data}, {filter})`.

#### `model.insert(data, options)`

- `data`: an object with "what to insert". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra` transaction object

It returns an `int` with the `.id` of the newly created record.

#### `model.update(data, filter, options)`

- `data`: an object with "what to update". Fields that do not exist on Model definition will be discarded.
- `filter`: an object with "which records to update". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra` transaction object

It returns an `int` with the number of affected records by the update.

#### `model.delete(filter, options)`

- `filter`: an object with "which records to delete". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra` transaction object

It returns an `int` with the number of deleted records.

#### `model.read(filter, options)`

- `filter`: an object with "which records to read". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `fields`: a subset of table's field names to include on the result output
  - `sortby`: indicates wat field to sort by the read. It may be an `string` with the field's name 
              (sort will be `ASC`), or a two elements Array like `[field_name, ASC|DESC]`
  - `limit` and `offset`: to make paginated reads
  - `transaction`: an `calustra` transaction object

It returns an Array of objects, empty if no record was found with the specified filter.

#### `model.find(id, options)`

- `id`: an `int` with the `.id` to look for
- `options`: 
  - `transaction`: an `calustra` transaction object

It returns an object with the desired record, empty if none was found.

### Query tools

At `calustra/query` these are a small -yet powerful- set of utils over `SQL` queries.


#### `getTableNamesFromQuery (query)`

Returns an array of the table names involved in `query`.

#### `removeComments (query)`

Cleans comments from `query`.

#### `cleanAndInline (query)`

Cleans comments from `query`, also compacting it in a single line if multiline.

#### `queryMainAction (query)`

Checks what the main action of the `query` is, even for the hard ones.
Possible return values are: `create`, `alter`, `drop`, `insert`, `update`, `delete`, `select`.

#### `queryDescription (query, rows, time)`

Returns a human readable description of the `query`.

Examples:

- `Created table cars (time: <time>)`
- `Inserted <rows> rows into cars (time: <time>)`


### `formatQuery (qry, params)`

Clean and colorize a query with logging in mind.


## Notes


### Cached connections

Notice that `calustra` keeps a simple cache of connections once they are initialized. You can get them using `getConnection(selector)`:

```js
import {getConnection} from 'calustra'
const conn = await getConnection(`calustra`)
```

`selector` is just a string matching some part of the `config` you passed the first time to init the connection. 

Closing a connection destroys and uncaches it, but [closing connections](#closing-connections) must be done carefully:

```js
conn.close()
```

You can disable caching of a connection by specifying the option `cache: false`:

```js
const conn = await getConnection(config, {cache: false})
// connection will not be available later trough getConnection(selector)
```

When creating a connection, you may force to re-init it (and ignore previous cached connection, if any) 
by specifying the option `reset`:

```js
const conn = await getConnection(config, {reset: true})
// previous cached connection will be ignored and overwritten
```

### Closing connections

If you close a connection:

```js
connection.close()
```

notice that the database's pool will be removed, being no longer available. Even if recreating the [Connection object](#connection-object) you will get errors. 

So, use it with care!


## Changelog

See [changelog here](https://github.com/afialapis/calustra/blob/main/CHANGELOG.md)
