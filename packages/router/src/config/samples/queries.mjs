[
  {
    path: '/crud/todos/fake',
    method: 'POST',
    callback: (_ctx) => {},
    authUser: {
      require: true,
      action: 'redirect',
      redirect_url: '/'
    },  
  }
]