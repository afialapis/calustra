import replaceAll from './utils/replaceAll.mjs'
import removeComments from './removeComments.mjs'

function cleandAndInline(query) {
  // remove commented lines
  let q = removeComments(query)
  // inline
  q= replaceAll(q, '\n', ' ')
  // tabspaces to spaces
  q = replaceAll(q, '\t', ' ')
  // isolate parenthesis
  q = replaceAll(q, '(', ' ( ')
  q = replaceAll(q, ')', ' ) ')
  // singularize spaces
  while (q.indexOf('  ')>=0) {
    q= replaceAll(q, '  ', ' ')
  }
  return q
}

export default cleandAndInline
  
