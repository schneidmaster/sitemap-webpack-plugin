import SitemapPlugin from "../../../src/";
import { StatsWriterPlugin } from "webpack-stats-plugin";

const paths = [];
for (let i = 0; i < 60000; i++) {
  paths.push(`/${i}`);
}

export default {
  entry: () => [],
  output: {
    filename: "index.js",
    path: `${__dirname}/actual-output`,
    libraryTarget: "umd"
  },

  plugins: [
    new SitemapPlugin("https://mysite.com", paths, { skipgzip: true }),
    new StatsWriterPlugin() // Causes the asset's `size` method to be called
  ]
};
