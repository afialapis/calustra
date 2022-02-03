const DEFAULTS= {
  body_field: 'result'
}

function makeOptions(options) {
  return {
    ...DEFAULTS,
    ...options || {}
  }
}

export {makeOptions}