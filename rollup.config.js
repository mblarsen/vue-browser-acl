import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'

export default [
  {
    input: './index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }, {
        file: pkg.module,
        sourcemap: true,
        format: 'esm'
      }
    ],
    plugins: [
      resolve(),
      terser()
    ]
  },
  {
    input: './index.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
      name: 'VueBrowserAcl',
      exports: 'named'
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      terser()
    ]
  }
];
