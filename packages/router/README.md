![calustra-router logo](https://calustra.afialapis.com/assets/images/logo/calustra-router_name.png)

[![NPM Version](https://badge.fury.io/js/calustra-router.svg)](https://www.npmjs.com/package/calustra-router)
[![Dependency Status](https://david-dm.org/afialapis/calustra-router.svg)](https://david-dm.org/afialapis/calustra-router)
[![NPM Downloads](https://img.shields.io/npm/dm/calustra-router.svg?style=flat)](https://www.npmjs.com/package/calustra-router)

# Table of Contents

1. [Intro](#intro)
2. [Install](#install)
3. [Get started](#get-started)
4. [API](#api)

# Intro

[`calustra-router`](http://calustra.afialapis.com/) adds a [`koa-router`](https://github.com/koajs/router) Router to your [`Koa`](https://github.com/koajs/koa) app exposing a [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) API with endpoints for your database tables.

This API will consist on two kind of endpoint / methods:

- [crud](#optionscrud)
  · `GET` methods: `read`, `key_list`, `distinct`, `find`
  . `POST`methods: `save`, `update`, `delete`

- [queries](#optionsqueries): custom defined endpoints pointing to custom methods

Currently, supported databases are:
- PostgreSQL
- SQLite

Check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn) for more info.


# Install

```
npm install calustra-router [--save-dev]
```

# Get started

`calustra-router` main method is `calustraRouter`.

Here a simple server serving `calsutra-router` API on `/api` path:

```js
import Koa from 'koa'
import {calustraRouter} from 'calustra-router'

const config= {
  host:     'localhost',
  port:      5432,
  database: 'calustra-orm',
  user:     'postgres',
  password: 'postgres'
}

const options= {
  // calustra-conn options
  log: 'info',
  // router options
  crud: {
    prefix: '/api',
    routes: ['screw_stock'],
  }   
}


const router = await calustraRouter(config, options)

const app = new Koa()
app.use(router.routes())

const server= app.listen(3001, function () {
  console.log('Server is listening...')
})
```
API could be consumed like this:

```js
import fetch from 'node-fetch'

const url= `http://localhost:3000/api/screw_stock/read`
const response= await fetch(url)
let screw_data= await response.json()
```


# API

`calustra-router` has these use-approach (somehow `Koa` style) methods: 

- [`useCalustraDbContext`]()
- [`useCalustraRouter`]()
- [`useCalustraRouterAsync`]()

But each piece is also exposed:
- [`calustraRouter`](#calustrarouterconnorconfig-options).
- [`calustraRouterAll`](#async-calustrarouterallconnorconfig-options).
- [`getConnection`](#getconnectionconfigorselector-options) (from [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn))
- [`getModel`](#getmodelconnorconfigorselector-tablename-options) (from [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm))


## `useCalustraDbContext(app, config, options)`

- `app` is your `Koa` app.
- `config`  and `options` are used to initialize the database connection (or read a cached one). Check [`getConnection`](#getconnectionconfigorselector-options) below.

This methods extends the [`app.context`](https://github.com/koajs/koa/blob/master/docs/api/index.md#appcontext) with this:

```js
  app.context.db= {
    getConnection,
    getModel
  }
```

More on [`getConnection`](#getconnectionconfigorselector-options) and [`getModel`](#getmodelconnorconfigorselector-tablename-options) below.


## `useCalustraRouter(app, connOrConfig, config)`

- `app` is your `Koa` app.
- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [`getConnection`](#getconnectionconfigorselector-options) below.
- `options` is passed also to `calustra-conn`'s `getConnection(config, options)` method.

This methods creates a [`calustraRouter`](#calustrarouterconnorconfig-options) and attaches it to your `app`.

## `useCalustraRouterAsync(app, connOrConfig, config)`

- `app` is your `Koa` app.
- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [`getConnection`](#getconnectionconfigorselector-options) below.
- `options` is passed also to `calustra-conn`'s `getConnection(config, options)` method.

This methods creates a [`calustraRouterAll`](#async-calustrarouterallconnorconfig-options) and attaches it to your `app`.

## `calustraRouter(connOrConfig, options)`

- `connOrConfig` is used to initialize the database connection (or read a cached one). Check [`getConnection`](#getconnectionconfigorselector-options) below.
- `options` is passed also to `calustra-conn`'s `getConnection(config, options)` method.

### `options.schema`

By default is is `public`. Specifies which database's schema to work with.

### `options.crud`

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
              fieldnames: {
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
            },   

            // calustra-orm options

            useDateFields: {
              use: false,
              fieldnames: {
                created_at: 'created_at', 
                last_update_at: 'last_update_at'
              },
              now: () => 0 // epoch_now()
            },

            checkBeforeDelete: [
              "another_table.field_id"
            ],
            
            triggers: {
              beforeRead   : undefined,
              afterRead    : undefined,
              beforeInsert : undefined,
              afterInsert  : undefined,

              beforeUpdate : undefined,
              afterUpdate  : undefined,

              beforeDelete : undefined,
              afterDelete  : undefined
            }
          }
        }      
  } 
  
```

### `options.queries`

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

### `options.bodyField`


  bodyField: 'result',

### `options.getUserId`

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

## `async calustraRouterAll(connOrConfig, options)`

Same as [`calustraRouter`](#calustrarouterconnorconfig-options), but:
- `options.crud.queries` must be `*` (every table)
- due to this necessary database access (to read tables info), function is `async`

## `getConnection(configOrSelector, options)`

Check [calustra-conn](https://github.com/afialapis/calustra/tree/main/packages/conn#getconnectionconfigorselector-options) for more info about connections.

## `getModel(connOrConfigOrSelector, tableName, options)`

Check [calustra-orm](https://github.com/afialapis/calustra/tree/main/packages/orm#getmodelconnorconfigorselector-tablename-options) for more info about model s.

