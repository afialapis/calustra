import {epoch_now} from 'intre'
import merge from "./util/merge"

/*
const CONN_DB_POSTGRES_DEF = {
  dialect:  'postgres',
  host:     'localhost',
  port:     5432,
  database: 'calustra',
  user:     'postgres',
  password: 'postgres'
}

const CONN_DB_SQLITE_DEF = {
  dialect:  'sqlite',
  filename: ':memory:',
  verbose: true,
  cached: true
}
*/


const CONN_OPTIONS_DEF= {
  log: 'warn',
  cache_fallback: false,
  cache_error_log: true  
}

const TABLE_DEF= {
  name: '',
  schema: 'public',
  useDateFields: {
    use: false,
    fieldnames: {
      created_at: 'created_at', 
      last_update_at: 'last_update_at'
    },
    now: () => epoch_now()
  },
  /*
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
  },
  */  
}

const getConnectionConfig = (config) => {

  const db= config?.connection?.database || config?.connection?.db || config?.conn?.database || config?.conn?.db

  if (! db?.dialect) {
    console.error('[calustra-orm] Cannot get connection config from:')
    console.error(config)
    throw `[calustra-orm] Cannot get connection config`
  }

  const options= {
    ... CONN_OPTIONS_DEF,
    ... config?.options || {}
  }
  
  return {
    database: db,
    options
  }

}

const getModelConfig = (tableName, config) => {

  let model_config= {}

  for (const t of config?.tables || []) {
    if (t===tableName) {
      model_config= {
        name: tableName
      }
    } else if (t?.name===tableName) {
      model_config= {...t}
    } else {
      // throw `[calustra-orm] Cannot get model config for table ${tableName}`
      model_config= {
        name: tableName
      }      
    }
  }

  let useDateFields= merge(TABLE_DEF.useDateFields)
  if (model_config?.useDateFields != undefined) {
    if (typeof model_config.useDateFields == 'object') {
      useDateFields= merge(TABLE_DEF.useDateFields, model_config.useDateFields)
    } else if (typeof model_config.useDateFields == 'boolean') {
      useDateFields.use = model_config.useDateFields
    }
  }

  let merged = {
    name: model_config.name,
    schema: model_config?.schema || TABLE_DEF?.schema,
    triggers: model_config?.triggers || {},
    checkBeforeDelete: model_config?.checkBeforeDelete || false,
    useDateFields
  }

  return merged
}


export {getConnectionConfig, getModelConfig}