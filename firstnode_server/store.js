var cobj = require('./contentobjects');

exports.readFixtures = function(fixtures, startId) {
    root = buildTree(fixtures, startId);
};

exports.getObject = function (id) {
    return pages[id];
};

exports.getRoot = function () {
    return root;
};

exports.getArray = function () {
    var arr = [];
    for(var id in pages) {
        arr.push(pages[id].toArray());
    }
    return arr;
};

var pages = {};
var root = null;

function buildTree(fixtures, id) {
    var ret;
    fixtures.forEach(function(page) {
        if(id == page.guid) {
            ret = new cobj.Page(page.guid, page.name);
            page.children.forEach(function(childId) {
                ret.addChild(buildTree(fixtures, childId));
            });
            pages[page.guid] = ret;
        }
    });
    return ret;
}
