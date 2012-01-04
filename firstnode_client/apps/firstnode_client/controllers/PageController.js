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
    }
    
    
});
