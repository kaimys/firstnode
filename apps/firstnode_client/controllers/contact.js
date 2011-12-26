FirstnodeClient.contactsController = SC.ArrayController.create({
    allowsMultipleSelection: NO,
    content: [
        SC.Object.create({
            name: "Devin Torres",
            phone: "(555) 391-1419",
            address: "214 12th St. Austin, TX 78701",
            website: 'http://www.linkedin.com/in/devintorres'
        }),
         
        SC.Object.create({
            name: "Charles Jolley",
            phone: "(555) 749-1585",
            address: "378 16th St. Austin, TX 78701",
            website: 'http://www.linkedin.com/in/charlesjolley'
        }),
         
        SC.Object.create({
            name: "Peter Wagenet",
            phone: "(555) 856-3750",
            address: "935 2nd St. Austin, TX 78701",
            website: 'http://www.linkedin.com/in/wagenet'
        })
    ]
});

FirstnodeClient.contactController = SC.ObjectController.create({
    contentBinding: 'FirstnodeClient.contactsController.selection'
});
