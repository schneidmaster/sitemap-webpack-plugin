import { SitemapStream, SitemapIndexStream } from "sitemap";
import {
  pathAttributes,
  sitemapFilename,
  sitemapStreamToString
} from "./helpers";
import { Formatter, Path, SitemapPathOptions } from "./types";

// Generate a single sitemap as a string.
async function generateSitemap(
  paths: Array<Path>,
  base: string,
  globalPathOptions: SitemapPathOptions,
  formatter?: Formatter
): Promise<string> {
  const sitemap = new SitemapStream({ hostname: base });

  paths.forEach(path => {
    sitemap.write(pathAttributes(path, globalPathOptions));
  });

  sitemap.end();
  return sitemapStreamToString(sitemap, formatter);
}

// Depending on the number of paths provided, generate either a single sitemap
// or multiple sitemaps with an index file.
export async function generateSitemaps(
  paths: Array<Path>,
  base: string,
  publicPath: string,
  filename: string,
  skipgzip: boolean,
  globalPathOptions: SitemapPathOptions,
  formatter?: Formatter
): Promise<Array<string>> {
  if (base.substr(-1) === "/") {
    base = base.replace(/\/$/, "");
  }

  if (paths.length <= 50000) {
    const sitemap = await generateSitemap(
      paths,
      base,
      globalPathOptions,
      formatter
    );
    return [sitemap];
  } else {
    const sitemaps = [];
    const indexExt = skipgzip ? "xml" : "xml.gz";

    const sitemapIndex = new SitemapIndexStream();
    let index = 1;

    for (let i = 0; i < paths.length; i += 45000) {
      const sitemap = await generateSitemap(
        paths.slice(i, i + 45000),
        base,
        globalPathOptions,
        formatter
      );
      sitemaps.push(sitemap);

      sitemapIndex.write(
        `${base}${publicPath}/${sitemapFilename(filename, indexExt, index)}`
      );
      index++;
    }

    sitemapIndex.end();
    const sitemapIndexStr = await sitemapStreamToString(
      sitemapIndex,
      formatter
    );
    sitemaps.unshift(sitemapIndexStr);

    return sitemaps;
  }
}
