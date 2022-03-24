const DEFAULTS= {
  body_field: 'result',
  get_user_id: (ctx) => {
    let uid= ctx.headers['user-id']
    if (uid!=undefined) {
      return uid
    }
    return undefined
  },
  require_user_id: false // applies to every route

}

function makeOptions(options) {
  return {
    ...DEFAULTS,
    ...options || {}
  }
}

export {makeOptions}