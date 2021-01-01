import SitemapPlugin from "../../../src/";
import prettydata from "pretty-data";

const prettyPrint = (xml: string): string => {
  return prettydata.pd.xml(xml);
};

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
        formatter: prettyPrint
      }
    })
  ]
};
