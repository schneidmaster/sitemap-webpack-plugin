import SitemapPlugin from "../../../src/";

const paths = [
  {
    path: "/",
    lastmod: "2016-01-01",
    changefreq: "daily",
    priority: 1.0
  },
  {
    path: "/about/",
    priority: 0.4
  },
  {
    path: "/faq/"
  },
  "/contact/"
];

export default {
  entry: () => [],
  output: {
    filename: "index.js",
    path: `${__dirname}/actual-output`,
    libraryTarget: "umd"
  },

  plugins: [
    new SitemapPlugin({
      base: "https://mysite.com",
      paths,
      options: {
        filename: "map.xml",
        priority: 0.5
      }
    })
  ]
};
