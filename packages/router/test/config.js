export default {
  db: {
    postgres: {
      connection: {
        dialect:  'postgres',
        host:     'localhost',
        port:     5432,
        database: 'calustra',
        user:     'postgres',
        password: 'postgres'
      },
      options: {
        log: 'warn'
      }
    },
    sqlite: {
      connection: {
        dialect:  'sqlite',
        filename: '/tmp/calustra.router.sqlite',
        verbose: true,
        cached: false
      },
      options: {
        log: 'warn'
      }
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
      prefix: '/simple',
      tables: ['test_01'],
      schema: 'public',
      body_field: undefined
    },
    all: {
      prefix: '/all',
      tables: '*',
      schema: 'public',
      body_field: 'rebody'
    },
    options: {
      prefix: '/api',
      tables: [{
        name: "test_01",
        schema: "public",
      }],
      schema: 'public',
      body_field: undefined
    },
    with_noauth_queries: {
      prefix: '/all',
      tables: '*',
      schema: 'public',
      body_field: undefined,
      queries: [{
        url: '/query/one',
        method: 'GET',
        callback: async (ctx, db) => {
          const res= await db.selectOne('select * from test_01 where name = $1', ['Peter'], {})
          ctx.body= res
        },
        _test_check: async (response, assert) => {
          const result = await response.json()
          assert.strictEqual(result.name, 'Peter')
        }
      }]
    },
    
    with_auth_queries: {
      prefix: '/all',
      tables: '*',
      schema: 'public',
      body_field: undefined,
      queries: [
      {
        url: '/query/one',
        method: 'GET',
        callback: (_ctx, _db) => {},
        authUser: {
          require: true,
          action: 'redirect',
          redirect_url: '/'
        },   
        _test_check: async (response, assert) => {
          assert.strictEqual(response.status, 404)
        }       
      }]
    },  
  }
}

