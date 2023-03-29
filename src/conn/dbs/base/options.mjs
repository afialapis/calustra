class CalustraModelOptions {

  constructor(options) {
    this.options    = options
    this.definition = undefined // will be inited right before needed
  }

  get schema() {
    return this.options?.schema || 'public'
  }

  get name() {
    return this.options.name
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
    return this.options.useDateFields.use===true
  }

  get datesCreatedField() {
    if (this.useDateFieldsOn) {
      return this.options.useDateFields.fieldNames.created_at
    }
    return undefined
  }

  get datesUpdatedField() {
    if (this.useDateFieldsOn) {
      return this.options.useDateFields.fieldNames.last_update_at
    }
    return undefined
  }  
  
  getNow() {
    try {
      return this.options.useDateFields.now()
    } catch(e) {
      return undefined
    }
  }


  get triggers() {
    return this.options?.triggers || {}
  }  
}


export {CalustraModelOptions}