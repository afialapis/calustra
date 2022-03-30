"use strict";

import {getConnection} from 'calustra'
import isCalustraConn from '../util/isCalustraConn'

function createConnection(connOrConfig) {
  if (isCalustraConn(connOrConfig)) {
    return connOrConfig
  }

  const connection= getConnection(connOrConfig)
  return connection
}

export default createConnection