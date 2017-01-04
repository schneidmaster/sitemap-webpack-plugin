function SitemapWebpackPlugin(base, paths, fileName) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  // Set options
  this.lastMod = options.lastMod || false;
  this.changeFreq = options.changeFreq || null;
  this.priority = options.priority || null;

  this.base = base;
  this.paths = paths;
  this.fileName = fileName || 'sitemap.xml';
}

function GenerateDate() {
  var dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  var date = new Date().toLocaleDateString([], dateOptions).split("/");
  var year = date.splice(-1)[0];
  date.splice(0, 0, year);
  var formattedDate = date.join("-");
  return formattedDate;
}

SitemapWebpackPlugin.prototype.apply = function(compiler) {
  var self = this;

  // Create sitemap from paths
  var out = '<?xml version="1.0" encoding="UTF-8"?>';
  out += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  for(var i = 0; i < self.paths.length; i++) {
    var path = self.paths[i];

    out += '<url>';
    out += '<loc>' + self.base + path + '</loc>';
    self.lastMod ? out += '<lastmod>' + GenerateDate() + '</lastmod>' : null;
    self.changeFreq ? out += '<changefreq>' + self.changeFreq + '</changefreq>' : null;
    self.priority ? out += '<priority>' + self.priority + '</priority>' : null;
    out += '</url>';
  }
  out += '</urlset>';

  compiler.plugin('emit', function(compilation, callback) {
    compilation.fileDependencies.push(self.fileName);
    compilation.assets[self.fileName] = {
      source: function () {
        return out;
      },
      size: function () {
        return Buffer.byteLength(out, 'utf8');
      }
    };
    callback();
  });
};

module.exports = SitemapWebpackPlugin;
