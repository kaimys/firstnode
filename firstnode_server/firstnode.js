/**
 * A simple web server
 */

var http = require('http');
var url = require('url');
var util = require('util');
var paperboy = require('./paperboy');
var cobj = require('./contentobjects');

String.prototype.startsWith = function(str) {
    return this.substring(0, str.length) == str;
};

String.prototype.endsWith = function(str) {
    return this.substring(this.length - str.length) == str;
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
            ret = cobj.create(page.name);
            page.children.forEach(function(childId) {
                ret.addChild(buildTree(childId));
            });
            pages[page.guid] = ret;
        }
    });
    return ret;
}

var root = buildTree(1);

var renderer = require('./renderer').create('pageLayout.ejs');
renderer.addTemplate('Page.ejs', cobj.Page, 'page');
renderer.addTemplate('PageListItem.ejs', cobj.Page, 'list-item');

/* Start publish server */

http.createServer(function (req, res) {
    var path = decodeURI(req.url).split('/');
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
