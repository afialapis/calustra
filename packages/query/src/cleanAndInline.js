import replaceAll from './utils/replaceAll'
import removeComments from './removeComments'

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
  
