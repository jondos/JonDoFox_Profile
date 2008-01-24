const nsICategoryManager = Components.interfaces.nsICategoryManager;
const nsIComponentRegistrar = Components.interfaces.nsIComponentRegistrar;
const nsIFactory = Components.interfaces.nsIFactory;

var consoleService = Components
.classes['@mozilla.org/consoleservice;1']
.getService( Components.interfaces.nsIConsoleService );

function recordMessage( message ) {
consoleService.logStringMessage("cutemenus: " + message + "\n");
}

var  dynamicOverlays = [
    [ "enableNoSearch", "chrome://cutemenus/content/cutemenus-no-search.xul" ],
    [ "enableNoGo", "chrome://cutemenus/content/cutemenus-no-go.xul" ],
    [ "enableMenubarIcons", "chrome://cutemenus/content/cutemenus-menubar-icons.xul" ],
    [ "enableMenubarIconsWithText", "chrome://cutemenus/content/cutemenus-menubar-text.xul" ],
    [ "enableOfficeXPToolbars", "chrome://cutemenus/content/cutemenus-flattoolbars.xul" ],
    [ "enableOfficeXPDividers", "chrome://cutemenus/content/cutemenus-flatdividers.xul" ],
    [ "enableOfficeXPActive", "chrome://cutemenus/content/cutemenus-flatactive.xul" ],
    [ "enableCheck", "chrome://cutemenus/content/cutemenus-check.xul" ],
    [ "enableRadio", "chrome://cutemenus/content/cutemenus-radio.xul" ],
    [ "enableIcons", "chrome://cutemenus/content/cutemenus.xul" ],
    [ "enableDisabledIcons", "chrome://cutemenus/content/cutemenus-disabled.xul" ],
    [ "enableFlatStyleStandard", "chrome://cutemenus/content/cutemenus-flat.xul" ],
    [ "enableFlatStyleXP", "chrome://cutemenus/content/cutemenus-flat-xp.xul" ],
    [ "enableToolsConfig", "chrome://cutemenus/content/cutemenus-tools.xul" ],
    [ "enableMenuInfoTooltip", "chrome://cutemenus/content/cutemenus-dev.xul" ]
  ];

var prefBranchName = "extensions.cutemenus.";

// Observers
var cmWindowObserver = {
  prefs: null,
  currentPrefs: new Array(),

  // nsISupports
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(nsIFactory) ||
        iid.equals(Components.interfaces.nsIObserver))
    return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  // nsIFactory
  createInstance : function clh_CI(outer, iid) {
    if (outer != null)
    throw Components.results.NS_ERROR_NO_AGGREGATION;

    return this.QueryInterface(iid);
  },

  // nsIObserver
  observe: function(subject,topic,data){
    switch(topic){
      case 'app-startup':
        cmWindowObserver.registerWindowObserver();
        break;
      case 'domwindowopened':
        subject.addEventListener("load", cmWindowObserver.loadEvent, false);
        break;
      case 'nsPref:changed':
        var processedData = data;
        if (processedData.indexOf(prefBranchName) == 0) {
          processedData = processedData.substr(prefBranchName.length);
        }
        cmWindowObserver.currentPrefs[processedData] = cmWindowObserver.prefs.getBoolPref(processedData);
        break;
    }
  },

  loadEvent: function(event) {

    // it's a load event
    if (event.currentTarget) {
      if (event.currentTarget.location) {
        // Window blacklisting
        if ((event.currentTarget.location == "chrome://bookmarkreviewer/content/startupBookmarkWindow.xul") ||
            (event.currentTarget.location == "chrome://splash/content/splash.xul") ||
            (event.currentTarget.location == "chrome://emusic/content/hidden.xul"))
          return;
      }
//      if (event.currentTarget.loadOverlay && cmWindowObserver.canOverlay(event.currentTarget)) {
//        event.currentTarget.loadOverlay("chrome://cutemenus/content/cutemenus.xul", null);
//      }
//      if (event.currentTarget.createProcessingInstruction) {
      if (event.currentTarget) {
        cmWindowObserver.overlayStyle(event.currentTarget);
      }

      event.currentTarget.addEventListener("load", cmWindowObserver.captureWindowLoadEvents, true);
      event.currentTarget.addEventListener("pageshow", cmWindowObserver.captureWindowLoadEvents, true);
      event.originalTarget.removeEventListener("load", cmWindowObserver.loadEvent, false);
      event.currentTarget.addEventListener("unload", cmWindowObserver.unloadEvent, false);
    }
  },

  captureWindowLoadEvents: function(event) {
    // it's a load event
/*
    if (event.target && event.target.loadOverlay && cmWindowObserver.canOverlay(event.target)) {
      event.target.loadOverlay("chrome://cutemenus/content/cutemenus.xul", null);
    } else if (event.originalTarget && event.originalTarget.loadOverlay && cmWindowObserver.canOverlay(event.originalTarget)) {
      event.originalTarget.loadOverlay("chrome://cutemenus/content/cutemenus.xul", null);
    }
*/
//    if (event.target && event.target.createProcessingInstruction) {
    if (event.target && event.target.loadOverlay) {
        cmWindowObserver.overlayStyle(event.target);
//    } else if (event.originalTarget && event.originalTarget.createProcessingInstruction) {
    } else if (event.originalTarget && event.originalTarget.loadOverlay) {
        cmWindowObserver.overlayStyle(event.originalTarget);
    }
  },

  overlayStyle: function(targetDocument) {
//    if (targetDocument instanceof Components.interfaces.nsIDOMHTMLDocument) return;
    if (targetDocument.loadOverlay) {
      var overlayHelper = new CmOverlayHelper(targetDocument, cmWindowObserver.currentPrefs);
      overlayHelper.overlayNext("");
//      targetDocument.loadOverlay("chrome://cutemenus/content/cutemenus.xul", overlayHelper);

/*
    } else {
      var mosaicCss = targetDocument.createProcessingInstruction("xml-stylesheet","type=\"text/css\" href=\"chrome://cutemenus/content/res/mosaic.css\"");
      var localeCss = targetDocument.createProcessingInstruction("xml-stylesheet","type=\"text/css\" href=\"chrome://cutemenus/locale/cutemenus-locale.css\"");
      targetDocument.insertBefore(mosaicCss, targetDocument.documentElement);
      targetDocument.insertBefore(localeCss, targetDocument.documentElement);
*/
    }
  },

  canOverlay: function(targetDocument) {
    return true;
//    return (targetDocument.location != "chrome://browser/content/browser.xul");
  },

  unloadEvent: function(event) {
    event.currentTarget.removeEventListener("load", cmWindowObserver.loadEvent, false);
    event.currentTarget.removeEventListener("load", cmWindowObserver.captureWindowLoadEvents, true);
    try {
      event.currentTarget.removeEventListener("pageshow", cmWindowObserver.captureWindowLoadEvents, true);
    } catch (e) {
      // this may throw an exception in netscape
    }
    event.currentTarget.removeEventListener("unload", cmWindowObserver.unloadEvent, false);
  },
  
  registerWindowObserver: function() {
    var watcherService = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
    watcherService.registerNotification(cmWindowObserver);

    // Load preference and register to preference changes
    cmWindowObserver.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(prefBranchName);
    
    for (var c=0; c<dynamicOverlays.length; c++) {
      var currentPrefName = dynamicOverlays[c][0];
      cmWindowObserver.currentPrefs[currentPrefName] = cmWindowObserver.prefs.getBoolPref(currentPrefName);
    }

    if (Components.interfaces.nsIPrefBranch2) {
      Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2).addObserver(prefBranchName, cmWindowObserver, false);
    } else {
	Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranchInternal).addObserver(prefBranchName, cmWindowObserver, false);
    }
  },

  unregisterWindowObserver: function() {
    var watcherService = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
    watcherService.unregisterNotification(cmWindowObserver);
  }

}

const clh_contractID = "@mozilla.org/embedcomp/window-watcher;1?type=cutemenus";
const clh_CID = Components.ID("{7c7ca030-4f28-11db-b0de-0800200c9a66}");
const clh_category = "w-cutemenus";

const cuteMenusWatcherModule = {
  // nsISupports
  QueryInterface : function mod_QI(iid) {
    if (iid.equals(nsIModule) ||
        iid.equals(nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  // nsIModule
  getClassObject : function mod_gch(compMgr, cid, iid) {
    if (cid.equals(clh_CID))
      return cmWindowObserver.QueryInterface(iid);
    throw Components.results.NS_ERROR_NOT_REGISTERED;
  },

  registerSelf : function mod_regself(compMgr, fileSpec, location, type) {
    compMgr.QueryInterface(nsIComponentRegistrar);

    compMgr.registerFactoryLocation(clh_CID,
      "cmWindowObserver",
      clh_contractID,
      fileSpec,
      location,
      type);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"]
      .getService(nsICategoryManager);
    catMan.addCategoryEntry("app-startup",
      clh_category,
      "service," + clh_contractID, true, true);
  },

  unregisterSelf : function mod_unreg(compMgr, location, type) {
    compMgr.QueryInterface(nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(clh_CID, location);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"]
      .getService(nsICategoryManager);
    catMan.deleteCategoryEntry("app-startup", "service," + clh_category);
  },

  canUnload : function (compMgr) {
    return true;
  }
};

/* module initialisation */
function NSGetModule(comMgr, fileSpec) {
  return cuteMenusWatcherModule;
}

/* helper object */
function CmOverlayHelper(targetDocument, currentPrefs) {
  this.targetDocument = targetDocument;
  this.currentPrefs = currentPrefs;
}

// nsISupports
CmOverlayHelper.prototype.QueryInterface = function(iid) {
    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIObserver))
    return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
}

CmOverlayHelper.prototype.overlayNext = function(current) {
  var found = false;
  var foundIndex = -1;

  if (current == "") {
    found = true;
    foundIndex = -1;
  }

  for (var c=0; ((c<(dynamicOverlays.length - 1)) && !found); c++) {
    if (dynamicOverlays[c][1] == current) {
      found = true;
      foundIndex = c;
    }
  }

  if (found) {
    var foundNext = false;
    for (var d=(foundIndex + 1); ((d<dynamicOverlays.length) && !foundNext); d++) {
      if (this.currentPrefs[dynamicOverlays[d][0]]) {
        foundNext = true;
        this.targetDocument.loadOverlay(dynamicOverlays[d][1], this);      }
    }
  }
}

// nsIObserver
CmOverlayHelper.prototype.observe = function(subject,topic,data){
  switch(topic){
    case 'xul-overlay-merged':
      var observedURI = subject.QueryInterface(Components.interfaces.nsIURI);
      this.overlayNext(observedURI.spec);
    break;
  }
}

function log(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}
