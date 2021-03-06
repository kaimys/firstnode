// TODO FirstnodeClient.TreeItem is currently not used
FirstnodeClient.TreeItem = SC.Object.extend({
    
    page: null,
    
    id: function() {
        return this.page.get('id');
    }.property(),
    
    title: function() {
        return this.page.get('name');
    }.property(),
    
    treeItemIsExpanded: NO,
    
    treeItemChildren: function() {
        var items = [];
        this.page.get("children").forEach(function(child) {
            var item = FirstnodeClient.TreeItem.create({
                page: child
            });
            items.push(item);
        });
        return items;
    }.property()
    
});

FirstnodeClient.treeController = SC.TreeController.create(
/** @scope FirstnodeClient.treeController.prototype */ {
  
    content: null,

    selectionObserver: function() {
        if(this.hasSelection()) {
            console.log('selectionObserver: Page ' + this.selection().firstObject().get('title') + ' selected');
            FirstnodeClient.pageController.set('content', this.selection().firstObject());
        }
    }.observes("selection")

}) ;

FirstnodeClient.treeSelectionController = SC.ObjectController.create({
    contentBinding: 'FirstnodeClient.treeController.selection'
});
