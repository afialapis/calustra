import {getConnection} from 'calustra'

const getConnectionWrap = (connOrConfigOrSelector, options) => {

  const conn_options= {
    ...options,
    cache_fallback: false,
    cache_error_log: true
  }

  const connection= getConnection(connOrConfigOrSelector, conn_options)

  return connection
}

export default getConnectionWrap
