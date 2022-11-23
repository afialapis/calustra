[![NPM Version](https://badge.fury.io/js/calustra.svg)](https://www.npmjs.com/package/calustra)
[![Dependency Status](https://david-dm.org/afialapis/calustra.svg)](https://david-dm.org/afialapis/calustra)
[![NPM Downloads](https://img.shields.io/npm/dm/calustra.svg?style=flat)](https://www.npmjs.com/package/calustra)

# Table of Contents

1. [Intro](#intro)
2. [Install](#install)
3. [Getting Started](#getting-started)
4. [Cached connections](#cached-connections)
5. [API](#api)
  - [`getConnection`](#getconnectionconfigorselector-options)
  - [Connection object](#connection-object)
6. [Notes](#notes)

# Intro

`calustra` is a database connector.

Currently, supported databases are:
- PostgreSQL (through [pg-promise](https://github.com/vitaly-t/pg-promise)). 
- SQLite (through [sqlite3](https://github.com/TryGhost/node-sqlite3)). 

We may add support for other databases (MySql, MsSql, ...) in the future... or may not.


# Install

```
npm install calustra [--save-dev]
```

# Getting Started

`calustra-conn` exposes just the method `getConnection` which returns a [Connection object](#connection-object).

```js
import {getConnection} from 'calustra-conn'

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
  log: 'debug'
}
const conn = getConnection(config, options)

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

```

# Cached connections

Notice that `calustra-conn` keeps a simple cache of connections once they are initialized. You can get them using `getConnection(selector)`:

```js
import {getConnection} from 'calustra-conn'
const conn = getConnection(`calustra`)
```

where selector is just a string matching some part of the `config` you passed the first time to init the connection. 


You can uncache a connection:
```js
conn.uncache()
```

Closing it also uncaches it, but [closing connections ](#closing-connections) must be done carefully:
```js
conn.close()
```

You can disable caching of a connection by specifying the option `nocache: true`:

```js
const conn = getConnection(config, {nocache: true})
// connection will not be available trough getConnection(selector)
```

# API

## `getConnection(configOrSelector, options)`

Initializes and returns a [connection object](#connection-object). 

Connections are cached. The first time you init the connection, you have to pass a [`config`](#config) object. But for further usages of the connection, you can take the cached connection just by passing a [`selector`](#selector).

### `config` 

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

### `selector`

It will be matched against the `config` object you had initialized the connection with. 

Given this, the most easy thing to do is to just specify the `database` as the selector if using PostgreSQL, or the `filename` if using SQLite. But that's up to you!

### `options`
- `log`: can be a string with the log level (`silly`, `debug`, `info`, `warn`, `error`) or a class exposing methods named as those log levels.
- `nocache`: if `true`, connections are not cached. Default is `false`.

Some examples:

```js
  options= {    
    log: 'debug',
    nocache: true
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



## Connection object

### `async connection.select(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call

Returns an array of objects with the result of the query.

### `async connection.selectOne(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call
  - `omitWarning`: by default, if query returns more than one record, a logging warning is shown. If `omitWarning` is `true`, this warning is ignored.

Returns an object with the result of the query.

### `async connection.execute(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call

Returns an array of objects with the result of the query.


### `async connection.executeAndCount(query, values, options)`

- `query`: string with SQL query. It may contain wildcards (`$1`, `$2`...) or (`?`, `?`...).
- `values`: array of values if query contains wildcards
- `options`:
  - `transaction`
  - `log`: if `false`, logging is disabled for this particular call

Returns an integer with the number of rows affected by the query.


### `async connection.getTableNames(schema= 'public')`

Returns an array with the table names present in the specified database `schema`:

Notice the results of this method will be in-memory cached: so query runs just once per connection.


### `async connection.getTableDetails(tableName, schema= 'public')`

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

# Notes

## Closing connections

If you close a connection:

```js
connection.close()
```

notice that the database's pool will be removed, being no longer available. Even if recreating the [Connection object](#connection-object) you will get errors. 

So, use it with care!
