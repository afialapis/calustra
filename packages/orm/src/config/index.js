import defaults from "./defaults"
import { merge } from "../util"

class ModelConfig {

  constructor(db, tablename, definition, options) {
    this.db         = db
    this.tablename  = tablename
    this.definition = definition
    this.config     = {}

    this.config.triggers= options?.triggers || {}
    this.config.checkBeforeDelete= options?.checkBeforeDelete || false

    
    let useDateFields= merge(defaults.useDateFields)
    if (options?.useDateFields != undefined) {
      if (typeof options.useDateFields == 'object') {
        useDateFields= merge(defaults.useDateFields, options.useDateFields)
      } else if (typeof options.useDateFields == 'boolean') {
        useDateFields.use = options.useDateFields
      }
    }
    this.config.useDateFields= useDateFields
    
  }

  get fields() {
    return Object.keys(this.definition)
  }

  ensureDefs(data) {
    data.map((record) => {
      this.fields.map((fld) => {
        if (record[fld]===null) {
          const fdef= this.definition[fld]
          if (Object.prototype.hasOwnProperty.call(fdef, 'default')) {
            record[fld]= fdef.default
          }
        }
      })
    })
  }

  get useDateFieldsOn() {
    return this.config.useDateFields.use===true
  }

  get datesCreatedField() {
    if (this.useDateFieldsOn) {
      return this.config.useDateFields.fieldnames.created_at
    }
    return undefined
  }

  get datesUpdatedField() {
    if (this.useDateFieldsOn) {
      return this.config.useDateFields.fieldnames.last_update_at
    }
    return undefined
  }  
  
  getNow() {
    try {
      return this.config.useDateFields.now()
    } catch(e) {
      return undefined
    }
  }
}


export {ModelConfig}