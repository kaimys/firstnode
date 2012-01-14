/**
 *  REST service
 */

var URL = require('url');

exports.service = function (endpoint) {
    return new RestService(endpoint);
};

function RestService(endpoint) {
    this.endpoint = endpoint;
}

RestService.prototype.handleRequest = function(req, res) {
    var self = this;
    if(req.url.startsWith(this.endpoint)) {
        var url = URL.parse(req.url, true);
        var path = url.pathname.substr(self.endpoint.length);
        if(req.method == 'GET') {
            if(path == 'index') {
                this.index(url.query, res);
            } else if(path.startsWith('id/')) {
                var id = path.substr('id/'.length);
                this.get(id, res);
            } else {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Not found', content: null}));
            }
        } else if(req.method == 'PUT' || req.method == 'DELETE') {
            if(path.startsWith('id/')) {
                var id = path.substr('id/'.length);
                if(req.method == 'DELETE') {
                    this.del(id, req);
                } else {
                    var body = '';
                    req.on('data', function(chunk) {
                        // append the current chunk of data to the body variable
                        body += chunk.toString();
                    });
                    req.on('end', function() {
                        console.log(body);
                        var obj = JSON.parse(body);
                        if(id != obj.guid) {
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: 'URL and guid doesn\'t match', content: null}));
                        } else {
                            self.put(obj, res);
                       }
                    });
                }
            } else {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Not found', content: null}));
            }
        } else if(req.method == 'POST') {
            this.post(req, res);
        } else {
            res.writeHead(405, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Method not allowed', content: null}));
        }
        return true;
    }
    return false;
};

RestService.prototype.index = function(query, res) {
    res.writeHead(501, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Method not implemented', content: null}));
};

RestService.prototype.get = function(id, res) {
    res.writeHead(501, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Method not implemented', content: null}));
};

RestService.prototype.del = function(id, res) {
    res.writeHead(501, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Method not implemented', content: null}));
};

RestService.prototype.post = function(req, res) {
    res.writeHead(501, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Method not implemented', content: null}));
};

RestService.prototype.put = function(id, res) {
    res.writeHead(501, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Method not implemented', content: null}));
};
