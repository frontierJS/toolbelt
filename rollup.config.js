export default {
  input: 'index.js',
  output: [
    {
      file: 'toolbelt.js',
      format: 'es',
    },
    {
      file: 'dist/build-iife.js',
      format: 'iife',
      name: 'Toolbelt',
      browser: true,
    },
    {
      file: 'dist/build-umd.js',
      format: 'umd',
      name: 'Toolbelt',
      sourcemap: true,
    },
  ],
}
