[
  {
    path: '/crud/todos/fake',
    method: 'POST',
    callback: (ctx) => {},
    authUser: {
      require: true,
      action: 'redirect',
      redirect_url: '/'
    },  
  }
]