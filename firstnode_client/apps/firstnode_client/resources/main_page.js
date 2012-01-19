// ==========================================================================
// Project:   FirstnodeClient - mainPage
// Copyright: @2011 My Company, Inc.
// ==========================================================================
/*globals FirstnodeClient */

// This page describes the main user interface for your application.  
FirstnodeClient.mainPage = SC.Page.design({

    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page 
    // load.
    mainPane: SC.MainPane.design({
      childViews: 'labelView'.w(),
      
      labelView: SC.LabelView.design({
          childViews: 'workspaceView'.w(),
          
          workspaceView: SC.WorkspaceView.design({
              
              topToolbar: SC.ToolbarView.design({
                  
                  childViews: [SC.LabelView.design({
                      layout: { top: 12, left: 12 },
                      tagName: 'h1',
                      textAlign: SC.ALIGN_LEFT,
                      value: "firstnode"
                  })]
              }),
              
              contentView: SC.SplitView.design({
                  dividerThickness: 3,
                  defaultThickness: 300,
                  
                  topLeftView: SC.ScrollView.design(SC.Border, {  // TODO Deprecated
                      borderStyle: SC.BORDER_GRAY,
                      hasHorizontalScroller: YES,
                      
                      contentView: SC.SourceListView.design({
                          contentValueKey: 'title',
                          contentBinding: "FirstnodeClient.treeController.arrangedObjects",
                          selectionBinding: 'FirstnodeClient.treeController.selection'
                      })
                  }),
                      
                  bottomRightView: SC.View.design({
                      childViews: 'usageHint contactDetails'.w(),
                      
                      usageHint: SC.View.design({
                          classNames: 'app-usage-hint',
                          isVisibleBinding: SC.Binding.not('FirstnodeClient.treeController.hasSelection'),
                       
                          childViews: [SC.LabelView.design({
                              layout: { width: 300, height: 48, centerX: 0, centerY: 0 },
                              tagName: 'h1',
                              textAlign: SC.ALIGN_CENTER,
                              value: "Select a page"
                          })]
                      }),
                      
                      contactDetails: SC.View.design({
                          layout: { top: 50, left: 50, bottom: 50, right: 50 },
                          childViews: 'menuButtons viewDetails editDetails'.w(),
                          isVisibleBinding: SC.Binding.bool('FirstnodeClient.treeController.hasSelection'),
                          
                          menuButtons: SC.SegmentedView.design({
                              align: SC.ALIGN_LEFT,
                              items: [ 
                                      {title:'Edit', action:'onEditPage', target:'FirstnodeClient.pageController', isEnabled: true}, 
                                      {title:'Save', action:'onSavePage', target:'FirstnodeClient.pageController', isEnabled: true},
                                      {title:'Publish', action:'onPublishPage', target:'FirstnodeClient.pageController', isEnabled: true},
                                      {title:'Delete', action:'onDeletePage', target:'FirstnodeClient.pageController', isEnabled: true},
                                      {title:'Add child', action:'onAddChild', target:'FirstnodeClient.pageController', isEnabled: true},
                                      {title:'Cancel', action:'onCancelPage', target:'FirstnodeClient.pageController', isEnabled: true},
                              ],
                              itemTitleKey:'title', 
                              itemActionKey:'action', 
                              itemTargetKey:'target',
                              itemIsEnabledKey: 'isEnabled'
                          }),
                          
                          viewDetails: SC.View.design({
                              childViews: 'idLabel titleLabel'.w(),
                              isVisibleBinding: SC.Binding.not('FirstnodeClient.pageController.inEditingMode'),
                              
                              idLabel: SC.LabelView.design({
                                  layout: { top: 40, width: 500, height: 18 },
                                  valueBinding: SC.Binding.oneWay('FirstnodeClient.pageController.id')
                              }),
                              
                              titleLabel: SC.LabelView.design({
                                  layout: { top: 80, width: 500, height: 18 },
                                  valueBinding: SC.Binding.oneWay('FirstnodeClient.pageController.name')
                              })
                             
                          }),
                          
                          editDetails: SC.View.design({
                              childViews: 'idLabel titleField'.w(),
                              isVisibleBinding: SC.Binding.bool('FirstnodeClient.pageController.inEditingMode'),
                              
                              idLabel: SC.LabelView.design({
                                  layout: { top: 40, width: 500, height: 18 },
                                  valueBinding: SC.Binding.oneWay('FirstnodeClient.pageController.id')
                              }),

                              titleField: SC.TextFieldView.design({
                                  layout: { top: 80, width: 500, height: 18 },
                                  valueBinding: 'FirstnodeClient.pageController.name'
                              })
                          })                          
                      })
                  })
              })
          })
      })
  })
});
