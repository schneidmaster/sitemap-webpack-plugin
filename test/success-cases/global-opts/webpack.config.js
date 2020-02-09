import SitemapPlugin from "../../../src/";

export default {
  entry: () => [],
  output: {
    filename: "index.js",
    path: `${__dirname}/actual-output`,
    libraryTarget: "umd"
  },

  plugins: [
    new SitemapPlugin("https://mysite.com", ["/", "/about"], {
      fileName: "sitemap.xml",
      lastMod: true,
      changeFreq: "monthly",
      priority: "0.4"
    })
  ]
};
