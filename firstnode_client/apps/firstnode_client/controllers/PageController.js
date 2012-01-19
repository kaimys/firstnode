FirstnodeClient.pageController = SC.ObjectController.create({
    
    inEditingMode: false,

    onEditPage: function() {
        console.log('onEditPage ' + this.get('id'));
        this.set('inEditingMode', true);
    },
    
    onSavePage: function() {
        console.log('onSavePage ' + this.get('id'));
        this.set('inEditingMode', false);
        FirstnodeClient.store.commitRecord(FirstnodeClient.Page, this.get('id'));
    },
    
    onPublishPage: function() {
        console.log('onPublishPage ' + this.get('id'));
        this.set('inEditingMode', false);
    },
    
    onCancelPage: function() {
        console.log('onCancelPage ' + this.get('id'));
        this.set('inEditingMode', false);
    },
    
    onDeletePage: function() {
        console.log('onDeletePage ' + this.get('id'));
        this.set('inEditingMode', false);
        this.get('content').set('parent', null);
        this.get('content').destroy();
        FirstnodeClient.store.commitRecord(FirstnodeClient.Page, this.get('id'));
    },
    
    onAddChild: function() {
        console.log('onAddChild ' + this.get('id'));
        var newPage = FirstnodeClient.store.createRecord( FirstnodeClient.Page, { name: 'New page' });
        FirstnodeClient.store.commitRecord(FirstnodeClient.Page, undefined, newPage.storeKey, undefined, function() {
            newPage.set('parent', FirstnodeClient.pageController.get('content'));
            FirstnodeClient.treeController.selectObject(newPage);
            FirstnodeClient.pageController.set('inEditingMode', true);            
        });
    }
    
});
