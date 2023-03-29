import { gray, cyan, yellow, red } from 'tinguir'

const KEYWORDS = {
  'SELECT': gray,
  'UPDATE': cyan,
  'INSERT': yellow,
  'DELETE': red,
}

const format = (qry, params) => {
  let q = qry.replace('Executing (default):', '')
  q = q.replace('WITH rows as (', '')
  q = q.replace(') SELECT count(*) FROM rows', '')

  for (const kw in KEYWORDS)
    q = q.replace(new RegExp(kw, 'g'), KEYWORDS[kw](kw))

  let p = params != undefined ? `[${params.join(', ')}]` : ''

  return `${q} ${p}`
}

export default format

