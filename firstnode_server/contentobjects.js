/**
 * Page Class
 */

exports.Page = Page;

function Page(guid, name) {
    console.log('new Page(' + guid + ', ' + name + ')');
    this.name = name;
    this.guid = guid;
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

//TODO Add index for faster lookup

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

Page.prototype.toArray = function() {
    var json = {
        guid: this.guid,
        name: this.name,
        children: [],
        parent: null
    };
    if(this.parent != null)
        json.parent = this.parent.guid;
    this.children.forEach(function(child) {
        json.children.push(child.guid);
    });
    return json;
}