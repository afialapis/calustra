import {json_to_query_string, trim_left} from './utils.mjs'

//function _is_browser() {
//  try {
//    return process.env.BROWSER==true
//  } catch(_) {
//    return false
//  }
//}

/**
 * Prepend host of API server
 */
 function _url_make(path) {
  if (path.indexOf('http')==0) {
    return path
  //} else if (_is_browser()) {
  //  return '/' + trim_left(path, '/')
  //} else {
  //  return `https://${location.host}/` + trim_left(path, '/')
  //}
  } else {
    return '/' + trim_left(path, '/')
  }
}

/**
 * Decide what to do with the response
 */
 function _response_handle(response) {
  if (response.redirected) {
    if (typeof window == 'object') {
      window.location.replace(response.url)
    }
    return Promise.resolve(response)
  }

  if (response.headers.get('content-type').indexOf('json') >= 0) {
    return response.json().then(res => {
      return {
        data: res,
        status: response.status
      }
    })
  }

  return response.text().then(text => { 
    return {
      data: text,
      status: response.status
    }
  })

}


/**
 * Build and execute remote request
 */
function calustra_fetch(method, url, params, isMultiForm, auth) {
  const requestURL = _url_make(url) + (method === 'GET' && params ? json_to_query_string(params) : '')
  let request = {
    method,
    mode: 'cors',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    }
  }
  
  if (auth) {
    request.headers['Authorization'] = 'Basic ' + Buffer.from(auth.username + ":" + auth.password).toString('base64')
  }

  if (method === 'POST') {
    if (isMultiForm) {
      const formData = new FormData()
      for(let name in params) {
        formData.append(name, params[name]);
      }
      request.body = formData
    } else {
      request.body = JSON.stringify(params || {}, (k, v) => v === undefined ? null : v)
    }
  }

  return fetch(requestURL, request).then(_response_handle)
}



export { calustra_fetch }
