/**
 * Page Class
 */

exports.Page = Page;

exports.create = function(name) {
    return new Page(name);
};

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
