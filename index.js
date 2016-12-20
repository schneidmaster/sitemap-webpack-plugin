function SitemapWebpackPlugin(base, paths, fileName) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    // Set options
    this.lastMod = options.lastMod || false;
    this.changeFreq = options.changeFreq || null;
    this.priority = options.priority || null;

    this.base = base;
    this.paths = paths;
    this.fileName = fileName || 'sitemap.xml';
    this.xsltUrl = options.xslt || null;
    this.beautify = options.beautify || true;
}

function GenerateDate() {
    var date = new Date().toLocaleDateString().split("/");
    var year = date.splice(-1)[0];
    date.splice(0, 0, year);
    var formattedDate = date.join("-");
    return formattedDate;
}

SitemapWebpackPlugin.prototype.apply = function(compiler) {
    var self = this;

    // Create sitemap from paths
    var out = '<?xml version="1.0" encoding="UTF-8"?>';
    if(this.xsltUrl){
        out += '<?xml-stylesheet type="text/xsl" href="'+this.xsltUrl+'"?>';
    }
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
    if(this.beautify){
        out = out.replace(/(<(\/|\?)?(urlset|xml-stylesheet))/g,"\n$1");
        out = out.replace(/(<\/?(url)>)/g,"\n\t$1");
        out = out.replace(/(<(loc|lastmod|changefreq|priority)>)/g,"\n\t\t$1");
    }

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
