var global = this;

var moduleRoot;
var TagTreeView;
var view;
var treeBox = {
    rowCountChanged: function () {},
    invalidateRow: function () {}
};

function warmUp() {
    moduleRoot = Components.utils.import("resource://hatenabookmark/modules/base.jsm", {});
    moduleRoot.require("ModelTemp");
    TagTreeView = moduleRoot.require("Widget.TagTreeView");
}

function setUp() {
    var helper = { utils: utils };
    utils.include('btil.js', helper);
    helper.load(global);

    var Tag = model("Tag");
    [
        [1, "Perl"], [1, "Ruby"], [1, "JavaScript"],
        [2, "Perl"], [2, "Ruby"],
        [3, "Ruby"], [3, "JavaScript"],
    ].forEach(function ([bmId, name]) {
        var tag = new Tag();
        tag.bookmark_id = bmId;
        tag.name = name;
        tag.save();
    });

    moduleRoot.hBookmark.Model.db = hBookmark.Model.db;

    view = new TagTreeView();
    view.setTree(treeBox);
}

function testTagTreeView() {
    assert.equals(view.rowCount, 3);
    var cellTexts = [0, 1, 2].map(function (i) view.getCellText(i, {}));
    assert.equals(cellTexts.concat().sort(), ["JavaScript", "Perl", "Ruby"]);
    assert.equals(cellTexts[1], "Perl");
    assert.equals(view.isContainer(1), true);
    assert.equals(view.isContainerEmpty(1), false);
}

function testOpenClose() {
    view.toggleOpenState(1);
    assert.equals(view.rowCount, 5);

    assert.equals(view.getLevel(2), 1);
    assert.equals(view.getParentIndex(2), 1);
    assert.equals(view.hasNextSibling(2), true);

    assert.equals(view.getLevel(4), 0);
    assert.equals(view.getParentIndex(4), -1);
    assert.equals(view.hasNextSibling(4), false);

    view.toggleOpenState(1);
    assert.equals(view.rowCount, 3);

    assert.equals(view.isContainerOpen(1), false);

    assert.equals(view.getLevel(2), 0);
    assert.equals(view.getParentIndex(2), -1);
    assert.equals(view.hasNextSibling(2), false);
}

function testSelection() {
    view.selection = { currentIndex: 1 };
    assert.equals(view.selectedTags.join(), ["Perl"].join());

    view.toggleOpenState(1);
    view.selection.currentIndex = 2;
    assert.equals(view.selectedTags.join(), ["Perl", "JavaScript"].join());
}
