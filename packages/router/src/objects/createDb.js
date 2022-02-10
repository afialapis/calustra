"use strict";

import {getConnection} from 'calustra'
import isCalustraConn from '../util/isCalustraConn'

function createDb(dbOrConfig) {
  if (isCalustraConn(dbOrConfig)) {
    return dbOrConfig
  }

  const db= getConnection(dbOrConfig)
  return db
}

export {createDb}