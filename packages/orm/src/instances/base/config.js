class CalustraModelConfig {

  constructor(connection, modelConfig) {
    this.connection = connection
    this.config     = modelConfig
    this.definition = undefined // will be inited right before needed
  }

  async loadDefinition() {
    if (this.definition == undefined) {
      this.definition= await this.connection.getTableDetails(this.name, this.schema)
    }
  }

  get schema() {
    return this.config?.schema || 'public'
  }

  get name() {
    return this.config.name
  }

  get fields() {
    return Object.keys(this.definition)
  }

  ensureDefs(data) {
    if (! data) {
      return 
    }
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


export {CalustraModelConfig}