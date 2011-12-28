FirstnodeClient.treeController = SC.TreeController.create(
/** @scope FirstnodeClient.treeController.prototype */ {
  
    content: null,

}) ;

FirstnodeClient.treeSelectionController = SC.ObjectController.create({
    contentBinding: 'FirstnodeClient.treeController.selection'
});
