/**
 * A simple web server
 */

var http = require('http');
var url = require('url');
var fs = require('fs');
var util = require('util');
var ejs = require('ejs');
var paperboy = require('./paperboy');

String.prototype.startsWith = function(str) {
    return this.substring(0, str.length) == str;
};

String.prototype.endsWith = function(str) {
    return this.substring(this.length - str.length) == str;
};

/**
 * MimeMap Class
 */

function MimeMap() {
    this.map = {
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css'
    };
}

MimeMap.prototype.lookup = function(filename) {
    var ext = filename.substring(filename.lastIndexOf('.') + 1);
    var mime = this.map[ext];
    if(mime === null)
        mime = 'application/octet-stream';
    return mime;
};

var mimeMap = new MimeMap();

/**
 * Page Class
 */

function Page(name) {
    console.log('new Page(' + name + ')');
    this.name = name;
    this.children = [];
    this.parent = null;
}

Page.prototype.addChild = function(child) {
    if(!(child instanceof Page))
        throw new Error("Not a page!");
    if(this.containsChild(child.name)) 
        throw Error("Page already contains a object of that name!");
    this.children.push(child);
    child.parent = this;
    return this;
};

Page.prototype.getChild = function(name) {
    for(var i = 0; i < this.children.length; i++) {
        if(this.children[i].name == name)
            return this.children[i];
    }
    return null;
};

Page.prototype.containsChild = function(name) {
    return this.getChild(name) != null;
};

/**
 * Renderer Class
 */

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

/* Application setup */

var fixtures = [
    { guid: 1, name: "Root", parent: 0, children: [2, 3, 4, 5] },
    { guid: 2, name: "tv", parent: 1, children: [6, 7, 8] },
    { guid: 3, name: "personen", parent: 1, children: [] },
    { guid: 4, name: "service", parent: 1, children: [9, 10] },
    { guid: 5, name: "video", parent: 1, children: [] },
    { guid: 6, name: "Anna_und_die_Liebe", parent: 2, children: [] },
    { guid: 7, name: "Die_Harald_Schmidt_Show", parent: 2, children: [] },
    { guid: 8, name: "Sat.1_Nachrichten", parent: 2, children: [] },
    { guid: 9, name: "Kontakt", parent: 4, children: [] },
    { guid: 10, name: "Impressum", parent: 4, children: [] },
];

var pages = {};

function buildTree(id) {
    var ret;
    fixtures.forEach(function(page) {
        if(id == page.guid) {
            ret = new Page(page.name);
            page.children.forEach(function(childId) {
                ret.addChild(buildTree(childId));
            });
            pages[page.guid] = ret;
        }
    });
    return ret;
}

var root = buildTree(1);

var renderer = new Renderer('pageLayout.ejs');
renderer.addTemplate('Page.ejs', Page, 'page');
renderer.addTemplate('PageListItem.ejs', Page, 'list-item');

/* Start publish server */

http.createServer(function (req, res) {
    var path = req.url.split('/');
    path.shift();
    var page = root;
    path.forEach(function(pathElement) {
        if(page != null && pathElement != '') {
            page = page.getChild(pathElement);
        }
    });
    if (page == null) {
        paperboy
            .deliver(__dirname + '/htdocs', req, res)
            .after(function(statCode) {
                console.log(req.url + ' - ' + res.statusCode);
            })
            .otherwise(function(err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Not found\n');
                console.log(req.url + ' - ' + res.statusCode);
            });
    } else {
        renderer.renderPage(req, res, page);
        console.log(req.url + ' - ' + res.statusCode);
    }
}).listen(8080, "0.0.0.0");
console.log('Publish server running at http://localhost:8080/');

/* Start admin server */

http.createServer(function (req, res) {
    if(req.url == '/') {
        res.writeHead(302, {
            'Content-Type': 'text/plain',
            'Location': '/static/firstnode_client/en/1/index.html'
        });
        res.end('Moved temporarily\n');
    } else if(req.url.startsWith('/services/page/')) {
        if(req.url.startsWith('/services/page/list')) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({content: fixtures}));
        } else if(req.url.startsWith('/services/page/id/')) {
            var id = req.url.substr('/services/page/id/'.length);
            var page = null;
            if(req.method == 'GET') {
                fixtures.forEach(function (fix) {
                    if(fix.guid == id)
                        page = fix;
                });
                if(page != null) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({content: page}));
                } else {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end('Not found\n');
                }
            } else if(req.method == 'PUT') {
                var body = '';
                req.on('data', function(chunk) {
                    // append the current chunk of data to the body variable
                    body += chunk.toString();
                });
                req.on('end', function() {
                    console.log(body);
                    var updatedPage = JSON.parse(body);
                    pages[id].name = updatedPage.name;
                    fixtures.forEach(function (fix) {
                        if(fix.guid == id)
                            page = fix;
                    });
                    if(page != null) {
                        page.name = updatedPage.name;
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({content: page}));
                    } else {
                        res.writeHead(404, {'Content-Type': 'text/plain'});
                        res.end('Not found\n');
                    }
                });
            }
        }
        console.log(req.method + ' - ' + req.url + ' - ' + res.statusCode);
    } else {
        paperboy
            .deliver(__dirname + '/htadmin', req, res)
            .after(function(statCode) {
                console.log(req.url + ' - ' + res.statusCode);
            })
            .otherwise(function(err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Not found\n');
                console.log(req.url + ' - ' + res.statusCode);
            });
    }
}).listen(8081, "0.0.0.0");
console.log('Admin server running at http://localhost:8081/');
