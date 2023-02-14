// Server's config

const server_config = {
  port: 3001
}

// Databases config

const _options= {
  log: 'warn'
}
const _tables= [
  {
    name: 'test_01',
    schema: 'public',
    useDateFields: {
      use: true,
      fieldNames: {
        created_at: 'created_at', 
        last_update_at: 'last_update_at'
      },
      now: () => 999
    },
    triggers: {
      afterInsert: async (conn, id, params, options) => {
        return 777
      }
    }
  }
]


const conn_postgres= {
  connection: {
    database: {
      dialect:  'postgres',
      host:     'localhost',
      port:     5432,
      database: 'calustra',
      user:     'postgres',
      password: 'postgres'
    },
    options: _options
  },
  tables: _tables
}

const conn_sqlite= {
  connection: {
    database: {
      dialect:  'sqlite',
      filename: '/tmp/calustra.router.sqlite', // ':memory:'
      verbose: true,
      cached: true
    },
    options: _options
  },
  tables: _tables  
}


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
        const conn= ctx.db.getConnection()
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
  server_config, 
  conn_postgres, 
  conn_sqlite,
  rou_crud_simple,
  rou_crud_body_field,
  rou_queries_noauth,
  rou_queries_auth
}