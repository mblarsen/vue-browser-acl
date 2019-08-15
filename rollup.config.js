import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'

const targetsMap = {
  [pkg.module]: 'esm',
  [pkg.main]: 'cjs',
  [pkg.browser]: 'umd',
}

const output = (name = null) => target => {
  const output = {
    file: target,
    format: targetsMap[target],
    sourcemap: true,
    exports: 'named',
  }
  if (name) {
    output.name = name
  }
  return output
}

const config = (targets, name = null, plugins = []) => ({
  input: './index.js',
  output: targets.map(output(name)),
  plugins: [
    resolve(),
    ...plugins,
    terser(),
  ]
})

export default [
  config([pkg.main, pkg.module]),
  config([pkg.browser], 'VueBrowserAcl', [
    babel({ exclude: 'node_modules/**' }),
  ]),
];
