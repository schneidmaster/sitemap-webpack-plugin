import SitemapPlugin from "../../../src/";

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
      paths: ["/", "/about"],
      options: {
        filename: "sitemap.xml",
        lastmod: "2019-06-01",
        changefreq: "monthly",
        priority: 0.4
      }
    })
  ]
};
