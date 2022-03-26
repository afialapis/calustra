import defaults from '../defaults'

function createOptions(options) {
  return {
    ...defaults,
    ...options || {}
  }
}

export default createOptions
