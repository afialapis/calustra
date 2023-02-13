import replaceAll from './utils/replaceAll.mjs'

function removeComments(query) {
  
  // remove commented lines
  let q = replaceAll(query, '\r\n', '\n')
  let lines= []
  q.split('\n').map(l => {
    if (! l.trim().indexOf('--')==0) {
      lines.push(l)
    }
  })
  return lines.join('\n')
}

export default removeComments