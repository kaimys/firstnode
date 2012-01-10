/**
 * Renderer Class
 */

var fs = require('fs');
var ejs = require('ejs');

exports.create = function(pageLayout) {
    return new Renderer(pageLayout);
};

function Renderer(pageLayout) {
    console.log('new Renderer()');
    this.templates = [];
    this.pageLayoutFile = this.loadTemplate(pageLayout);
    this.pageLayout = pageLayout;
}

Renderer.prototype.loadTemplate = function(template) {
    return fs.readFileSync(__dirname + '/htdocs/templates/' + template, 'utf8');
};


Renderer.prototype.addTemplate = function(template, constructor, context) {
    this.templates.unshift({
        'templateFile': this.loadTemplate(template),
        'template'    : template,
        'constructor' : constructor,
        'context'     : context
    });
};

Renderer.prototype.render = function(req, res, obj, context) {
    console.log('render(req, res, ' + obj.name + ', ' + context + ')');
    for(var i = 0; i < this.templates.length; i++) {
        var tpl = this.templates[i];
        if(obj instanceof tpl.constructor && context == tpl.context) {
            return ejs.render(tpl.templateFile, {
                'cache'     : true,
                'filename'  : tpl.template,
                'req'       : req,
                'res'       : res,
                'obj'       : obj,
                'context'   : context,
                'renderer'  : this
            });
        }
    }
};

Renderer.prototype.renderPage = function(req, res, obj) {
    console.log('renderPage(req, res, ' + obj.name + ')');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(ejs.render(this.pageLayoutFile, {
        'cache'   : true,
        'filename': this.pageLayout,
        'req'     : req,
        'res'     : res,
        'obj'     : obj,
        'renderer': this
    }));
};
