module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "10.0"
        }
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        allowTopLevelThis: true
      }
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-transform-regenerator",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-destructuring"
  ]
};
