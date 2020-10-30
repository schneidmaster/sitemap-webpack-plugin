import SitemapPlugin from "../../../src/";

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
      paths: [
        {
          path: "/",
          links: [
            { lang: "en", url: "http://mysite.com" },
            { lang: "ja", url: "http://mysite.com/ja" }
          ]
        },
        {
          path: "/about",
          links: [
            { lang: "en", url: "http://mysite.com/about" },
            { lang: "ja", url: "http://mysite.com/ja/about" }
          ]
        }
      ],
      options: {
        news: {
          publication: {
            name: "The Example Times",
            language: "en"
          },
          genres: "PressRelease, Blog",
          publication_date: "2008-12-23",
          title: "Companies A, B in Merger Talks",
          keywords: "business, merger, acquisition, A, B",
          stock_tickers: "NASDAQ:A, NASDAQ:B"
        }
      }
    })
  ]
};
