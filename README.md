
![Calustra logo](https://calustra-query.afialapis.com/logo.png)

# Intro

`calustra` is composed of:

- [`calustra-query`](https://github.com/afialapis/calustra/tree/main/packages/query): is a small -yet powerful- set of utils over `SQL` queries.
- [`calustra-conn`](https://github.com/afialapis/calustra/tree/main/packages/conn): a database connector
- [`calustra-orm`](https://github.com/afialapis/calustra/tree/main/packages/orm): a small, minimalist ORM, for those out there who still feel good typing some raw SQL
- [`calustra-router`](https://github.com/afialapis/calustra/tree/main/packages/router): adds a [`koa-router`](https://github.com/koajs/router) Router to your [`Koa`](https://github.com/koajs/koa) app exposing a [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) API with endpoints for your database tables.








# Intro

[`calustra-conn`](https://calustra-conn.afialapis.com) is a database connector.

Currently, supported databases are:
- PostgreSQL (through [pg-promise](https://github.com/vitaly-t/pg-promise)). 
- SQLite (through [sqlite3](https://github.com/TryGhost/node-sqlite3)). 

We may add support for other databases (MySql, MsSql, ...) in the future... or may not.


# Install

```
npm install calustra
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

Closing it also uncaches it, but [closing connections](#closing-connections) must be done carefully:

```js
conn.close()
```

You can disable caching of a connection by specifying the option `nocache`:

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










# Intro

[`calustra-orm`](http://calustra-orm.afialapis.com/) is a small, minimalist ORM, for those out there who still feel good typing some raw SQL.

What it does:

- Basic ORM-models-like usage
- CRUD operations out of the box
- Async/await operations
- Transactions support
- Automatically maintain date fields or make some extra check
- Supports [Triggers](#tabletriggers)

What it does not do:

  - Query builder: 
    - apart from the aforementioned CRUD stuff, you'll use raw SQL for any other query
  - Table relations: 
    - it does not care about relations between tables. 
    - it does not provide methods like `FatherModel.getChildren()`

[comment]: # (You can read about our motivations **HERE**)


Currently, supported databases are:

- PostgreSQL
- SQLite

Check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn) for more info.


# Install

```
npm install calustra-orm
```

# Get started

`calustra-orm` exposes just the method [`getConnection`](#getconnectionoptions). It is built on top of [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn#connection-object). It returns an extended [connection object](#connection-object), providing a special addendum: [`connection.getModel(tableName)`](#connectiongetmodeltablename).


```js
import {getConnection} from 'calustra-orm'

const config= {
  connection: {
    database= {
      host:     'localhost',
      port:      5432,
      database: 'calustra-orm',
      user:     'postgres',
      password: 'postgres'
    },
    options= {
      log: 'info'
    }
  },
  tables: [
    'screw_stock'
  ]
}

const connection = getConnection(config)

//
// screw_stock is a table like:
//  --------------------------------
//   id           serial,
//   screw_type   TEXT NOT NULL,
//   stock        INT
//  --------------------------------
//
const ScrewStock = connection.getModel('screw_stock')


// fill table
const data = [
  {screw_type: 'Wood Screws', stock: 1034},
  {screw_type: 'Machine Screws', stock: 3545},
  {screw_type: 'Thread Cutting Machine Screws', stock: 466},
  {screw_type: 'Sheet Metal Screws', stock: 6436},
  {screw_type: 'Self Drilling Screws', stock: 265},
  {screw_type: 'Hex Bolts', stock: 3653},
  {screw_type: 'Carriage Bolts', stock: 63},
  {screw_type: 'Tag Bolts', stock: 57}
]

for (const d of data) {
  await ScrewStock.insert(d)
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


# API

## `getConnection(options)`

Prepares and returns a [Connection object](#connection-object).


### `options.connection`

Contains the `database` config and its `options`. These both parameters are passed to [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn#getconnectionconfigorselector-options).

### `options.tables`

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
    now: () => epoch_now()
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


#### `table.checkBeforeDelete`

An array of db fields like `['table.field', 'table.field']`.

It is used to prevent unwanted deletions which are not covered by a SQL relation.

It only affects to deletions which are filtered by `id`. For example:

```js
import {getModel} from 'calustra-orm'
const ScrewStock = getModel(
  config, 
  'screw_stock',
  {checkBeforeDelete: ['screw_stats.screw_stock_id']}
  )

const del_filter = {id: 1}
const del_rows = await ScrewStock.delete(del_filter)

```

If some record exists in `screw_stats` table with `screw_stock_id= 1`, then
the `ScrewStock.delete` will fail.


#### `table.useDateFields`

`calustra-orm` knows that a very extended approach is to have fields like
`created_at` or `last_update_at` in your tables. This option will help with that.

Here you can specify an object like this:

```js
  import {epoch_now} from 'intre'

  const useDateFields= {
    use: true,
    fieldNames: {
      created_at: 'created_at', 
      last_update_at: 'last_update_at'
    },
    now: () => epoch_now()
  },
```

You can also simply specify a `boolean` value. If `true`, above defaults will be used.

As you can imagine, `calustra-orm` will automatically update this fields after every insert
(`created_at` field) or update (`last_update_at` field).


#### `table.triggers`

Triggers are used to customize every query phase. A Trigger is a function containing specific parameters
and returning specific array of values. Available ones are:

- `beforeInsert(conn params, options)` returns `[params, options, allow]`
- `afterInsert(conn id, params, options)` return `id`
- `beforeUpdate(conn params, filter, options)` returns `[params, filter, options, allow]`
- `afterUpdate(conn rows, params, filter, options)` returns `rows`
- `beforeDelete(conn filter, options)` returns `[filter, options, allow]`
- `afterDelete(conn rows, filter, options)` returns `rows`

You can use them to abort queries (`allow=false`), to customize `params` on the fly before
the query is executed, to customize the returning results, etc.


## Connection object

Returns the same [Connection object](https://github.com/afialapis/calustra/tree/main/packages/conn#connection-object) as in  [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn).

But this object is extended with the `getModel(tableName)` method, which returns a [Model object](#model-object).


### `connection.getModel(tableName)`

To instantiate a Model, we will just do: `const TableModel= connection.getModel(tableName)`.

This Model object will apply the table-related config we have passed at [`getConnection`](#getconnectionoptions).

## Model object

In `calustra-orm`, a Model object always refers to the database table; it never refers to a single record.

In other words: unlike other ORMs, you will not do `const model= Model.create(); model.fieldA= 'value'; model.save()`.
In `calustra-orm` you will do `Model.insert({data})` or `Model.update({data}, {filter})`.

#### `model.insert(data, options)`

- `data`: an object with "what to insert". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an `int` with the `.id` of the newly created record.

#### `model.update(data, filter, options)`

- `data`: an object with "what to update". Fields that do not exist on Model definition will be discarded.
- `filter`: an object with "which records to update". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an `int` with the number of affected records by the update.

#### `model.delete(filter, options)`

- `filter`: an object with "which records to delete". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an `int` with the number of deleted records.


#### `model.read(filter, options)`

- `filter`: an object with "which records to read". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `fields`: a subset of table's field names to include on the result output
  - `sortby`: indicates wat field to sort by the read. It may be an `string` with the field's name 
              (sort will be `ASC`), or a two elements Array like `[field_name, ASC|DESC]`
  - `limit` and `offset`: to make paginated reads
  - `transaction`: an `calustra-orm` transaction object

It returns an Array of objects, empty if no record was found with the specified filter.



#### `model.find(id, options)`

- `id`: an `int` with the `.id` to look for
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an object with the desired record, empty if none was found.



# Todo

- Transaction creation out of the box

























# Intro

[`calustra-router`](http://calustra-router.afialapis.com/) adds a [`koa-router`](https://github.com/koajs/router) Router to your [`Koa`](https://github.com/koajs/koa) app exposing a [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) API with endpoints for your database tables.

This API will consist on two kind of endpoint / methods:

- [crud](#optionscrud)
  - `GET` methods: `read`, `key_list`, `distinct`, `find`
  - `POST`methods: `save`, `update`, `delete`

- [queries](#optionsqueries): custom defined endpoints pointing to custom methods

Currently, supported databases are:

- PostgreSQL
- SQLite

Check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn) for more info.


# Install

```
npm install calustra-router
```

# Get started

Here a simple server serving `calustra-router` API on `/api` path:

```js
import Koa from 'koa'
import {initCalustraRouter} from 'calustra-router'

const connConfig= {
  connection: {
    database: {
      host:     'localhost',
      port:      5432,
      database: 'calustra-orm',
      user:     'postgres',
      password: 'postgres'
    },
    options: {
      log: 'info',
    },
  },
  tables: ['screw_stock']
}

const routesConfig= {
  // router options
  crud: {
    prefix: '/api',
    routes: ['screw_stock'],
  }   
}

const app = new Koa()

initCalustraRouter(app, connConfig, routesConfig)

const server= app.listen(3000, function () {
  console.log('Server is listening...')
})
```

Given previous server, API could be consumed like this:

```js
import fetch from 'node-fetch'

const url= `http://localhost:3000/api/screw_stock/read`
const response= await fetch(url)
let screw_data= await response.json()
```


# API

`calustra-router` has these init methods: 

- [`initCalustraDbContext`](#initcalustradbcontextapp-connorconfig)
- [`initCalustraRouter`](#initcalustrarouterapp-connorconfig-routes)
- [`initCalustraRouterForAllTables`](#async-initcalustrarouterforalltablesapp-connorconfig-schema-public)

But each piece is also exposed:

- [`calustraRouter`](#calustrarouterconnorconfig-routes).
- [`calustraRouterForAllTables`](#async-calustrarouterforalltablesconnorconfig-prefix--schema-public).
- `getConnection` from [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm#getconnectionoptions)


## `initCalustraDbContext(app, connOrConfig)`

- `app` is your `Koa` app.
- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm#getconnectionoptions)

This methods extends the [`app.context`](https://github.com/koajs/koa/blob/master/docs/api/index.md#appcontext) with this:

```js
  app.context.db= {
    getConnection,
    getModel
  }
```

## `initCalustraRouter(app, connOrConfig, routes)`

- `app` is your `Koa` app.
- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm#getconnectionoptions)
- [`routes`](#routes-config)

This methods creates a [`calustraRouter`](#calustrarouterconnorconfig-routes) and attaches it to your `app`.


## `calustraRouter(connOrConfig, routes)`

- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm#getconnectionoptions)
- [`routes`](#routes-config)

Creates a [`koa-router`](https://github.com/koajs/router) Router, and attached to it a series of endpoints depending on your [`routes`](#routes-config).


## `routes` config

Is an object like this:

```js
{
  crud: {... crud config ...},
  queries: {...queries config...},
  {...custom options...}
}
```

Custom options `schema`, `bodyField`, `getUserId` and `authUser` can be specified at any scope. For example:

```js
{
  getUserId: (ctx) => { return -1 }
  crud: {
    prefix: '/api',
    getUserId: (ctx) => { return 0 }
    routes: [
      {
        name: 'screw_stock',
        getUserId: (ctx) => { return 1 }
      }
    ]
  }
}

```


### `routes.crud`

```js

  {
    prefix: '/crud,
    routes: 
      // Can be:
      '*' // => autodetect and create routes for every table on the database
      // or
      // an array of tables config, where each config can be:
      // - a simple string with the table name
      // - an object like this:
        {
          name: "table_name",
          schema: "public", // optional
          url: "custom/url",

          options: {

            mode: 'r', // 'r' / 'rw' / 'ru' (read+update but not delete) / 'w' / 'u'

            useUserFields: {
              use: false,
              fieldNames: {
                created_by: 'created_by', 
                last_update_by: 'last_update_by'
              },
            },

            getUserId: (ctx) => {
              let uid= ctx.headers['user-id']
              if (uid!=undefined) {
                return uid
              }
              return undefined
            },

            authUser: {
              require: false,     // true / false / 'read-only'
              action: 'redirect', // 'error'
              redirect_url: '/',
              error_code: 401
            }
          }
        }      
  } 
  
```

### `routes.queries`

```js
  {
    prefix: '/queries',
    routes: [
      // List of objects like
      {
        url: '/screw_stock/fake',
        method: 'POST',
        callback: (ctx) => {},
        authUser: {
          require: true,
          action: 'redirect',
          redirect_url: '/'
        },  
      }
    ]
  }

```

### `routes.schema`

By default is is `public`. Specifies which database's schema to work with.

### `routes.bodyField`

By default  it is `undefined`, which means that [`queries`](#routesqueries) callbacks will return data on the `ctx.body` directly.
If you pass son value, for example `result`, then data will be:

```js
// ctx.body
{
  result: {...thedata}
}
``` 


### `routes.getUserId`

A callback receiving one param `ctx` and returning the logged in user id -if any-.

```js
  {
    getUserId: (ctx) => {
      let uid= ctx.headers['user-id']
      if (uid!=undefined) {
        return uid
      }
      return undefined
    }
  }
```

### `options.authUser`

```js
  {
    authUser: {
      require: false,     // true / false / 'read-only'
      action: 'redirect', // 'error'
      redirect_url: '/',
      error_code: 401
    }
  }

```


## `async initCalustraRouterForAllTables(app, connOrConfig, schema= 'public')`

- `app` is your `Koa` app.
- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm#getconnectionoptions)

This methods creates a [`calustraRouterForAllTables`](#async-calustrarouterforalltablesconnorconfig-prefix--schema-public) and attaches it to your `app`.


## `async calustraRouterForAllTables(connOrConfig, prefix= '', schema= 'public')`

- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm#getconnectionoptions)


Creates a [`koa-router`](https://github.com/koajs/router) Router, and attached to it [crud routes](#routescrud) for every table in the database.











# Intro

[`calustra-query`](https://calustra-query.afialapis.com) is a small -yet powerful- set of utils over `SQL` queries.

# Install

```
npm install calustra-query
```

# API

## `getTableNamesFromQuery (query)`

Returns an array of the table names involved in `query`.

## `removeComments (query)`

Cleans comments from `query`.

## `cleanAndInline (query)`

Cleans comments from `query`, also compacting it in a single line if multiline.

## `queryMainAction (query)`

Checks what the main action of the `query` is, even for the hard ones.
Possible return values are: `create`, `alter`, `drop`, `insert`, `update`, `delete`, `select`.

## `queryDescription (query, rows, time)`

Returns a human readable description of the `query`.

Examples:

- `Created table cars (time: <time>)`
- `Inserted <rows> rows into cars (time: <time>)`


## `formatQuery (qry, params)`

Clean and colorize a query with logging in mind.




