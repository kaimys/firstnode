/**
 * A simple web server
 */

var http = require('http');
var url = require('url');
var fs = require('fs');
var util = require('util');

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
 * Template Class
 */

function Template() {
    console.log('new Template()');
}

Template.prototype.render = function(req, res, obj) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><head><title>' + obj.name + '</title></head><body><h1>' + obj.name + '</h1><ul>');
    obj.children.forEach(function(child) {
        res.write('<li><a href="' + child.name + '/">' + child.name + '</a></li>');
    });
    res.end('</ul></body></html>');
};

/* Application setup */

var root = new Page('root');
var tv = new Page('tv');
tv.addChild(new Page('Anna_und_die_Liebe'));
tv.addChild(new Page('Die_Harald_Schmidt_Show'));
tv.addChild(new Page('Sat.1_Nachrichten'));
root.addChild(tv);
root.addChild(new Page('personen'));
root.addChild(new Page('service'));
root.addChild(new Page('video'));

var defaultTemplate = new Template();

/* Start server */

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
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not found\n');
    } else {
        defaultTemplate.render(req, res, page);      
    }
    console.log(req.url + ' - ' + res.statusCode);
}).listen(8080, "0.0.0.0");
console.log('Server running at http://localhost:8080/');
