// ==========================================================================
// Project:   FirstnodeClient.PageDataSource
// Copyright: @2011 My Company, Inc.
// ==========================================================================
/*globals FirstnodeClient */

FirstnodeClient.ALL_PAGES_QUERY = SC.Query.local(FirstnodeClient.Page);

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
FirstnodeClient.PageDataSource = SC.DataSource.extend(
/** @scope FirstnodeClient.PageDataSource.prototype */ {

    fetch: function(store, query) {
        SC.Request
            .getUrl('/services/content/index')
            .header({'Accept': 'application/json'})
            .json()
            .notify(this, 'didFetchPages', store, query)
            .send();
        return YES;
    },
    
    didFetchPages: function(response, store, query) {
        if (SC.ok(response)) {
            store.loadRecords(FirstnodeClient.Page, response.get('body').content);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    // ..........................................................
    // RECORD SUPPORT
    // 
  
    retrieveRecord: function(store, storeKey) {
        SC.Request
            .getUrl('/services/content/id/' + store.idFor(storeKey))
            .header({'Accept': 'application/json'})
            .json()
            .notify(this, 'didRetrieveRecord', store, storeKey)
            .send();
        return YES;
    },
    
    didRetrieveRecord: function(response, store, storeKey) {
        if (SC.ok(response)) {
            var dataHash = response.get('body').content;
            store.dataSourceDidComplete(storeKey, dataHash);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    createRecord: function(store, storeKey) {  
        console.log('createRecord: ' + store.idFor(storeKey));
        if (SC.kindOf(store.recordTypeFor(storeKey), FirstnodeClient.Page)) {
            SC.Request
                .postUrl('/services/content/')
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didCreateRecord, store, storeKey)
                .send(store.readDataHash(storeKey));
            return YES;
        } else {
            return NO;
        }
    },
    
    didCreateRecord: function(response, store, storeKey) {
        console.log('didCreateRecord: ' + store.idFor(storeKey));
        if (SC.ok(response)) {
            var dataHash = response.get('body').content;
            store.dataSourceDidComplete(storeKey, dataHash, dataHash.guid);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },
  
    updateRecord: function(store, storeKey) {
        console.log('updateRecord: ' + store.idFor(storeKey));
        if (SC.kindOf(store.recordTypeFor(storeKey), FirstnodeClient.Page)) {
            SC.Request
                .putUrl('/services/content/id/' + store.idFor(storeKey))
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didUpdateRecord, store, storeKey)
                .send(store.readDataHash(storeKey));
            return YES;
        } else {
            return NO ;
        }
    },
    
    didUpdateRecord: function(response, store, storeKey) {
        if (SC.ok(response)) {
          var data = response.get('body');
          if (data) data = data.content; // if hash is returned; use it.
          store.dataSourceDidComplete(storeKey, data) ;
        } else {
            store.dataSourceDidError(storeKey);
        }
    },
  
    destroyRecord: function(store, storeKey) {
        console.log('destroyRecord: ' + store.idFor(storeKey));
        if (SC.kindOf(store.recordTypeFor(storeKey), FirstnodeClient.Page)) {
            SC.Request
                .deleteUrl('/services/content/id/' + store.idFor(storeKey))
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didDestroyRecord, store, storeKey)
                .send();
            return YES;
        } else {
            return NO ;
        }
    },
    
    didDestroyRecord: function(response, store, storeKey) {
        if (SC.ok(response)) {
            store.dataSourceDidDestroy(storeKey);
            var data = response.get('body');
            if (data) data = data.content; // if hash is returned; use it.
        } else {
            store.dataSourceDidError(storeKey);
        }
    }

}) ;
