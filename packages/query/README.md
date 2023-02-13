![Calustra logo](https://calustra-query.afialapis.com/logo.png)

[![NPM Version](https://badge.fury.io/js/calustra-query.svg)](https://www.npmjs.com/package/calustra-query)
[![NPM Downloads](https://img.shields.io/npm/dm/calustra-query.svg?style=flat)](https://www.npmjs.com/package/calustra-query)

# Intro

[`calustra-query`](https://calustra-query.afialapis.com) is a small -yet powerful- set of utils over `SQL` queries.

# Install

```
npm install calustra-query [--save-dev]
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
