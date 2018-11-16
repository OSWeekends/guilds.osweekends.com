// https://eslint.org/docs/user-guide/configuring
// jshint strict:true, node:true, esnext: true, curly:true, maxcomplexity:15, newcap:true
module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    //'plugin:vue/recommended', 
    //'standard',
    './node_modules/eslint-config-google/index.js'
  ],
  // required to lint *.vue files
  plugins: [
    //'vue'
  ],
  rules: {
    'no-console': 'off',
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "require-jsdoc" : 'off',
    'max-len': [2, {
      code: 150,
      comments: 200,
      tabWidth: 2,
      ignoreUrls: true,
    }],
  }
}