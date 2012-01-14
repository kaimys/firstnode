/**
 * A simple web server
 */

var http = require('http');
var util = require('util');
var paperboy = require('./paperboy');
var cobj = require('./contentobjects');
var store = require('./store');
var rest = require('./rest');

String.prototype.startsWith = function(str) {
    return this.substring(0, str.length) == str;
};

String.prototype.endsWith = function(str) {
    return this.substring(this.length - str.length) == str;
};

function logRequest(req, res) {
    console.log(req.method + ' - ' + req.headers.host + ' - ' +req.url + ' - ' + res.statusCode);
};

/* Application setup */

store.readFixtures([
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
], 1);

var renderer = require('./renderer').create('pageLayout.ejs');
renderer.addTemplate('Page.ejs', cobj.Page, 'page');
renderer.addTemplate('PageListItem.ejs', cobj.Page, 'list-item');

/* Start publish server */

http.createServer(function (req, res) {
    var page = store.getObjectByPath(req.url);
    if (page == null) {
        paperboy
            .deliver(__dirname + '/htdocs', req, res)
            .after(function(statCode) {
                logRequest(req, res);
            })
            .otherwise(function(err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Not found\n');
                logRequest(req, res);
            });
    } else {
        renderer.renderPage(req, res, page);
        logRequest(req, res);
    }
}).listen(8080, "0.0.0.0");
console.log('Publish server running at http://localhost:8080/');

// Setup REST service

var contentService = rest.service('/services/content/');

contentService.index = function(query, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({content: store.query(query)}));
};

contentService.get = function(id, res) {
    var page = store.getObject(id);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({content: page.toArray()}));
    console.log(JSON.stringify(page.toArray()));
};

contentService.put = function(obj, res) {
    var page = store.getObject(obj.guid);
    page.name = obj.name;
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({content: page.toArray()}));
    console.log(JSON.stringify(page.toArray()));
};

/* Start admin server */

http.createServer(function (req, res) {
    if(contentService.handleRequest(req, res)) {
        logRequest(req, res);
    } else if(req.url == '/') {
        res.writeHead(302, {
            'Content-Type': 'text/plain',
            'Location': '/static/firstnode_client/en/1/index.html'
        });
        res.end('Moved temporarily\n');
        logRequest(req, res);
    } else {
        paperboy
            .deliver(__dirname + '/htadmin', req, res)
            .after(function(statCode) {
                logRequest(req, res);
            })
            .otherwise(function(err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Not found\n');
                logRequest(req, res);
            });
    }
}).listen(8081, "0.0.0.0");
console.log('Admin server running at http://localhost:8081/');
