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

/* Menu editor stores its data in a datasource of the following structure:
 ****************
 xmlns:a=
 xmlns:b=
  NC:MenuEditRoot  ----NC:Version-->  version string, eg. "20050202"
    |
    * NC:contentAreaContextMenu  ----NC:Name--> "Context menu"
                                 ----NC:Visibility--> "visible"/"hidden"
          |
          * item1  ----NC:Visibility--> "visible"/"hidden"
                   ----NC:Name--> "Display name of item 1"
                   ----RDF:type-> BookmarkSeparator/Menuitem/Menu
                               (see prefs.xul about BookmarkSeparator voodoo)
                   ----NC:Custom--> "create"/"ignore" (should the item be
                         created by ME or should an existing item be ignored)
          * item2
          * ...
    * NC:menu_FilePopup
          | ...
    * NC:menu_EditPopup
          | ...
    * ...
 ****************

  Often-used resources are stored as members of MenuEditRDF [initialized in
  init()]. They are:
   - NC:MenuEditRoot: root
   - Arcs: arcVersion/arcShow/arcName/arcType
   - Type literals: type_menuseparator/type_menuitem/type_menu
   - Visibility literals: showLit/hideLit
   - Literals for "Custom" arc:
        createLit  -- the item should be created by Menu Editor (currently only applies to separators)
        ingoreLit  -- must always be used for separators (if it isn't, the datasource format is old).
                      When set on regular menu items, it means that the item is appended to the popup
                      at run-time, and therefore is allowed to be absent when in populateMenu.
                    (xxx this definitely needs to be changed when we change the datasource format.)
        <none>

  MenuEditRDF object contains a lot of helper functions, which
  can be separated in the following groups:
   - datasource (MenuEditRDF.datasource) <-> file (MenuEditRDF.datasourceFile):
       initDatasource / flushDatasource
   - RDF level helpers: getContainer/getChild/
   // xxx ...
   
XXX! need to simplify this file a bit
*/

var MenuEditRDF = {
  version: "20050202+", // datasource version
  datasourceFilename: "menuedit.rdf",
  bakFilename: "menuedit.bak",


  RDFService: null, // nsIRDFService
  contUtils: null,  // nsIRDFContainerUtils
  datasource: null, // nsIRDFDataSource, menuedit.rdf
  
  ARC_NS: "http://home.netscape.com/NC-rdf#",

  // init() initialize helper objects, datasource and check its version
  init: function() {
    this.RDFService = MenuEditCommon.getService("rdf/rdf-service;1", "nsIRDFService");
    this.contUtils = MenuEditCommon.getService("rdf/container-utils;1", "nsIRDFContainerUtils");

    function getArc(aName) {
      return MenuEditRDF.RDFService.GetResource(MenuEditRDF.ARC_NS + aName);
    }
    this.arcVersion = getArc("Version");
    this.arcShow = getArc("Visibility");
    this.arcName = getArc("Name");
    this.arcCustom = getArc("Custom");
    this.arcType = this.getResource("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
    this.type_menuseparator = this.getResource("http://home.netscape.com/NC-rdf#BookmarkSeparator");
    this.type_menuitem = this.getResource("http://home.netscape.com/NC-rdf#Menuitem");
    this.type_menu = this.getResource("http://home.netscape.com/NC-rdf#Menu");
    this.type_other = this.getResource("http://home.netscape.com/NC-rdf#Other");
    this.showLit = this.RDFService.GetLiteral("visible");
    this.hideLit = this.RDFService.GetLiteral("hidden");
    this.createLit = this.RDFService.GetLiteral("create");
    this.ignoreLit = this.RDFService.GetLiteral("ignore");
    this.root = this.getResource("NC:MenuEditRoot");

    this.initDatasource();
    this.checkVersion();
  },

  // datasource functions
  get profileDir() {
    return MenuEditCommon.getService("file/directory_service;1",
      "nsIProperties").get("ProfD", Components.interfaces.nsILocalFile);
  },
  get datasourceFile() {
    var file = this.profileDir;
    file.append(this.datasourceFilename);
    return file;
  },
  initDatasource: function() {
    var ios = MenuEditCommon.getService("network/io-service;1", "nsIIOService");
    var uri = ios.newFileURI(this.datasourceFile).spec;
    this.datasource = this.RDFService.GetDataSourceBlocking(uri);
  },
  flushDatasource: function () {
    // xxx we want to make sure we always write this version
    this.setVersion();

    var rdfsource = MenuEditCommon.QI(this.datasource, "nsIRDFRemoteDataSource");
    rdfsource.Flush();
  },
  clearDatasource: function () {
    this.datasourceFile.moveTo(this.profileDir, this.bakFilename);
    // If we don't do this, RDFService seems to give us the same unrefreshed ds:
    this.RDFService.UnregisterDataSource(this.datasource);
    this.initDatasource();
  },


  // container functions
  
  // return nsIRDFContainer for given QName (like NC:blahblah)
  getContainer: function(aName) {
    var resource = this.getResource(aName);
    return this.contUtils.MakeSeq(this.datasource, resource);
  },
  makeContainer: function(aRes) {
    return this.contUtils.MakeSeq(this.datasource, aRes);
  },
  // return the aIndex-th child of given nsIRDFResource (aCont)
  getChild: function(aCont, aIndex) {
    var index = this.contUtils.IndexToOrdinalResource(aIndex);
    return this.datasource.GetTarget(aCont, index, true);
  },

  // resource functions
  getResourceFromId: function(aID) {
    return this.RDFService.GetResource("http://home.netscape.com/NC-rdf#" + aID);
  },
  // uri or QName -> nsIRDFResource
  getResource: function(aURI) {
    return this.RDFService.GetResource(aURI);
  },
  
  // id -> QName
  menuToRDFResource: function(aMenuID) {
    return "NC:" + aMenuID;
  },
  // nsIRDFResource -> id
  getResourceId: function(aResource) {
    aResource = MenuEditCommon.QI(aResource, "nsIRDFResource");
    return aResource.Value.split("#")[1];
  },

  setTarget: function(aNode, aArc, aValue) {
    var currentValue = this.datasource.GetTarget(aNode, aArc, true);
    if(currentValue != null)
      this.datasource.Change(aNode, aArc, currentValue, aValue);
    else
      this.datasource.Assert(aNode, aArc, aValue, true);
  },
  Unassert: function(aNode, aArc) {
    MenuEditCommon.QI(aNode, "nsIRDFResource");
    var val = this.datasource.GetTarget(aNode, aArc, true);
    if(val)
      this.datasource.Unassert(aNode, aArc, val);
  },
  
  // Returns the (first) nsIRDFContainer which has aResource (nsIRDFResource)
  // in it. Makes sure no other containers have aResource.
  getContainerForResource: function(aResource) {
    var result = null;
    var arcsIn = this.datasource.ArcLabelsIn(aResource);
    while(arcsIn.hasMoreElements()) {
      var arc = arcsIn.getNext();
      if(arc instanceof Components.interfaces.nsIRDFResource) {
        if(this.contUtils.IsOrdinalProperty(arc)) {
          var conts = this.datasource.GetSources(arc, aResource, true);
          while(conts.hasMoreElements()) {
            var cont = this.makeContainer(conts.getNext());
            if(!result) // first container
              result = cont;
            else // remove aResource from the container
              cont.RemoveElement(aResource, true);
          }
        }
      }
    }
    return result;
  },
  
  // helpers
  // add an editable menu to the RDF, given its ID, and its display name (for Options)
  addMenu: function(aID, aDisplayName) {
    var root = this.makeContainer(this.root);
    var node = this.getResourceFromId(aID);
    if(root.IndexOf(node) == -1)
      root.AppendElement(node);
    var displayName = this.RDFService.GetLiteral(aDisplayName);
    this.setTarget(node, this.arcName, displayName);
  },
  
  // add info - id/label/type - about an item to rootCont.
  //  aID parameter overrides aItem.id - that's done to call addItem with
  //  elements from backup menu, in Options' Reset handler.
  // This function usually returns the RDF node added, but it may return null
  // (if the item has no id) -- callers must deal with it.
  addItem: function(aCont, aItem, aID) {
    var id = aID ? aID : aItem.id;
    var label = aItem.getAttribute("label");
    
    // miniT puts its item in Tools menu then moves it to tabs context
    // menu in window "onload" handler. We don't want miniT's item to appear
    // in Tools menu in the datasource.
    if(id == "miniT-docShell" && aCont.Resource.Value == "NC:menu_ToolsPopup")
      return null;

    if(!id) {
      // Check for known id-less menu items added dynamically here.
      // This is a mess.
      if(aItem.getAttribute("class") == "spell-suggestion") {
        // ignore spell suggestion items
        return null;
      }
      else if(aItem.getAttribute("command") == "Browser:BookmarkAllTabs")
        aItem.id = "menuedit_bookmarkAllTabsContextMenuItem";
      else if(aItem.getAttribute("oncommand") == "BookmarkThisTab();")
        aItem.id = "menuedit_bookmarkThisTabContextMenuItem";
      else {
        // we'd rather not see this happen; this means that a menuitem 
        // without an id was appended dynamically or something similarly 
        // bad. In that case, there is no way to uniquely identify this 
        // item next time it's added, so there's no point in storing it 
        // in the datasource.
        MenuEditCommon.dump("warning: addItem got an item without id", true);
        return null;  // xxx maybe try to set the id based on displayName first?
      }
    }

    if(this.checkRDFPrefix(id)) {
      // most likely it's generated from RDF item, so don't touch it 
      // (this prevents Bookmark items from appearing in the DS).
      return null;
    }

    // choose a display name (to show in Options dialog) for this item
    var displayName;
    if(label)
      displayName = label;
    else {
      const BROWSER_PROPERTIES_URI="chrome://browser/locale/browser.properties";
      switch(id) {
        case "context-blockimage":
          displayName = MenuEditCommon.getFormattedString(
            "blockImages", [""], BROWSER_PROPERTIES_URI);
          break;
        case "context-searchselect":
          displayName = MenuEditCommon.getFormattedString(
            "searchText", [""], BROWSER_PROPERTIES_URI, true);
          if(displayName == "searchText") {
            // patch in bug 317107 renamed the string to be 
            // "contextMenuSearchText", we try to support both 
            // Fx 2.0 and 1.5
            displayName = MenuEditCommon.getFormattedString(
              "contextMenuSearchText", ["...", "..."], 
              BROWSER_PROPERTIES_URI, true);
          }
          
          break;
        case "messagePaneContext-delete":
        case "threadPaneContext-delete":
          var cmd_delete = aItem.ownerDocument.getElementById("cmd_delete");
          if(!cmd_delete || !(displayName = cmd_delete.getAttribute("valueMessage")))
            displayName = id;
          break;
        default:
          // Otherwise just use the ID - this is likely to happen
          // if an extension adds a menuitem without a default label
          displayName = id;
          // xxx 'delete message' in TB doesn't have a label
      }
    }

    var node = this.getResourceFromId(id);
    // remove the node from its current container (if any)
    var currCont = this.getContainerForResource(node);
    if(currCont)
      currCont.RemoveElement(node, true);
    aCont.AppendElement(node);
    this.setItemProps(node, aItem.localName, displayName)
    return node;
  },
  
  // aType = (usually) "menu" / "menuitem" / "menuseparator"
  setItemProps: function(aNode, aType, aDisplayName) {
    var nameLit = this.RDFService.GetLiteral(aDisplayName);
    var type = "type_" + aType;
    var visible = true; // show by default
    
    if(!(type in this))   // for unknown elements, e.g. stringbundle. They
    {                      // shouldn't really be in menu popups, so we make
      type = "type_other"; // them "invisible", i.e. they will reside in EM_ menu.
      visible = false;     // Other kinds elements will be added to the "whitelist" on request.
    }

    // hide Customize Menus by default
    if(this.getResourceId(aNode).indexOf("menueditor-options") == 0)
      visible = false;

    this.setTarget(aNode, this.arcType, this[type]);
    this.setTarget(aNode, this.arcShow, visible ? this.showLit : this.hideLit);
    this.setTarget(aNode, this.arcName, nameLit);
  },

  // get visibility information for given nsIRDFNode
  getVisibility: function(aNode) {
    try {
      return this.datasource.GetTarget(aNode, this.arcShow, true) != this.hideLit;
    } catch(e) {}
    return true;
  },
  // get visibility information for given nsIRDFNode
  setVisibility: function(aNode, aValue) {
    this.setTarget(aNode, this.arcShow, aValue ? this.showLit : this.hideLit);
  },

  getCreate: function(aNode) {
    try {
      return this.datasource.GetTarget(aNode, this.arcCustom, true) == this.createLit;
    } catch(e) {}
    return false;
  },

  getIgnore: function(aNode) {
    try {
      return this.datasource.GetTarget(aNode, this.arcCustom, true) == this.ignoreLit;
    } catch(e) {}
    return false;
  },

  getType: function(aNode) {
    try {
      return this.datasource.GetTarget(aNode, this.arcType, true);
    } catch(e) {}
    return null;
  },

  // check if the NC:Version on the root element of datasource is compatible
  // with current Menu Editor. If not - rename the datasource file, issue a
  // message and load an empty datasource
  checkVersion: function() {
    var datasourceFile = this.datasourceFile;
    if(datasourceFile.exists()) {
      try {
        var version = this.datasource.GetTarget(this.root, this.arcVersion, true);
        MenuEditCommon.QI(version, "nsIRDFLiteral");
        if(version.Value != this.version) throw 1;
      } catch(e) {
        this.clearDatasource();
        alert(MenuEditCommon.getFormattedString("incompat", [this.bakFilename]));
      }
    }
    this.setVersion();
  },
  setVersion: function() {
    this.setTarget(this.root, this.arcVersion, this.RDFService.GetLiteral(this.version));
  },

  checkRDFPrefix: function(aID) {
    return aID.indexOf("rdf:") == 0 || aID.indexOf("NC:") == 0;
  }
};

var MenuEditCommon = {
  dumpException: function(e, extMsg) {
    var msg = "unexpected exception. dev. info follows:\n";
    for (var i in e)
      msg += (i + "=" + e[i] + "; ");
    if(extMsg)
      msg += extMsg;
    MenuEditCommon.dump(msg, true);
  },

  dump: function(msg, dumpStackTrace) {
    var acs = this.getService("consoleservice;1", "nsIConsoleService");
    var caller = arguments.callee.caller;

    var stackText = "";
    if(dumpStackTrace) {
      stackText = "\nStack Trace: \n";
      var count = 0;
      while (caller) {
        stackText += count++ + ":" + caller.name + "(";
        for (var i = 0; i < caller.arguments.length; ++i) {
          var arg = caller.arguments[i];
          stackText += arg;
          if (i < caller.arguments.length - 1)
            stackText += ",";
        }
        stackText += ")\n";
        caller = caller.arguments.callee.caller;
      }
    }
    acs.logStringMessage("menuedit: " + msg + stackText);
  },

  // xpcom helpers
  createInstance: function(aCID, aIID) {
    return Components.classes["@mozilla.org/"+aCID]
          .createInstance(Components.interfaces[aIID]);
  },
  getService: function(aCID, aIID) {
    return Components.classes["@mozilla.org/"+aCID]
          .getService(Components.interfaces[aIID]);
  },
  QI: function(aObj, aIID) {
    try {
      return aObj.QueryInterface(Components.interfaces[aIID]);
    } catch(e) {
      this.dumpException(e);
    }
    return null;
  },
  
  // cross-application-ness
  _hostApp: "",
  apps: {
    Firefox: "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}",
    Thunderbird: "{3550f703-e582-4d05-9a08-453d09bdfdc6}"
  },
  get hostApp() { // returns GUID of host application
    if(!this._hostApp) {
      // In 1.0+ trunk builds nsIXULAppInfo provides application info
      if("@mozilla.org/xre/app-info;1" in Components.classes)
        this._hostApp = this.getService("xre/app-info;1", "nsIXULAppInfo").ID.toString();
      else { // in Fx/Tb 1.0 a pref is used
        var pref = this.getService("preferences-service;1", "nsIPrefBranch");
        this._hostApp = pref.getCharPref("app.id");
      }
    }
    return this._hostApp;
  },
  
  // localization
  _strings: null,
  // aPropsURL - optional URL of .properties file to read the string from
  // if not supplied - read from menueditstrings stringbundle.
  getString: function(aStr, aPropsURL) {
    if(aPropsURL) {
      var s = this.getService("intl/stringbundle;1", "nsIStringBundleService");
      var bundle = s.createBundle(aPropsURL);
      return bundle.GetStringFromName(aStr);
    }
    
    if(!this._strings)
      this._strings = document.getElementById("menueditstrings");
    try {
      return this._strings.getString(aStr);
    } catch(e) {this.dumpException(e);}
    return aStr;
  },
  getFormattedString: function(aStr, aParams, aPropsURL, aSilent) {
    try {
      if(aPropsURL) {
        var s = this.getService("intl/stringbundle;1", "nsIStringBundleService");
        var bundle = s.createBundle(aPropsURL);
        return bundle.formatStringFromName(aStr, aParams, aParams.length);
      }
      
      if(!this._strings)
        this._strings = document.getElementById("menueditstrings");
      return this._strings.getFormattedString(aStr, aParams);
    } catch(e) {
      if(!aSilent) {
        this.dumpException(e, "\ngetFormattedString('" + aStr + "',[" + 
                           aParams + "]," + aPropsURL);
      }
    }
    return aStr; // fall back to displaying the key
  }
};

// make sure all items have ids
function MenuEdit_addIDs(aDoc, aMenuID)
{
  // This function converts an item's label to a string suitable for id and
  // RDF resource URI.
  function label2id(aLabel) {
    var id = "";
    aLabel = aLabel.replace(/\s/g,"_").replace(/[.]/g,"");
    for(var i=0; i<aLabel.length; i++) {
      if(aLabel[i].match(/[a-zA-Z0-9_]/)) // make some ASCII chars readable
        id += aLabel[i];
      else
        id += aLabel.charCodeAt(i); // encode other chars
    }
    return id;
  }
  var menuPopup = aDoc.getElementById(aMenuID);
  var untitledCount = 0;
  for(var item = menuPopup.firstChild; item; item=item.nextSibling) {
    if(item.id == "")
    { // we work around items without IDs here.
      // (there are bugs open against both Mozilla and Firefox
      // to make all menus have ids).
      if(item.getAttribute("command") == "Browser:ReadMail") {
        // ReadMail menuitem hasn't got an id and its label changes :(
        item.id = "menuedit-readmail";
        continue;
      }
      if(item.getAttribute("class") == "spell-suggestion") {
        continue;
      }

      var label = item.getAttribute("label");
      if(label)
        item.id = "menuedit-" + aMenuID + "-" + label2id(label);
      else
        item.id = "menuedit-" + aMenuID + "-untitled" + (untitledCount++);
    }
  }
}

// Dump a message to JavaScript Console
function d(msg){
  MenuEditCommon.dump(msg);
}
