/* ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is Menu Editor.
 *
 * The Initial Developer of the Original Code is
 * Devon Jensen.
 *
 * Portions created by the Initial Developer are Copyright (C) 2003
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *    Devon Jensen <velcrospud@hotmail.com>
 *    Nickolay Ponomarev <asqueella@gmail.com>
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

// xxx ensure keyboard accessibility
// - make use of accesskeys for buttons

var groupbox2_width;
// a few shortcuts
var RDF = MenuEditRDF;
var util = MenuEditCommon;

var DS; //=RDF.datasource
var gDialogElement;
var Tree;
var Tree2;
var menuSelector;
var menuSelector2;

const NEW_SEPARATOR_URI = "new separator"; // value used in xfer data when a new separator is dragged from the palette
const SOME_HIDDEN = 0, ALL_VISIBLE = 1, ALL_SEPARATORS = 2;

const FLAVOUR = "application/menuedit-item";

var Dialog = {
  toApply: [],

  init: function() {
    this.applyButton = document.documentElement.getButton("extra1");
    Tree = this.el("maintree");
    Tree2 = this.el("sectree");
    menuSelector = this.el("menuSelector");
    menuSelector2 = this.el("menuSelector2");
    gDialogElement = this.el("menueditPrefs");
    this.changed = false;

    RDF.init();
    DS = RDF.datasource;

    var rootCont = RDF.makeContainer(RDF.root);

    // write the list of editable menus to rdf (add these menus if they are not
    // yet listed).
    // xxx in future when/if we support multiple windows, this will need to be
    // replaced with enumerate call
    var w = getRecentWindowForType();
    if(w) {
      var menus = w.MenuEdit.getEditableMenus();
      for(i in menus)
        RDF.addMenu(i, menus[i]);
    }

    RDF.flushDatasource();

    menuSelector.init();
    menuSelector2.init();

    // initialize the trees
    Tree.init();
    Tree2.init();
    
    groupbox2_width = this.el("maintree").boxObject.width + 90; // um, magic numbers.. the only way to deal with XUL box layout :-P ... better code is welcome though
    this.onAdvancedModeToggle(gDialogElement.getAttribute("simple") == "true");

    this.loadSelIndex("selIndex2", menuSelector2);
    this.loadSelIndex("selIndex", menuSelector);
    Tree.mTree.focus();

    // listen to <menuselector> events
    gDialogElement.addEventListener("menuedit-selectitem", function(e) {Dialog.updateButtons(e)}, false);

    this.applyButton.disabled = true; // make sure the apply button is disabled, bug 9715
  },
  
  onUnload: function() {
    gDialogElement.setAttribute("simple", this.el("groupbox2").hidden);
    // persist selected menu
    this.persistSelIndex("selIndex", menuSelector);
    this.persistSelIndex("selIndex2", menuSelector2);

    Tree.uninit();
    Tree2.uninit();
    menuSelector.uninit();
    menuSelector2.uninit();
    // xxx these calls don't actually work :(
  },

  analyzeSelection: function(aSel) {
    var type = ALL_SEPARATORS;
    for(var i in aSel) {
      var node = aSel[i];
      var currType = RDF.datasource.GetTarget(node, RDF.arcType, true);
      
      if(currType == RDF.type_menuseparator)
        continue;
      else if(!RDF.getVisibility(node) || type == SOME_HIDDEN)
        type = SOME_HIDDEN;
      else
        type = ALL_VISIBLE;
    }
    return type;
  },
  
  // update Show/Hide and Move button
  updateButtons: function(aForce) {
    var focused = document.commandDispatcher.focusedElement;

    var deck = this.el("showhide");
    deck.selectedIndex = this.analyzeSelection(Tree.selectionArray);
    deck.selectedPanel.disabled = focused != Tree.mTree ||
                                     Tree.mSelection.count == 0;
    var move = this.el("move");
    var isTreeSelected = focused && focused.localName == "tree";
    move.disabled = isTreeSelected ? focused.view.selection.count == 0 : 
                                     move.disabled;
    if(isTreeSelected || aForce)
      move.label = util.getString(focused == Tree.mTree ? "moveRight" : "moveLeft");
  },

  // invert(*) visibility of selected elements in a tree
  showHide: function(aTree) {
    if(this.analyzeSelection(aTree.selectionArray) == SOME_HIDDEN)
      doToggleShow(aTree, aTree.selectionArray, true);
    else
      doToggleShow(aTree, aTree.selectionArray);
  },

  toggleAdvanced: function() {
    var gb2 = this.el("groupbox2");
    if(!gb2.hidden) {
      groupbox2_width = gb2.boxObject.width;
      window.resizeTo(window.outerWidth - groupbox2_width, window.outerHeight);
      this.onAdvancedModeToggle(!gb2.hidden);
    } else {
      this.onAdvancedModeToggle(!gb2.hidden);
      window.resizeTo(window.outerWidth + groupbox2_width, window.outerHeight);
    }
    // xxx remember selection in tree2
  },

  onAdvancedModeToggle: function(aNewValue) {
    // Easier way to do this and still have the text wrap?
    var textnode1 = this.el("intro1").firstChild;
    var textnode2 = this.el("intro2").firstChild;
    //replaceData(offset, count, string to replace with)
    textnode1.replaceData(0,textnode1.length, util.getString(aNewValue ? "introSim1" : "introAdv1"));
    textnode2.replaceData(0,textnode2.length, util.getString(aNewValue ? "introSim2" : "introAdv2"));
    this.el("goAdvanced").label = util.getString(aNewValue ? "goAdvanced" : "goSimple");
    this.el("groupbox2").hidden = aNewValue;
    this.el("move").style.visibility = aNewValue ? "hidden" : "visible";
    this.updateButtons(true);
  },

  onMoveClick: function() {
    //XXX! implement onMoveClick
  },

  removeSeparatorsFromLeftTree: function() {
    removeSeparators(Tree.selectionArray);
    Tree.mTree.focus();
    // xxx select next item
  },

  findNew: function() {
    Dialog.changed = findNew(menuSelector) > 0;
  },

  reset: function() {
    var confirmText = util.getString("reset");
    if(!confirm(confirmText)) return;
    doReset(menuSelector);
  },

  resetAll: function() {
    var confirmText = util.getString("resetAll");
    if(!confirm(confirmText)) return;

    this.onUnload();
    RDF.clearDatasource();
    this.init();
    
    // now save settings for each of menus
    // xxx it's better to implement this on menueditoverlay level - by copying
    // stuff back from backup menu
    var sel = menuSelector.selectedIndex;
    var menus = menuSelector.popupNodes;
    for(var i=0; i<menus.length; i++) {
      menuSelector.selectedIndex = i+3; // xxx magic numbers...
      enumerateEditableWindows(function(w) { // make all menus visible
        if(menus[i].id)
            w.document.getElementById(menus[i].id.split("#")[1]).parentNode.hidden = false;
          return true;
      });
    }   
    menuSelector.selectedIndex = sel;
    Tree2.mBuilder.rebuild();
    this.saveSettings();
    this.el("showMenuCheck").checked = true;
  },

  saveSettings: function() {
    if(!this.changed) return;
    try {
      RDF.flushDatasource(); // update menuedit.rdf

      // apply changes to all open windows
      enumerateEditableWindows(function(w) {
        for(var i in Dialog.toApply)
          w.MenuEdit.editMenu(w.MenuEdit.el(Dialog.toApply[i]));
        return true;
      });
      this.changed = false;
    } catch(e) { util.dumpException(e); }
  },

  dontSave: function() {
    try {
      var rdfsource = util.QI(DS, "nsIRDFRemoteDataSource");
      rdfsource.Refresh(true);
    } catch(e) { util.dumpException(e); }
  },

  // helpers
  el: function(aID) { return document.getElementById(aID); },
  _changed: false,
  get changed() { return this._changed;  },
  set changed(aValue) {
    function findInArray(aArray, aItem) {
      for(var i in aArray) {
        if(aArray[i] == aItem)
          return true;
      }
      return false;
    }
    this._changed = aValue;

    if(aValue) {
      if(!findInArray(this.toApply, menuSelector.currId))
        this.toApply.push(menuSelector.currId);
      if(!findInArray(this.toApply, menuSelector2.currId) &&
          menuSelector2.currId != "")
        this.toApply.push(menuSelector2.currId);
    }
    
    this.applyButton.disabled = !aValue;
    return aValue;
  },

  loadSelIndex: function(aAttr, aMenuSelector) {
    var idx = gDialogElement.getAttribute(aAttr);
    if(aAttr == "selIndex")
      var minIdx = 3;
    else
      minIdx = 1;

    if(idx < minIdx || idx >= aMenuSelector.popupNodes.length)
      idx = minIdx;
    aMenuSelector.selectedIndex = idx;
  },
  persistSelIndex: function(aAttr, aMenuSelector) {
    gDialogElement.setAttribute(aAttr, aMenuSelector.selectedIndex);
  },

  toggleMenu: function() {
    var node = RDF.getResourceFromId(menuSelector.currId);
    RDF.setTarget(node, RDF.arcShow, this.el("showMenuCheck").checked ? RDF.showLit : RDF.hideLit);
    this.changed = true;
    //xxx gray out the name in menuselector?
    //menuSelector.popupNodes[menuSelector.selectedIndex].setAttribute("style", "color:gray;");
  },

  checkMenuVis: function() {
    var node = RDF.getResourceFromId(menuSelector.currId);
    this.el("showMenuCheck").checked = RDF.getVisibility(node);
  }
}

function doToggleShow(aTree, aSelection, aMakeAllVisible) {
  if(aSelection.length == 0) return;
  var changed = false;
  //DS.beginUpdateBatch();
  for(var i=0; i<aSelection.length; i++) {
    var node = aSelection[i];
    if(isSep(node)) continue;
    var visible = RDF.getVisibility(node);
    RDF.setVisibility(node, aMakeAllVisible ? true : !visible);
    changed = true;
  }
  //DS.endUpdateBatch(); xxx this causes menuselector.selectedIndex to reset to -1 :(
  aTree.mTree.focus();
  aTree.selectionArray = aSelection;
  Dialog.changed |= changed;
}

// fills the datasource for current menu, based on backup menu
// xxx this should also move items from other menus back there (?)
function doReset(aMenuSelector) {
  
  // xxx gohack
  if(aMenuSelector.currId == "goPopup") {
    var goRoot = RDF.makeContainer(RDF.getResource("NC:goPopup"));
    try {
      var num = goRoot.GetCount();
    } catch(e) {}
    if(num == 0) {
      var node = RDF.getResourceFromId("goHackId");
      goRoot.AppendElement(node);
      var name = RDF.RDFService.GetLiteral(util.getString("notImplemented"));
      RDF.setTarget(node, RDF.arcType, RDF["type_menuitem"]);
      RDF.setTarget(node, RDF.arcName, name);
      RDF.setTarget(node, RDF.arcShow, RDF.showLit);
      
    }
    return;
  }
  // end xxx gohack
  
  var w = getRecentWindowForType(aMenuSelector.currId);
  if(!w) return;
  var backup = w.MenuEdit.getBackup(w.MenuEdit.el(aMenuSelector.currId), w.document);

//  DS.beginUpdateBatch();
  var rootCont = RDF.makeContainer(aMenuSelector.currRes);
  try {
    var num = rootCont.GetCount();
  } catch(e) { // that fails when there's no list yet; shouldn't happen, but it's just a safety measure
    util.dumpException(e);
    num = 0;
  }

  // Remove all current items
  Dialog.changed = true;
  var idx = RDF.contUtils.IndexToOrdinalResource(1);
  for(var i=0; i<num; i++) {
    var child = DS.GetTarget(aMenuSelector.currRes, idx, true);
    RDF.Unassert(child, RDF.arcCustom); // remove the Custom=create arc
    rootCont.RemoveElement(child, true);
  }

  // Fill the RDF container from "backup" array data
  for(i=0; i<backup.length; i++) {
    var id = backup[i];
    var elt = w.MenuEdit.el(id);
    if(elt) { // xxx do it properly
      if(elt.localName == "menuseparator") {
        var sep = RDF.RDFService.GetAnonymousResource();
        RDF.setItemProps(sep, "menuseparator", sep.Value);
        RDF.setTarget(sep, MenuEditRDF.arcCustom, MenuEditRDF.createLit);
        rootCont.AppendElement(sep);
      } else {
        child = RDF.addItem(rootCont, elt, id);
        if(child)
          RDF.Unassert(child, RDF.arcCustom); // remove the Custom=ignore arc
      }
    }
  }
  findNew(aMenuSelector);

//  DS.endUpdateBatch();
// its is fast enough without it, and using endUpdateBatch causes a bug with <menulist>

  //Make sure menu is visible
  var node = RDF.getResourceFromId(menuSelector.currId);
  this.document.getElementById("showMenuCheck").checked = true;
  if(!RDF.getVisibility(node))
    Dialog.toggleMenu();
}

function findNew(aMenuSelector) {
  var w = getRecentWindowForType(aMenuSelector.currId);
  var count = w.MenuEdit.discoverNew(w.MenuEdit.el(aMenuSelector.currId));
}


function newSeparator() {
  var sep = RDF.RDFService.GetAnonymousResource();
  RDF.setItemProps(sep, "menuseparator", sep.Value);
  RDF.setTarget(sep, RDF.arcCustom, RDF.createLit);
  return sep;
}

function removeSeparators(aArray) {
  for(var i in aArray) {
    var sep = aArray[i];
    if(!isSep(sep))
      continue;

    var rootCont = RDF.getContainerForResource(sep);
    RDF.setTarget(sep, RDF.arcCustom, RDF.ignoreLit); // xxx delete custom separators both from RDF and from DOM
    rootCont.RemoveElement(sep, true);
  }
  Dialog.changed = true; // xxx do this in rdf observer instead
}


function addSep() {
  var sep = newSeparator();
  var rootCont = RDF.makeContainer(menuSelector.currRes);
  rootCont.InsertElementAt(sep, 1, true);
  // xxx try..catch
}

function isSep(aNode) {
  return DS.GetTarget(aNode, RDF.arcType, true) == RDF.type_menuseparator;
}


// enumerate browser/mail windows, calling f() on each of them
function enumerateEditableWindows(f) {
  var wm = util.getService("appshell/window-mediator;1", "nsIWindowMediator");
  var windows = wm.getEnumerator("");
  while(windows.hasMoreElements()) {
    var w = windows.getNext();
    if(("MenuEdit" in w) && (w.MenuEdit.loaded))
      if(!f(w)) break;
  }
}

function getRecentWindowForType(aID) { //aID - reserved for future use. Note: it may be undefined
  var recentWindow = null;
  enumerateEditableWindows(function(w) {
    recentWindow = w;
    return false;
  });

  if(!recentWindow) {
    var text = util.getString("needAppWindow");
    alert(text);
  }
  return recentWindow;
}

var Palette = {
  DNDObserver: {
    onDragStart: function(aEvent, aXferData, aDragAction) {
      var idx = Dialog.el("palette").currentIndex;
      switch(idx) {
        case 0:  // separator
          var dataSet = new TransferDataSet();
          var data = new TransferData();
          data.addDataForFlavour(FLAVOUR, NEW_SEPARATOR_URI);
          dataSet.push(data);
          aXferData.data = dataSet;
          break;
        default:
          util.dump("Unknown row in palette was dragged");
      }
    },

    canDrop: function (aEvent, aDragSession) {
      return true; // Can't drop by default. (Why this isn't the default??)
    },

    onDragOver: function(aEvent, aFlavour, aDragSession) {
      if(aFlavour.contentType != FLAVOUR) {
        aDragSession.canDrop = false;
        return;
      }
      var sel = MyDNDUtils.getSelectionFromXferData(aDragSession);
      for(var i in sel) { // only accept if all items in selection are separators
        if(!isSep(sel[i])) {
          aDragSession.canDrop = false;
          return;
        }
      }
      aDragSession.canDrop = true;
    },

    onDrop: function(aEvent, aXferData, aDragSession) {
      var sel = MyDNDUtils.getSelectionFromXferData(aDragSession);
      removeSeparators(sel);
    },

    getSupportedFlavours: function() {
      var flavourSet = new FlavourSet();
      flavourSet.appendFlavour(FLAVOUR);
      return flavourSet;
    }
  },
  
  onDragGesture: function(aEvent) {
    if(aEvent.target.localName == "treechildren")
      nsDragAndDrop.startDrag(aEvent, this.DNDObserver);
  }
};


var MyDNDUtils = {
  getXferDataFromSelection: function(aSelection)
  {
    if (aSelection.length == 0)
      return null;
    var dataSet = new TransferDataSet();
    var data, item;
    for (var i=0; i<aSelection.length; i++) {
      data = new TransferData();
      item = aSelection[i].Value;
      data.addDataForFlavour(FLAVOUR, item);
      dataSet.push(data);
    }
    return dataSet;
  },

  getSelectionFromXferData: function(aDragSession)
  {
    var selection = [];
    var trans = Components.classes["@mozilla.org/widget/transferable;1"]
                          .createInstance(Components.interfaces.nsITransferable);
    trans.addDataFlavor(FLAVOUR);
    var uri, rSource;
    for (var i=0; i<aDragSession.numDropItems; i++) {
      var bestFlavour = {}, dataObj = {}, len = {};
      aDragSession.getData(trans, i);
      trans.getAnyTransferData(bestFlavour, dataObj, len); //xxx
      dataObj = util.QI(dataObj.value, "nsISupportsString");
      if (!dataObj)
        continue;
      uri = dataObj.data;
      if(uri == NEW_SEPARATOR_URI) {
        rSource = newSeparator();
      } else
        rSource = RDF.getResource(uri);
      selection.push(rSource);
    }
    return selection;
  }
};

