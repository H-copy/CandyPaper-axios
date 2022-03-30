import path from 'path'
import resolve from '@rollup/plugin-node-resolve' // 依赖引用插件
import commonjs from '@rollup/plugin-commonjs' // commonjs模块转换插件
// import { eslint } from '@rollup/plugin-eslint' // eslint插件
import ts from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
const getPath = _path => path.resolve(__dirname, _path)
import packageJSON from './package.json'

const extensions = [
  '.js',
  '.ts',
  '.tsx'
]

const tsPlugin = ts({
  tsconfig: getPath('./tsconfig.json'),
  // extensions
})

// const esPlugin = eslint({
//   throwOnError: true,
//   include: ['src/**/*.ts'],
//   exclude: ['node_modules/**', 'lib/**']
// })

const commonConf = {
  input: getPath('./src/index.ts'),
  plugins: [
    resolve(extensions),
    commonjs(),
    // esPlugin,
    tsPlugin,
  ]
}

const outputMap = [
  {
    file: packageJSON.main,
    format: 'umd',
  },
  {
    file: packageJSON.module,
    format: 'es',
  }
]

const types = {
  input: commonConf.input,
  output: {
    file: packageJSON.typings,
    format: 'es'
  },
  plugins: [
    dts()
  ]
}

const buildConf = options => Object.assign({}, commonConf, options)

export default [
  ...outputMap.map(output => buildConf({ output: { name: packageJSON.name, ...output } })),
  types
] 