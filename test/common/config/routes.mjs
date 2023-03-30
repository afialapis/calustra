
// Routes config

const rou_crud_simple = {
  bodyField: undefined,
  crud: {
    prefix: '/api',
    routes: ['test_01'],
  }      
}

const rou_crud_body_field= {
  bodyField: 'rebody',
  crud: {
    prefix: '/api',
    routes: [{
      name: "test_01",
    }]
  }
}

const rou_queries_noauth = {
  queries: {
    prefix: '',
    routes: [{
      url: '/query/noauth',
      method: 'GET',
      callback: async (ctx) => {
        const conn= ctx.connection //db.getConnection()
        const res= await conn.selectOne('select * from test_01 where name = $1', ['Peter'], {})            
        ctx.body= res
      }
    }]
  }
}

const rou_queries_auth = {
  queries: {
    prefix: '',
    routes: [
      {
        url: '/query/auth',
        method: 'GET',
        callback: (_ctx) => {},
        authUser: {
          require: true,
          action: 'redirect',
          redirect_url: '/'
        }    
      }]
  }
}

export {
  rou_crud_simple,
  rou_crud_body_field,
  rou_queries_noauth,
  rou_queries_auth
}