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

var fixture = {
	name: 'Root',
	children: [{
    	name: 'tv',
    	children: [
    	    { name: 'Anna_und_die_Liebe', children: [] },
		    { name: 'Die_Harald_Schmidt_Show', children: [] }, 
		    { name: 'Sat.1_Nachrichten', children: [] }
		]},
	    { name: 'personen', children: [] },
	    { name: 'service', children: [] },
	    { name: 'video', children: [] }
    ]
};

function readStructure(struc) {
	var page = new Page(struc.name);
	struc.children.forEach(function(child) {
		page.addChild(readStructure(child));
	});
	return page;
}

var root = readStructure(fixture);

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
console.log('Server publish running at http://localhost:8080/');

/* Start admin server */

http.createServer(function (req, res) {
    if(req.url == '/') {
        res.writeHead(302, {
            'Content-Type': 'text/plain',
            'Location': '/static/firstnode_client/en/1/index.html'
        });
        res.end('Moved temporarily\n');
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
console.log('Server admin running at http://localhost:8081/');
