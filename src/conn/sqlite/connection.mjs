/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "schema|tableName|^_" }]*/
import { DatabaseSync } from "node:sqlite"
import CalustraConnBase from "#conn-base/conn/connection.mjs"
import merge from "#conn-base/util/merge.mjs"
import defaults from "./defaults.mjs"
import CalustraModelSQLite from "./model.mjs"

class CalustraConnLT extends CalustraConnBase {
  get configDescription() {
    const c = this.config
    return `${c.dialect}: ${c.filename}`
  }

  openDb() {
    const config = merge(defaults, this.config || {})

    const dbOptions = {}
    const supportedOptions = [
      "readOnly",
      "enableForeignKeyConstraints",
      "enableDoubleQuotedStringLiterals",
      "allowExtension",
      "timeout"
    ]

    for (const opt of supportedOptions) {
      if (config[opt] !== undefined) {
        dbOptions[opt] = config[opt]
      }
    }

    if (dbOptions.timeout === undefined && config.busyTimeout !== undefined) {
      dbOptions.timeout = config.busyTimeout
    }

    const db = new DatabaseSync(config.filename, dbOptions)
    return db
  }

  openTransaction() {
    throw new Error(
      `[calustra][${this.connid}] CalustraConnLT: SQLite connections does not support transactions"`
    )
  }

  closeDb() {
    if (this.db?.isOpen) {
      this.db.close()
    }
  }

  _normalize_query_flags(query) {
    if (query.indexOf("$") >= 0) {
      query = query.replace(/\$(\d+)/g, "?$1")
    }
    return query
  }

  _normalize_param_value(value) {
    if (value === undefined) {
      return null
    }
    if (typeof value === "boolean") {
      return value ? 1 : 0
    }
    if (value instanceof Date) {
      return value.getTime()
    }
    return value
  }

  _normalize_values(values) {
    if (values === undefined || values === null) {
      return []
    }
    if (Array.isArray(values)) {
      return values.map((v) => this._normalize_param_value(v))
    }
    if (typeof values === "object" && !ArrayBuffer.isView(values) && !(values instanceof Date)) {
      const normalized = {}
      for (const [k, v] of Object.entries(values)) {
        normalized[k] = this._normalize_param_value(v)
      }
      return [normalized]
    }
    return [this._normalize_param_value(values)]
  }

  async execute(query, values, options) {
    const callback = () => {
      const cquery = this._normalize_query_flags(query)
      const stmt = this.db.prepare(cquery)
      return stmt.run(...this._normalize_values(values))
    }

    return this._execute(query, values, options, callback)
  }

  async executeAndCount(query, values, options) {
    const callback = () => {
      const cquery = this._normalize_query_flags(query)
      const stmt = this.db.prepare(cquery)
      const res = stmt.run(...this._normalize_values(values))
      return Number(res.changes)
    }

    return this._executeAndCount(query, values, options, callback)
  }

  async select(query, values, options) {
    const callback = () => {
      const cquery = this._normalize_query_flags(query)
      const stmt = this.db.prepare(cquery)
      const data = stmt.all(...this._normalize_values(values))
      return data.map((row) => ({ ...row }))
    }

    return this._select(query, values, options, callback)
  }

  // biome-ignore lint/correctness/noUnusedFunctionParameters: biome-ignore
  async getTableNamesFromDb(schema = "master") {
    const query = `SELECT name 
           FROM sqlite_schema 
          WHERE type = 'table' 
            AND name NOT LIKE 'sqlite_%'
        ORDER BY 1`

    const res = await this.select(query)

    const out = res.map((r) => r.name)

    return out
  }

  // biome-ignore lint/correctness/noUnusedFunctionParameters: biome-ignore
  async getTableDetailsFromDb(tableName, schema = "master") {
    const query = `   SELECT m.name as tableName, 
                 p.cid as number,
                 p.name as columnName,
                 p.type,
                 p.'notnull' as nulla,
                 p.dflt_value,
                 p.pk
            FROM sqlite_master m
 LEFT OUTER JOIN pragma_table_info((m.name)) p
              ON m.name <> p.name
            WHERE m.name = ?
        ORDER BY tableName, number`

    const res = await this.select(query, [tableName])

    const tableDef = {}

    res.forEach((r) => {
      const fieldName = r.columnName
      const fieldProps = {
        type: r.type_id,
        key: r.pk === 1,
        nullable: r.nulla !== 1,
        default: r.dflt_value
      }
      tableDef[fieldName] = fieldProps
    })

    return tableDef
  }

  initModel(options) {
    const model = new CalustraModelSQLite(this, options)
    return model
  }
}

export default CalustraConnLT
