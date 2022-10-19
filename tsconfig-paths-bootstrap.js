const tsConfigPathFile = require("./tsconfig.paths.json")
const tsConfig = require("./tsconfig.json")
const tsConfigPaths = require("tsconfig-paths")

tsConfigPaths.register({
    baseUrl: tsConfig.compilerOptions.outDir,
    paths: tsConfigPathFile.compilerOptions.paths
  })