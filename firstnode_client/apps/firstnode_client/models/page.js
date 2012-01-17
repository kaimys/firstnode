FirstnodeClient.Page = SC.Record.extend({
    
    name: SC.Record.attr(String),
    
    parent: SC.Record.toOne(
        'FirstnodeClient.Page',
        { isMaster: YES, inverse: 'children' }
    ),
    
    children: SC.Record.toMany(
        'FirstnodeClient.Page',
        { isMaster: NO, inverse: 'parent' }
    ),
    
    title: function() {
        return this.get('name');
    }.property(),
    
    treeItemIsExpanded: NO,
    
    treeItemChildren: function(){
        return this.get("children");
    }.property()
});
