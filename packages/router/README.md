![Calustra logo](https://calustra-router.afialapis.com/logo.png)

[![NPM Version](https://badge.fury.io/js/calustra-router.svg)](https://www.npmjs.com/package/calustra-router)
[![NPM Downloads](https://img.shields.io/npm/dm/calustra-router.svg?style=flat)](https://www.npmjs.com/package/calustra-router)

# Intro

[`calustra-router`](http://calustra-router.afialapis.com/) adds a [`koa-router`](https://github.com/koajs/router) Router to your [`Koa`](https://github.com/koajs/koa) app exposing a [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) API with endpoints for your database tables.

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

`calustra-router` has these use-approach (somehow `Koa` style) methods: 

- [`initCalustraDbContext`](#usecalustradbcontextapp-connorconfig)
- [`initCalustraRouter`](#usecalustrarouterapp-connorconfig-routes)
- [`initCalustraRouterForAllTables`](#async-usecalustrarouterforalltablesapp-connorconfig-schema-public)

But each piece is also exposed:
- [`calustraRouter`](#calustrarouterconnorconfig-routes).
- [`initCalustraRouterForAllTables`](#async-calustrarouterforalltablesconnorconfig-prefix--schema-public).
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
