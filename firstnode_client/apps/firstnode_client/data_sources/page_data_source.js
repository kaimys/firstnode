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
            .getUrl('/services/page/list')
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
            .getUrl('/services/page/id/' + store.idFor(storeKey))
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
    
    // TODO: Add handlers to submit new records to the data source.
    // call store.dataSourceDidComplete(storeKey) when done.
    
    return NO ; // return YES if you handled the storeKey
  },
  
  updateRecord: function(store, storeKey) {
    
    // TODO: Add handlers to submit modified record to the data source
    // call store.dataSourceDidComplete(storeKey) when done.

    return NO ; // return YES if you handled the storeKey
  },
  
  destroyRecord: function(store, storeKey) {
    
    // TODO: Add handlers to destroy records on the data source.
    // call store.dataSourceDidDestroy(storeKey) when done
    
    return NO ; // return YES if you handled the storeKey
  }
  
}) ;
