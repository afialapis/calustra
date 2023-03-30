

import {calustra_fetch} from './fetch.mjs'
import {omit_nil} from './utils.mjs'


class Fetcher {

  log_error = (msg, e) => {
    console.error(msg)
    console.error(e)
  }

  async get(url, params) {
    /* eslint no-unused-vars:0 */
    try {
      const resp = await calustra_fetch('GET', url, omit_nil(params))
      return resp
    } catch(e) {
      this.log_error(`Error on GET ${url}`, e)  
      return {
        data: undefined,
        status: -1
      }
    }
  }

  async post(url, data) {
    try {
      const resp = await calustra_fetch('POST', url, data, false)
      return resp
    } catch(e) {
      this.log_error(`Error on POST ${url}`, e)  
      return {
        data: undefined,
        status: -1
      }
    }
  }  

  async read(url, params) {
    const result = await this.get(`${url}/read`, params)
    return result.data
  }

  async key_list(url, params) {
    const result = await this.get(`${url}/key_list`, params)
    return result.data
  }  

  async name_list(url, params) {
    const result = await this.key_list(url, params)
    return Object.values(result)
  }

  async find(url, id) {
    const result = await this.get(`${url}/find`, { id: id })
    return result.data
  }

  async distinct(url, field, params) {
    const nparams= {
      ...params,
      distinct_field: field
    }
    const result = await this.get(`${url}/distinct`, nparams)
    return result.data   
  }

  async upsave(url, data) {
    let result
    if (data.id == undefined) {
      delete data.id
      result= await this.post(`${url}/save`, data)
    } else {
      result= await this.post(`${url}/update`, data)
    }
    
    return result.data
  }  

  async remove(url, id) {
    const data = { id: id }
    const result = await this.post(`${url}/delete`, data)
    return result.data
  }
}

Fetcher.keyList= Fetcher.key_list
Fetcher.nameList= Fetcher.name_list

export { Fetcher }
