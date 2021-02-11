import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: {
    file: "lib/index.js",
    format: "cjs",
    exports: "default"
  },
  external: [
    "schema-utils",
    "sitemap",
    "util",
    "webpack",
    "webpack-sources",
    "zlib"
  ],
  plugins: [json(), typescript()]
};
