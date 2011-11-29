/**
 * 
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

function MimeMap() {
    this.map = {
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css'
    };
    
    this.lookup = function(filename) {
        var ext = filename.substring(filename.lastIndexOf('.') + 1);
        var mime = this.map[ext];
        if(mime === null)
            mime = 'application/octet-stream';
        return mime;
    };
}

var mimeMap = new MimeMap();

function Folder(name) {
    this.name = name;
    this.mounts = {};
    
    this.doRequest = function(req, res, pathName) {
        var dirname = pathName.split('/')[1];
        if(dirname in this.mounts) {
            pathName = pathName.substring(dirname.length + 1);
            this.mounts[dirname].doRequest(req, res, pathName);
        } else if(pathName == '/') {
            this.showIndex(req, res);
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not found\n');
        }
    };
    
    this.showIndex = function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<html><head><title>Contents of folder ' +  this.name + '</title></head>');
        res.write('<body><h1>Contents of folder ' +  this.name + '</h1><ul>');
        for(var mount in this.mounts) {
            res.write('<ul><a href="' + mount + '">' + mount + '</a></ul>');
        }
        res.write('</ul></body></html>');
        res.end();
    };
    
    this.mount = function(folder) {
        this.mounts[folder.name] = folder;
    };
}

var action = new Folder('action');

action.doRequest = function(req, res, pathName) {
    try {
        if(pathName.startsWith('/hello')) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Hello World\n');
        } else if(pathName.startsWith('/bye')) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Bye bye\n');
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not found\n');
        }
    } catch(ext) {
        console.log(util.inspect(ext));
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Internal error\n');
    }
};

var root = new Folder('');

root.showIndex = function(req, res) {
    try {
        var filename = 'htdocs/index.html';
        fs.stat(filename, function(err, stat) {
            if(!err && stat.isFile()) {
                fs.readFile(filename, function (err, data) {
                    if(err) throw err;
                    res.writeHead(200, {'Content-Type': mimeMap.lookup(filename)});
                    res.end(data);
                });
            } else {
                if(err && err.code != 'ENOENT')
                    throw new Error(util.inspect(err));
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Not found!\n');
            }
        });
    } catch(ext) {
        console.log(ext);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Internal error: ' + ext + '\n');
    }
};

root.mount(action);

http.createServer(function (req, res) {
    var pathName = url.parse(req.url).pathname;
    console.log(pathName);
    root.doRequest(req, res, pathName);
}).listen(8080, "0.0.0.0");
console.log('Server running at http://localhost:8080/');
