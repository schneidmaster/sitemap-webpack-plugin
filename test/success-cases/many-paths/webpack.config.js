import SitemapPlugin from "../../../src/";

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

  plugins: [new SitemapPlugin("https://mysite.com", paths)]
};
