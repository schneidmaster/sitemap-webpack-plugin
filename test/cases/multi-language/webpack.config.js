import SitemapPlugin from "../../../src/";

const paths = [
  {
    path: "/",
    lastmod: "2016-01-01",
    changefreq: "daily",
    priority: 1.0,
    links: [
      { lang: "en", url: "/" },
      { lang: "es", url: "/es/" }
    ]
  },
  {
    path: "/about/",
    priority: 0.4,
    links: [
      { lang: "en", url: "/about/" },
      { lang: "es", url: "/es/about/" }
    ]
  },
  {
    path: "/faq/",
    links: [
      { lang: "en", url: "/about/" },
      { lang: "es", url: "/es/faq/" }
    ]
  },
  {
    path: "/contact/",
    links: [
      { lang: "en", url: "/contact/" },
      { lang: "es", url: "/es/contact/" }
    ]
  }
];

export default {
  entry: () => [],
  output: {
    filename: "index.js",
    path: `${__dirname}/actual-output`,
    libraryTarget: "umd"
  },

  plugins: [new SitemapPlugin({ base: "https://mysite.com", paths })]
};
