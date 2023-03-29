function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

/*

// This alternative would require the caller to care 
//  about escaping chars in <search> parameter

function replaceAll (string, search, replace) {
  const re = new RegExp(search, 'g')
  try {
    return string.replace(re, replace)
  } catch(e) {
    return string
  }
}


*/



export default replaceAll