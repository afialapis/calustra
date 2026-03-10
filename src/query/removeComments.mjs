import replaceAll from "./utils/replaceAll.mjs"

function removeComments(query) {
  // remove commented lines
  const q = replaceAll(query, "\r\n", "\n")
  const lines = []
  q.split("\n").forEach((l) => {
    if (l.trim().indexOf("--") !== 0) {
      lines.push(l)
    }
  })
  return lines.join("\n")
}

export default removeComments
