/* vim:ts=4:sts=4:sw=4:
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ajax.org Code Editor (ACE).
 *
 * The Initial Developer of the Original Code is
 * Mihai Sucan.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Mihai Sucan <mihai.sucan@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

if (typeof process !== "undefined") {
    require("../support/paths");
}

define(function(require, exports, module) {

var Buffer = require("ace/model/buffer").Buffer;
var Window = require("ace/model/window").Window;
var WindowController = require("ace/window_controller").WindowController;
var WindowViewMock = require("ace/view/window_view_mock").WindowViewMock;
var Search = require("ace/search").Search;

var assert = require("ace/test/assertions");

var lipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
             "Mauris at arcu mi, eu lobortis mauris. Quisque ut libero eget " +
             "diam congue vehicula. Quisque ut odio ut mi aliquam tincidunt. " +
             "Duis lacinia aliquam lorem eget eleifend. Morbi eget felis mi. " +
             "Duis quam ligula, consequat vitae convallis volutpat, blandit " +
             "nec neque. Nulla facilisi. Etiam suscipit lorem ac justo " +
             "sollicitudin tristique. Phasellus ut posuere nunc. Aliquam " +
             "scelerisque mollis felis non gravida. Vestibulum lacus sem, " +
             "posuere non bibendum id, luctus non dolor. Aenean id metus " +
             "lorem, vel dapibus est. Donec gravida feugiat augue nec " +
             "accumsan.Lorem ipsum dolor sit amet, consectetur adipiscing " +
             "elit. Nulla vulputate, velit vitae tincidunt congue, nunc " +
             "augue accumsan velit, eu consequat turpis lectus ac orci. " +
             "Pellentesque ornare dolor feugiat dui auctor eu varius nulla " +
             "fermentum. Sed aliquam odio at velit lacinia vel fermentum " +
             "felis sodales. In dignissim magna eget nunc lobortis non " +
             "fringilla nibh ullamcorper. Donec facilisis malesuada elit " +
             "at egestas. Etiam bibendum, diam vitae tempor aliquet, dui " +
             "libero vehicula odio, eget bibendum mauris velit eu lorem.\n" +
             "consectetur";

module.exports = {
    
    setUp: function() {
        this.buffer = new Buffer(lipsum);
        this.selection = this.buffer.getSelection();
        this.search = new Search();
        this.win = new Window({}, this.search);    
        this.winController = new WindowController(this.win, new WindowViewMock());    
        this.win.setBuffer(this.buffer);
    },

    "test: highlight selected words by default": function() {
        assert.equal(this.win.getHighlightSelectedWord(), true);
    },

    "test: highlight a word": function() {
        this.win.moveCursorTo(0, 9);
        this.selection.selectWord();

        var range = this.selection.getRange();
        assert.equal(this.buffer.getTextRange(range), "ipsum");
        assert.equal(this.buffer._selectionOccurrences.length, 1);
    },

    "test: highlight a word and clear highlight": function() {
        this.win.moveCursorTo(0, 8);
        this.selection.selectWord();

        var range = this.selection.getRange();
        assert.equal(this.buffer.getTextRange(range), "ipsum");
        assert.equal(this.buffer._selectionOccurrences.length, 1);

        this.buffer.getMode().clearSelectionHighlight(this.win);
        assert.equal(this.buffer._selectionOccurrences.length, 0);
    },

    "test: highlight another word": function() {
        this.selection.moveCursorTo(0, 14);
        this.selection.selectWord();

        var range = this.selection.getRange();
        assert.equal(this.buffer.getTextRange(range), "dolor");
        assert.equal(this.buffer._selectionOccurrences.length, 3);
    },

    "test: no selection, no highlight": function() {
        this.selection.clearSelection();
        assert.equal(this.buffer._selectionOccurrences.length, 0);
    },

    "test: select a word, no highlight": function() {
        this.win.setHighlightSelectedWord(false);
        this.selection.moveCursorTo(0, 14);
        this.selection.selectWord();

        var range = this.selection.getRange();
        assert.equal(this.buffer.getTextRange(range), "dolor");
        assert.equal(this.buffer._selectionOccurrences.length, 0);
    },

    "test: select a word with no matches": function() {
        this.win.setHighlightSelectedWord(true);

        var currentOptions = this.search.getOptions();
        var newOptions = {
            wrap: true,
            wholeWord: true,
            caseSensitive: true,
            needle: "Mauris"
        };
        this.search.set(newOptions);

        var match = this.search.find(this.buffer);
        assert.notEqual(match, null, "found a match for 'Mauris'");

        this.search.set(currentOptions);

        this.selection.setSelectionRange(match);

        assert.equal(this.buffer.getTextRange(match), "Mauris");
        assert.equal(this.buffer._selectionOccurrences.length, 0);
    },

    "test: partial word selection 1": function() {
        this.selection.moveCursorTo(0, 14);
        this.selection.selectWord();
        this.selection.selectLeft();

        var range = this.selection.getRange();
        assert.equal(this.buffer.getTextRange(range), "dolo");
        assert.equal(this.buffer._selectionOccurrences.length, 0);
    },

    "test: partial word selection 2": function() {
        this.selection.moveCursorTo(0, 13);
        this.selection.selectWord();
        this.selection.selectRight();

        var range = this.selection.getRange();
        assert.equal(this.buffer.getTextRange(range), "dolor ");
        assert.equal(this.buffer._selectionOccurrences.length, 0);
    },

    "test: partial word selection 3": function() {
        this.selection.moveCursorTo(0, 14);
        this.selection.selectWord();
        this.selection.selectLeft();
        this.selection.shiftSelection(1);

        var range = this.selection.getRange();
        assert.equal(this.buffer.getTextRange(range), "olor");
        assert.equal(this.buffer._selectionOccurrences.length, 0);
    },

    "test: select last word": function() {
        this.selection.moveCursorTo(0, 1);

        var currentOptions = this.search.getOptions();
        var newOptions = {
            wrap: true,
            wholeWord: true,
            caseSensitive: true,
            backwards: true,
            needle: "consectetur"
        };
        this.search.set(newOptions);

        var match = this.search.find(this.buffer);
        assert.notEqual(match, null, "found a match for 'consectetur'");
        assert.position(match.start, 1, 0);

        this.search.set(currentOptions);

        this.selection.setSelectionRange(match);

        assert.equal(this.buffer.getTextRange(match), "consectetur");
        assert.equal(this.buffer._selectionOccurrences.length, 2);
    }
};

});

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}