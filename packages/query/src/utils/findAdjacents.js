import replaceAll from "./replaceAll"

function findAdjacents(str, keyword, ignore_words) {
  
  // 1 - str is previously parsed by cleandAndInline,
  //     so it is easy to be handled and we make some 
  //     assumptions here:
  //     - it has not comments
  //     - no consecutive spaces
  //     - no tabs or other special chars
  //     - single line
  //     - parenthesis are always surrounded by one space
  
  // 2- lets work only with lowercase
  let q = str.toLowerCase()
  let w = keyword.toLowerCase()
  let i = ignore_words!=undefined
    ? ignore_words.map(w => w.toLowerCase())
    : []
  
  // 3- clear constant references of the keyword
  //    for example "WHERE field = 'table'" => "WHERE field = ''"
  q= replaceAll(q, `'${w}'`, `''`)
  q= replaceAll(q, `"${w}"`, `""`)

  // 4- add an space to the keyword to be searched
  //    so we match '... TABLE ...' 
  //    but not '... FROM pragma_table_info ...', for example
  w+= ' '
  
  // 5- iterate appearances of keyword
  let adjacents = []
  while (q.indexOf(w) >= 0) {
    // substring starting on the keyword next appearance
    q= q.substr(q.indexOf(w) + w.length)
    // take the word next to this keyword
    let t
    try {
      t= q.split(' ')[0]
    } catch(e) {
      t= q
    }
    // ensure is a valid word
    if (t.length>0 && (i.indexOf(t)<0) && (adjacents.indexOf(t)<0) ) {
      adjacents.push(t)
    }
  }
  
  return adjacents
}


export default findAdjacents