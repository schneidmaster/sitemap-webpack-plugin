import SitemapPlugin from "../../../src/";
import prettydata from "pretty-data";

const prettyPrint = xml => {
  return prettydata.pd.xml(xml);
};

export default {
  entry: () => [],
  output: {
    filename: "index.js",
    path: `${__dirname}/actual-output`,
    libraryTarget: "umd"
  },

  plugins: [
    new SitemapPlugin("https://mysite.com", ["/", "/about"], {
      formatter: prettyPrint
    })
  ]
};
