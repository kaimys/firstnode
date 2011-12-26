FirstnodeClient.treeController = SC.TreeController.create(
/** @scope FirstnodeClient.treeController.prototype */ {
  
    content: null,
  
    count: 0,
    countBinding: "*arrangedObjects.length",
  
    countLabel: function() {
        return "%@ visible items in list".fmt(this.get('count'));
    }.property('count').cacheable()

}) ;

FirstnodeClient.treeSelectionController = SC.ObjectController.create({
    contentBinding: 'FirstnodeClient.treeController.selection'
});
