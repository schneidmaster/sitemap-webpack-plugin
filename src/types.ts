import { SitemapItemLoose, EnumChangefreq } from "sitemap";

export type SitemapPathOptions = Omit<
  SitemapItemLoose,
  "url" | "lastmod" | "changefreq"
> & {
  lastmod?: string | boolean;
  changefreq?: string | EnumChangefreq;
};

type PathOptions = SitemapPathOptions & {
  path: string;
};

export type Path = string | PathOptions;

export type ConfigurationOptions = SitemapPathOptions & {
  filename?: string;
  skipgzip?: boolean;
  formatter?: (code: string) => string;
};

export type Configuration = {
  base: string;
  paths: Array<Path>;
  options?: ConfigurationOptions;
};

export type Formatter = (code: string) => string;
