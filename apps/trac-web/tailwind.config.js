const {createGlobPatternsForDependencies} = require('@nrwl/react/tailwind');
const {join} = require("path");
const BandLTheme = require("./src/styles/BandLTheme");
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.test).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: BandLTheme.colors,
      fontFamily: BandLTheme.fontFamily,
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
