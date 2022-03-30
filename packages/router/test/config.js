export default {
  connections: {
    postgres: {
      db: {
        dialect:  'postgres',
        host:     'localhost',
        port:     5432,
        database: 'calustra',
        user:     'postgres',
        password: 'postgres'
      },
      log: 'warn'
    },
    sqlite: {
      db: {
        dialect:  'sqlite',
        filename: '/tmp/calustra.router.sqlite',
        verbose: true,
        cached: false
      },
      log: 'warn'
    }
  },
  server: {
    port: 3001,
  },
  credentials: {
    username: 'calustra',
    password: 'canastro'
  },
  // calustra configs to be tested
  calustra: {
    simple: {
      schema: 'public',
      body_field: undefined,
      crud: {
        prefix: '/simple',
        routes: ['test_01'],
      }      
    },
    all: {
      schema: 'public',
      body_field: 'rebody',
      crud: {
        prefix: '/all',
        routes: '*',
      }
    },
    options: {
      schema: 'public',
      body_field: undefined,
      crud: {
        prefix: '/api',
        routes: [{
          name: "test_01",
          schema: "public",
        }],
      }
    },
    with_noauth_queries: {
      schema: 'public',
      body_field: undefined,
      crud: {      
        prefix: '/all',
        routes: '*',
      },
      queries: {
        prefix: '',
        routes: [{
          url: '/query/one',
          method: 'GET',
          callback: async (ctx, connection) => {
            const res= await connection.selectOne('select * from test_01 where name = $1', ['Peter'], {})
            ctx.body= res
          },
          _test_check: async (response, assert) => {
            const result = await response.json()
            assert.strictEqual(result.name, 'Peter')
          }
        }]
      }
    },
    
    with_auth_queries: {
      schema: 'public',
      body_field: undefined,
      crud: {      
        prefix: '/all',
        routes: '*',
      },
      queries: {
        prefix: '',
        routes: [
          {
            url: '/query/one',
            method: 'GET',
            callback: (_ctx, _connection) => {},
            authUser: {
              require: true,
              action: 'redirect',
              redirect_url: '/'
            },   
            _test_check: async (response, assert) => {
              assert.strictEqual(response.status, 404)
            }       
          }]
      }
    },  
  }
}

