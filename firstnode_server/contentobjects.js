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

Page.prototype.getChild = function(nameOrId) {
    for(var i = 0; i < this.children.length; i++) {
        if(typeof nameOrId === 'string' && this.children[i].name == nameOrId ||
                typeof nameOrId === 'number' && this.children[i].guid == nameOrId) {
            return this.children[i];
        }
    }
    return null;
};

Page.prototype.removeChild = function(nameOrId) {
    for(var i = 0; i < this.children.length; i++) {
        if(typeof nameOrId === 'string' && this.children[i].name == nameOrId || 
                typeof nameOrId === 'number' && this.children[i].guid === nameOrId) {
            return this.children.splice(i, 1);
        }
    }
    return null;
};

Page.prototype.containsChild = function(nameOrId) {
    return this.getChild(nameOrId) != null;
};

Page.prototype.hasParent = function() {
    return this.parent != null;
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