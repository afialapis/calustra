const DEFAULTS= {
  body_field: 'result',
  get_user_id: (ctx) => {
    let uid= ctx.headers['user-id']
    if (uid!=undefined) {
      return uid
    }
    return undefined
  },
  auth: {
    require: false,
    action: 'redirect', // 'error'
    redirect_path: '/',
    error_code: 401
  }
}

function makeOptions(options) {
  return {
    ...DEFAULTS,
    ...options || {}
  }
}

export {makeOptions}