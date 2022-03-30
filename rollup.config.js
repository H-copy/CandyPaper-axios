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
  sourceMap: false
})

// const esPlugin = eslint({
//   throwOnError: true,
//   include: ['src/**/*.ts'],
//   exclude: ['node_modules/**', 'lib/**']
// })

const common = {
  input: getPath('./src/index.ts'),
  plugins: [
    resolve(extensions),
    commonjs(),
    tsPlugin,
  ],
  external: ['axios']
}

const umdBuild = {
  ...common,
  output: {
    file: packageJSON.main,
    format: 'umd',
    name: packageJSON.name
  }
}

const esBuild = {
  ...common,
  output: {
    file: packageJSON.module,
    format: 'es',
    name: packageJSON.name

  }
}


const types = {
  ...common,
  output: {
    file: packageJSON.typings,
    format: 'es',
  },
  plugins: [
    dts()
  ],
}


export default [
  umdBuild,
  esBuild,
  types
] 