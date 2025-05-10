export default {
  // configuration tells js to transform all files to javascript
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  //   testing environment is node js
  testEnvironment: "node",
  //   to tell jest that js and mjs are used as ESM modules
  // extensionsToTreatAsEsm: [".js", ".mjs"],
  transformIgnorePatterns: ["/node_modules/(?!your-esm-package)"],
};
