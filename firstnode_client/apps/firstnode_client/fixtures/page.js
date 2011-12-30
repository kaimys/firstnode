sc_require('models/page');

FirstnodeClient.Page.FIXTURES = [
    { guid: 1, name: "Root", parent: 0, children: [2, 3, 4, 5] },
    { guid: 2, name: "tv", parent: 1, children: [6, 7, 8] },
    { guid: 3, name: "personen", parent: 1, children: [] },
    { guid: 4, name: "service", parent: 1, children: [] },
    { guid: 5, name: "video", parent: 1, children: [] },
    { guid: 6, name: "Anna_und_die_Liebe", parent: 2, children: [] },
    { guid: 7, name: "Die_Harald_Schmidt_Show", parent: 2, children: [] },
    { guid: 8, name: "Sat.1_Nachrichten", parent: 2, children: [] },
];
