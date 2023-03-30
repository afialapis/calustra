/**
 * Transform an JSON object to a query string
 */
export function json_to_query_string(params) {
  return '?' + Object.keys(params).map(k => {
    const name = encodeURIComponent(k)
    if (Array.isArray(params[k])) {
      return params[k].map(val => `${name}[]=${encodeURIComponent(val)}`).join('&')
    }
    return `${name}=${encodeURIComponent(params[k])}`
  }).join('&')
}

/**
 * Transform a query string to a JSON object
 */
export function jquery_string_to_json(url) {     
    let search= url.indexOf('?')>=0 ? url.substr(url.indexOf('?')) : '';
    if (search && search!='?') {
      let pairs = search.slice(1).split('&');
      
      let result = {};
      pairs.forEach(function(pair) {
          pair = pair.split('=');
          result[pair[0]] = decodeURIComponent(pair[1] || '');
      });
      return JSON.parse(JSON.stringify(result))
    }
    return {}
}


export function trim_left(str, what) {
  return str.replace(new RegExp(`^${what || '\\s'}+`), '')
}


export function omit_nil(obj) {
  if (typeof obj !== 'object') return obj
  return Object.keys(obj).reduce((acc, v) => {
    if (obj[v] !== undefined) acc[v] = obj[v]
    return acc
  }, {})
}
