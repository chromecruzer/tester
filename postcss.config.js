const {join} = require("path");
module.exports = {
  syntax: 'postcss-scss',
  parser: 'postcss-scss',
  plugins: {
    tailwindcss: {
      config: join(__dirname, 'apps', 'trac-web','tailwind.config.js'),
    },
    autoprefixer: {},
  },
}
