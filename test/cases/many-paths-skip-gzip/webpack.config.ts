import SitemapPlugin from "../../../src/";

const paths = [];
for (let i = 0; i < 60000; i++) {
  paths.push(`/${i}`);
}

export default {
  entry: (): [] => [],
  output: {
    filename: "index.js",
    path: `${__dirname}/actual-output`,
    libraryTarget: "umd"
  },

  plugins: [
    new SitemapPlugin({
      base: "https://mysite.com",
      paths,
      options: { skipgzip: true }
    })
  ]
};
