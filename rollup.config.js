import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

export default [
  // Main build configurations
  {
    input: 'src/odin.js',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        name: 'ODIN'
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      },
      {
        file: packageJson.browser,
        format: 'umd',
        sourcemap: true,
        name: 'ODIN'
      }
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true
        },
        mangle: {
          reserved: ['ODIN', 'AutoStorage', 'SecretStorage', 'SuperStorage', 'Crypt']
        }
      })
    ],
    external: []
  },
  // TypeScript definitions
  {
    input: 'src/odin.d.ts',
    output: [{ file: 'dist/odin.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  }
];