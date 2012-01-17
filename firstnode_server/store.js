var cobj = require('./contentobjects');

exports.getRoot = function () {
    return root;
};

exports.getObject = function (id) {
    return pages[id];
};

exports.getObjectByPath = function (path) {
    var pathArray = decodeURI(path).split('/');
    pathArray.shift();
    var page = root;
    pathArray.forEach(function (pathElement) {
        if(page != null && pathElement != '') {
            page = page.getChild(pathElement);
        }
    });
    return page;
};

exports.query = function (query) {
    var arr = [];
    for(var id in pages) {
        arr.push(pages[id].toArray());
    }
    return arr;
};

exports.remove = function (id) {
    return remove(id);
};

exports.readFixtures = function (fixtures, startId) {
    root = buildTree(fixtures, startId);
};

var pages = {};
var root = null;

function buildTree(fixtures, id) {
    var ret;
    fixtures.forEach(function(page) {
        if(id == page.guid) {
            ret = new cobj.Page(page.guid, page.name);
            fixtures.forEach(function(child) {
                if(child.parent == ret.guid)
                    ret.addChild(buildTree(fixtures, child.guid));
            });
            pages[page.guid] = ret;
        }
    });
    return ret;
}

function remove(id) {
    if(id in pages) {
        var page = pages[id];
        page.children.forEach(function (child) {
            remove(child.guid);
        });
        if(page.hasParent()) {
            var removed = page.parent.removeChild(id);
        }
        delete pages[id];
        return page;
    } else {
        return null;
    }
}