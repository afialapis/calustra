![CalustraOrm logo](https://calustra.afialapis.com/assets/images/logo/calustra-orm_name.png)

[![NPM Version](https://badge.fury.io/js/calustra-orm.svg)](https://www.npmjs.com/package/calustra-orm)
[![Dependency Status](https://david-dm.org/afialapis/calustra-orm.svg)](https://david-dm.org/afialapis/calustra-orm)
[![NPM Downloads](https://img.shields.io/npm/dm/calustra-orm.svg?style=flat)](https://www.npmjs.com/package/calustra-orm)

# Table of Contents

1. [Intro](#intro)
2. [Install](#install)
3. [Get started](#get-started)
4. [API](#api)
5. [ToDo](#todo)


# Intro

[`calustra-orm`](http://calustra.afialapis.com/) is a small, minimalist ORM, for those out there who still feel good typing some raw SQL.

What it does:

  - Basic ORM-models-like usage
  - CRUD operations out of the box
  - Async/await operations
  - Transactions support

What it does not do:

  - Query builder: 
    - apart from the aforementioned CRUD stuff, you'll use raw SQL for any other query
  - Table relations: 
    - it does not care about relations between tables. 
    - it does not provide methods like `FatherModel.getChildrens()`
    - you can still do something about it using `custom triggers`.

[comment]: # (You can read about our motivations **HERE**)

Currently, supported databases are:
- PostgreSQL
- SQLite
(check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn) for more info).



# Install

```
npm install calustra-orm [--save-dev]
```

# Get started

`calustra-orm` main method is `getModel`.


```js
import {getModel} from 'calustra-orm'

const config= {
  host:     'localhost',
  port:      5432,
  database: 'calustra-orm',
  user:     'postgres',
  password: 'postgres'
}

const options= {
  log: 'info'
}

//
// todos is a table like:
//  --------------------------------
//   id           serial,
//   screw_type   TEXT NOT NULL,
//   stock        INT
//  --------------------------------
//
const ScrewStock = getModel(config, 'screw_stock', options)


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
  await TestModel.insert(d)
}

// select many records
const read_filter = {screw_type: ['Hex Bolts', 'Tag Bolts']}
const screws = await TestModel.read(read_filter)

// update one record
const upd_data = {stock: 1234}
const upd_filter = {screw_type: 'Tag Bolts'}
const upd_rows = await TestModel.update(upd_data, upd_filter)


// clean some records
const del_filter = {screw_type: 'Tag Bolts'}
const del_rows = await TestModel.delete(del_filter)

```



# API

`calustra-orm` exposes three methods: 
- `getConnection` (from [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn))
- [`getModel`](#getmodelconnorconfigorselector-tablename-options).
- [`initModelCache`](#initmodelcacheconnorconfigorselector-options-tablelist).

## getConnection(configOrSelector, options)

Check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn#getconnectionconfigorselector-options) for more info about connections.


## getModel(connOrConfigOrSelector, tableName, options)

To instantiate a Model, we will just do: `getModel(connOrConfigOrSelector, options)`.

In `calustra-orm`, a Model instance always refers to the database table; it never refers to a single record.

In other words: unlike other ORMs, you will not do `const model= Model.create(); model.fieldA= 'value'; model.save()`.
In `calustra-orm` you will do `Model.insert({data})` or `Model.update({data}, {filter})`.

### connOrConfigOrSelector

`connOrConfigOrSelector` can be:
- a connection object returned by `getConnection`
- a configuration object (which internally will be used to call `getConnection` and init the connection)
- a selector string to retrieved some cached, already initialized, connection
Check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn#getconnectionconfigorselector-options) for more info about connections.

### tableName

Just the database table name to be referenced by the Model object.

### options

This same `options` will be passed to `getConnection(... options)`. So it may contain also `options` for the connection.
Check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn#options).

#### options.checkBeforeDelete

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
const del_rows = await TestModel.delete(del_filter)

```

If some record exists in `screw_stats` table with `screw_stock_id= 1`, then
the `TestModel.delete` will fail.


#### options.useDateFields

`calustra-orm` knows that a very extended approach is to have fields like
`created_at` or `last_update_at` in your tables. This option will help with that.

Here you can specify an object like this:

```js
  import {epoch_now} from 'intre'

  const useDateFields= {
    use: true,
    fieldnames: {
      created_at: 'created_at', 
      last_update_at: 'last_update_at'
    },
    now: () => epoch_now()
  },
```

You can also simply specify a `boolean` value. If `true`, above defaults will be used.

As you can imagine, `calustra-orm` will automatically update this fields after every insert
(`created_at` field) or update (`last_update_at` field).


#### options.triggers

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

## Cached models

Once a model was first initialized using `getModel(connOrConfigOrSelector, tableName, options)`, `calustra-orm` will keep it in a memory cache.

So, further calls to `getModel()` (with same params) will retrieve the model from the cache, instead of re-instantiate it and saving some cpu time and some database query.

Notice that `options` will be important here too. Check below example, where we will create two different Model instances:

```js
import {getModel} from 'calustra-orm'

const config= {
  host:     'localhost',
  port:      5432,
  database: 'calustra-orm',
  user:     'postgres',
  password: 'postgres'
}

const options_1= {
  log: 'info'
}

const options_2= {
  log: 'info',
  useDateFields: true,
  checkBeforeDelete: ['screw_stats.screw_stock_id']
}

const options_3= {
  log: 'warn'
}


const ScrewStock_1 = getModel(config, 'screw_stock', options_1)

// This second call instantiates a different model
// Having different `options` means having a different behavior, so,
//  we need a different model instance
const ScrewStock_2 = getModel(config, 'screw_stock', options_2)

// This one instead will return the cached ScrewStock_1 instance
// In this case, the differences in `options` does not affect the model behaviour
const ScrewStock_3 = getModel(config, 'screw_stock', options_3)

```

## initModelCache(connOrConfigOrSelector, options, tableList= [])

You will probably like to init a set of models when your app starts. Also as a safety check: if something fails, it may mean some problem on the database. This method is for that.

```js

import {initModelCache} from 'calustra-orm`


const config= {
  host:     'localhost',
  port:      5432,
  database: 'calustra-orm',
  user:     'postgres',
  password: 'postgres'
}

const options= {
  log: 'info',
  useDateFields: true
}

// You can specify some list of tables
await initModelCache(config, options, ['screw_stats', 'screw_stock'])

// Or let calustra just init models for every table
await initModelCache(config, options)
```

## Model object

### model.insert(data, options)

- `data`: an object with "what to insert". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an `int` with the `.id` of the newly created record.

### model.update(data, filter, options)

- `data`: an object with "what to update". Fields that do not exist on Model definition will be discarded.
- `filter`: an object with "which records to update". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an `int` with the number of affected records by the update.

### model.delete(filter, options)

- `filter`: an object with "which recors to delete". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an `int` with the number of deleted records.


### model.read(filter, options)

- `filter`: an object with "which recors to read". Fields that do not exist on Model definition will be discarded.
- `options`: 
  - `fields`: a subset of table's field names to include on the result output
  - `sortby`: indicates wat field to sort by the read. It may be an `string` with the field's name 
              (sort will be `ASC`), or a two elements Array like `[field_name, ASC|DESC]`
  - `limit` and `offset`: to make paginated reads
  - `transaction`: an `calustra-orm` transaction object

It returns an Array of objects, empty if no record was found with the specified filter.



### model.find(id, options)

- `id`: an `int` with the `.id` to look for
- `options`: 
  - `transaction`: an `calustra-orm` transaction object

It returns an object with the desired record, empty if none was found.



# Todo

- Transaction creation out of the box
