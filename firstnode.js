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
 * Folder Class
 */

function Folder(name) {
    console.log('new Folder(' + name + ')');
    this.name = name;
    this.mounts = {};
}

Folder.prototype.doRequest = function(req, res, pathName) {
    console.log('Folder.doRequest(' + pathName +')');
    var dirname = pathName.split('/')[1];
    if(dirname in this.mounts) {
        pathName = pathName.substring(dirname.length + 1);
        this.mounts[dirname].doRequest(req, res, pathName);
    } else if(pathName == '/') {
        this.showIndex(req, res);
    } else {
        return false;
    }
    return true;
};

Folder.prototype.showIndex = function(req, res) {
    console.log('Folder.showIndex');
    this.writeHeader(req, res);
    for(var mount in this.mounts) {
        this.writeLine(req, res, mount);
    }
    this.writeFooter(req, res);
    res.end();
};

Folder.prototype.writeHeader = function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><head><title>Contents of folder ' +  this.name + '</title></head>');
    res.write('<body><h1>Contents of folder ' +  this.name + '</h1><ul>');
};

Folder.prototype.writeLine = function(req, res, line) {
    res.write('<li><a href="' + line + '">' + line + '</a></li>');
};

Folder.prototype.writeFooter = function(req, res) {
    res.write('</ul></body></html>');
};

Folder.prototype.mount = function(folder) {
    this.mounts[folder.name] = folder;
};

/**
 * DirFolder Class
 */

function DirFolder(name, directory) {
    console.log('new DirFolder(' + name + ', ' + directory + ')');
    Folder.call(this, name);
    this.directory = directory;
}

DirFolder.prototype = new Folder('');
DirFolder.prototype.constructor = DirFolder;

DirFolder.prototype.doRequest = function(req, res, pathName) {
    console.log('DirFolder.doRequest(' + pathName +')');
    if (Folder.prototype.doRequest.call(this, req, res, pathName))
        return true;
    var filename = this.directory + pathName;
    fs.readFile(filename, function (err, data) {
        if (err && err.code == 'ENOENT') {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not found\n');           
        } else if (err) {
            throw new Error(util.inspect(err));
        } else {
            res.writeHead(200, {'Content-Type': mimeMap.lookup(filename)});
            res.end(data);
        }
    });
    return true;
};

DirFolder.prototype.showIndex = function(req, res) {
    console.log('DirFolder.showIndex');
    try {
        var dirFolder = this;
        var filename = this.directory + '/index.html';
        fs.stat(filename, function(err, stat) {
            if (!err && stat.isFile()) {
                fs.readFile(filename, function (err, data) {
                    if(err) throw err;
                    res.writeHead(200, {'Content-Type': mimeMap.lookup(filename)});
                    res.end(data);
                });
            } else {
                if (err && err.errno === process.ENOENT)
                    throw new Error(util.inspect(err));
                fs.readdir(dirFolder.directory, function(err, files) {
                    if (err)
                        throw new Error(util.inspect(err));
                    dirFolder.writeHeader(req, res);
                    for (var file in files) {
                        dirFolder.writeLine(req, res, files[file]);
                    }
                    dirFolder.writeFooter(req, res);
                    res.end();
                });
            }
        });
    } catch(ext) {
        console.log(ext);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Internal error: ' + ext + '\n');
    }
};

/* Application setup */

var action = new Folder('action');

action.doRequest = function(req, res, pathName) {
    console.log('action.doRequest(' + pathName +')');
    try {
        if(pathName.startsWith('/hello')) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Hello World\n');
        } else if(pathName.startsWith('/bye')) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Bye bye\n');
        } else {
            return false;
        }
    } catch(ext) {
        console.log(util.inspect(ext));
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Internal error\n');
    }
    return true;
};

var root = new DirFolder('root', 'htdocs');
root.mount(action);

/* Start server */

http.createServer(function (req, res) {
    var pathName = url.parse(req.url).pathname;
    if (!root.doRequest(req, res, pathName)) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not found\n');
    }
    console.log(pathName + ' - ' + res.statusCode);
}).listen(8080, "0.0.0.0");
console.log('Server running at http://localhost:8080/');
