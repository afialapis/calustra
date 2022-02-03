import autoExternal from 'rollup-plugin-node-externals'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const NODE_ENV = 'development'

export default {
  input: 'test/index.js',
  output: {
    file: 'test/bundle.js',
    format: 'cjs',
    name: 'CalustraOrm' 
  },
  plugins: [
    autoExternal({
      deps: true
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    }),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      /*https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers*/
      babelHelpers: 'bundled'
    }),    
  ]
}
