const { build } = require("esbuild");
const { dependencies, devDependencies } = require("./package.json");
const { Generator } = require("npm-dts");

new Generator({
  entry: "src/index.ts",
  output: "dist/index.d.ts",
}).generate();

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  external: Object.keys(dependencies).concat(Object.keys(devDependencies)),
};

build({
  ...sharedConfig,
  platform: "node", // for CJS
  outfile: "dist/index.js",
});

build({
  ...sharedConfig,
  outfile: "dist/index.esm.js",
  platform: "node", // for ESM
  format: "esm",
});
