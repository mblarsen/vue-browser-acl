module.exports = {
  entry: 'index.js',
  html: false,
  vendor: false,
  format: 'cjs',
  filename: {js: `vue-browser-acl.js`},
  presets: [
    require('poi-preset-karma')({
      coverage: true
    })
  ]
}
