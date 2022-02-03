import defaults from "./defaults"
import { merge } from "../util"

class ModelConfig {

  constructor(db, tablename, definition, options) {
    this.db         = db
    this.tablename  = tablename
    this.definition = definition
    this.config     = {}

    this.config.triggers= options?.triggers || {}
    this.config.checkBeforeDelete= options?.checkBeforeDelete

    
    let useDates= merge(defaults.useDates)
    if (options?.useDates != undefined) {
      if (typeof options.useDates == 'object') {
        useDates= merge(defaults.useDates, options.useDates)
      } else if (typeof options.useDates == 'boolean') {
        useDates.use = options.useDates
      }
    }
    this.config.useDates= useDates
    
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

  get useDatesOn() {
    return this.config.useDates.use===true
  }

  get datesCreatedField() {
    if (this.useDatesOn) {
      return this.config.useDates.fieldnames.created_at
    }
    return undefined
  }

  get datesUpdatedField() {
    if (this.useDatesOn) {
      return this.config.useDates.fieldnames.last_update_at
    }
    return undefined
  }  
  
  getNow() {
    try {
      return this.config.useDates.now()
    } catch(e) {
      return undefined
    }
  }
}


export {ModelConfig}