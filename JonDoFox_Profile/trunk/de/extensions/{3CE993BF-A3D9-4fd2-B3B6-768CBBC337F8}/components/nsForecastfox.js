/**
 * See license.txt
 */

/**
 * See license.txt
 */
/******************************************************************************
 * WARNING!!! This file cannot be used from the main overlay (forecastfox.js).
 *            There are variables and functions that conflict with browser 
 *            code and could potentially conflict with other extensions.
 *****************************************************************************/ 
 
/******************************************************************************
 * Component Constants
 *****************************************************************************/ 
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
 
/******************************************************************************
 * File Permission Constants
 *****************************************************************************/ 
/*jsl:ignore*/
const PERMS_FILE = 0644;
const PERMS_DIRECTORY = 0755;
/*jsl:end*/

/******************************************************************************
 * File Type Constants
 *****************************************************************************/
const TYPE_PROFILE = Ci.ffIDiskService.TYPE_PROFILE;
const TYPE_CACHE = Ci.ffIDiskService.TYPE_CACHE;
const TYPE_ICONS = Ci.ffIDiskService.TYPE_ICONS;
const TYPE_TEMP = Ci.ffIDiskService.TYPE_TEMP;
const TYPE_DEFAULTS = Ci.ffIDiskService.TYPE_DEFAULTS;
const TYPE_WEATHERFOX = Ci.ffIDiskService.TYPE_WEATHERFOX;
const TYPE_ERRORS = Ci.ffIDiskService.TYPE_ERRORS;

/******************************************************************************
 * Severity Constants
 *****************************************************************************/
const SEVERITY_INFO = Ci.ffIErrorItem.SEVERITY_INFO;
const SEVERITY_WARNING = Ci.ffIErrorItem.SEVERITY_WARNING;
const SEVERITY_ERROR = Ci.ffIErrorItem.SEVERITY_ERROR;

/******************************************************************************
 * Application Constants
 *****************************************************************************/
const FIREFOX_GUID = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
const FLOCK_GUID = "{a463f10c-3994-11da-9945-000d60ca027b}";
const SUITE_GUID = "{86c18b42-e466-45a9-ae7a-9b95ba6f5640}";
const SEAMONKEY_GUID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";
const NETSCAPE_GUID = "{3db10fab-e461-4c80-8b97-957ad5f8ea47}";
 
/******************************************************************************
 * Preferences Excluded from Profiles Constant
 *****************************************************************************/
const EXCLUDED_PREFS = {
  "migrated": true,
  "migrated.prefs": true,
  "pinged": true,
  "icons.version": true,
  "icons.uninstallfiles": true,
  "profile.current": true,
  "profile.switch.delay": true,
  "profile.switch.enabled": true,      
  "links.alert": true,
  "links.dialog": true,
  "links.panel": true,
  "links.context": true,
  "update.freq": true,
  "update.paused": true,
  "update.force": true,
  "update.showMeter": true,
};
 
/******************************************************************************
 * DTD and Namespace Constants for Import, Export, and Profiles.xml
 *****************************************************************************/
const PROFILES_DTD = "http://forecastfox.ensolis.com/specs/1.0/profiles.dtd";
const PROFILES_NS = "http://forecastfox.ensolis.com/specs/1.0/profiles";

/******************************************************************************
 * Gets a preference branch.  
 *
 * @param   Boolean if getting the default branch or current branch.
 * @param   Name of the branch to get.  If null is passed then "forecastfox."
 *          is the branch retrieved.
 * @return  Requested preference branch.
 *****************************************************************************/
function getBranch(aDefault, aName)
{
  //forecastf pref branch
  const FF_NAME = "forecastfox.";
  
  //get pref service
  var pbSvc = Cc["@mozilla.org/preferences-service;1"].
              getService(Ci.nsIPrefService);
  
  //get the default branch
  if (aDefault)
    return (aName) ? pbSvc.getDefaultBranch(aName) : 
                     pbSvc.getDefaultBranch(FF_NAME);
  
  //get the specified branch
  return (aName) ? pbSvc.getBranch(aName) : 
                   pbSvc.getBranch(FF_NAME);
}

/******************************************************************************
 * Gets a preference.  
 *
 * @param   Name of the preference to retrieve.
 * @return  Requested preference value. 
 *****************************************************************************/
var gHelpersBranch = null;
function getPref(aName)
{
  //get pref branch
  if (!gHelpersBranch)
    gHelpersBranch = getBranch(false, null);
  var branch = gHelpersBranch;
  
  //return value based on pref type
  var rv = "";
  switch (branch.getPrefType(aName)) {
  case Ci.nsIPrefBranch.PREF_INT:
    rv = branch.getIntPref(aName);
    break;
  case Ci.nsIPrefBranch.PREF_BOOL:
    rv = branch.getBoolPref(aName);
    break;
  case Ci.nsIPrefBranch.PREF_STRING:
  default:
    try {
      rv = branch.getComplexValue(aName, Ci.nsIPrefLocalizedString).data;                         
    } catch(e) {
      try {
        rv = branch.getComplexValue(aName, Ci.nsISupportsString).data;
      } catch(e) {
        rv = branch.getCharPref(aName); 
      }
    }
    break;    
  }
  return rv; 
}

/******************************************************************************
 * Sets a preference.  
 *
 * @param   Name of the preference to retrieve.
 * @param   Value to set the preference to.
 *****************************************************************************/
function setPref(aName, aValue)
{
  //get pref branch
  if (!gHelpersBranch)
    gHelpersBranch = getBranch(false, null);
  var branch = gHelpersBranch;
  
  //do nothing if value is unchanged
  var oldValue = getPref(aName);
  if (aValue == oldValue)
    return;
  
  //remove user value if same as the default
  var restored = restorePref(aName, aValue);
  if (restored)
    return;
    
  //set value based on pref type
  switch (branch.getPrefType(aName)) {
  case Ci.nsIPrefBranch.PREF_INT:
    branch.setIntPref(aName, aValue);
    break;
  case Ci.nsIPrefBranch.PREF_BOOL:
     branch.setBoolPref(aName, aValue);
     break;
  case Ci.nsIPrefBranch.PREF_STRING:
  default:
    try {
      var plString = Cc["@mozilla.org/pref-localizedstring;1"].
                     createInstance(Ci.nsIPrefLocalizedString);    
      plString.data = aValue;
      branch.setComplexValue(aName, Ci.nsIPrefLocalizedString, plString);
    } catch(e) {
      try {
        var sString = Cc["@mozilla.org/supports-string;1"].
                      createInstance(Ci.nsISupportsString);    
        sString.data = aValue;
        branch.setComplexValue(aName, Ci.nsISupportsString, sString);
      } catch(e) {
        branch.setCharPref(aName, aValue);
      }
    }
    break;                         
  }   
}

/******************************************************************************
 * Restores a default preference.  
 *
 * @param   Name of the preference to retrieve.
 * @param   The new value of the preference.
 * @return  True if pref was restored 
 *****************************************************************************/
function restorePref(aName, aValue)
{
  //get pref branch
  var branch = getBranch(true, null);
  
  //get value based on pref type
  try {
    var defaultValue = "";
    switch (branch.getPrefType(aName)) {
    case Ci.nsIPrefBranch.PREF_INT:
      defaultValue = branch.getIntPref(aName);
      break;
    case Ci.nsIPrefBranch.PREF_BOOL:
      defaultValue = branch.getBoolPref(aName);
      break;
    case Ci.nsIPrefBranch.PREF_STRING:
    default:
      try {
        defaultValue = branch.getComplexValue(aName, Ci.nsIPrefLocalizedString).data;                         
      } catch(e) {
        try {
          defaultValue = branch.getComplexValue(aName, Ci.nsISupportsString).data;
        } catch(e) {
          defaultValue = branch.getCharPref(aName); 
        }
      }
      break;    
    }
  } catch(e) {
    return false;
  }
  
  //value is the same do not restore
  if (aValue != defaultValue)
    return false;
  
  //get pref branch
  if (!gHelpersBranch)
    gHelpersBranch = getBranch(false, null);
  branch = gHelpersBranch;
  
  //clear the value
  try {
    branch.clearUserPref(aName); 
  } catch(e) {
    return false;
  }
  
  // preference was cleared
  return true;
}

/******************************************************************************
 * Gets the GUID of the applications  
 *
 * @return  A string representing the application ID. 
 *****************************************************************************/
var gHelpersGUID = null;
function getGUID()
{
  //return cached GUID
  if (gHelpersGUID != null)
    return gHelpersGUID;

  //use the app info component - toolkit 1.5 or greater
  if ("nsIXULAppInfo" in Ci) {
    var app = Cc["@mozilla.org/xre/app-info;1"].
              getService(Ci.nsIXULAppInfo);
    gHelpersGUID = app.ID;
  } else {        

    //try getting the id from preferences - toolkit 1.0
    try {
      var branch = getBranch(false, "");
      gHelpersGUID = branch.getCharPref("app.id");
    } catch(e) {
    
      //couldn't figure it out so default to the suite - non toolkit
      gHelpersGUID = SUITE_GUID;
    }
  }
  
  // get rid of extra characters that are in some people's app.id pref
  gHelpersGUID = gHelpersGUID.match(/{.*}/)[0];
  return gHelpersGUID;
}

/******************************************************************************
 * removes the specified file
 * 
 * @param     File to remove.  If file is a directory all files within the 
 *            directory will be removed.
 *****************************************************************************/
function removeFile(aFile)
{
  if (aFile.isDirectory())
    aFile.remove(true);
  else
    aFile.remove(false);
}

/******************************************************************************
 * Gets a directory based on a special directory key.  
 *
 * @param   Special directory key.
 * @param   Array of sub directories from the special directory.
 * @param   Create the sub directory if it doesn't exist.
 * @return  A nsIFile interface for the requested file.
 *****************************************************************************/
function getKeyedDirectory(aKey, aPathArray, aCreate)
{
  //get directory service
  var dirSvc = Cc["@mozilla.org/file/directory_service;1"].
               getService(Ci.nsIProperties);
  
  //get base directory             
  var dir = dirSvc.get(aKey, Ci.nsIFile);
  
  //loop through path array
  for (var i=0; i<aPathArray.length; i++) {      
    dir.append(aPathArray[i]);
    
    //create directory if instructed
    if (aCreate && !dir.exists())
      dir.create(Ci.nsIFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
  }

  return dir;
}

/******************************************************************************
 * Gets a directory from the installed directory.  
 *
 * @param   Array of sub directories from the install directory.
 * @return  A nsIFile interface for the requested file.
 *****************************************************************************/
function getInstallDirectory(aPathArray)
{
  //setup objects
  var dir = null;
  
  //get extension manager - toolkit 1.0 or greater
  if ("@mozilla.org/extensions/manager;1" in Cc) {
    var em = Cc["@mozilla.org/extensions/manager;1"].
             getService(Ci.nsIExtensionManager);
             
    //get install location from extension manager - toolkit 1.5            
    if ("nsIInstallLocation" in Ci) {
      dir = em.getInstallLocation("{3CE993BF-A3D9-4fd2-B3B6-768CBBC337F8}");
      dir = dir.getItemLocation("{3CE993BF-A3D9-4fd2-B3B6-768CBBC337F8}");
    }   
  }
    
  //couldn't use extension manager so try the profile directory - non toolkit
  if (!dir) {
    var dirSvc = Cc["@mozilla.org/file/directory_service;1"].
                 getService(Ci.nsIProperties);      
    dir = dirSvc.get("ProfD", Ci.nsIFile);
    dir.append("extensions");
    dir.append("{3CE993BF-A3D9-4fd2-B3B6-768CBBC337F8}");
    
    //not in the profile directory so it must be in the app directory
    if (!dir.exists()) {
      dir = dirSvc.get("XCurProcD", Ci.nsIFile); 
      dir.append("extensions");
      dir.append("{3CE993BF-A3D9-4fd2-B3B6-768CBBC337F8}");
    }      
  }
  
  //loop through path array
  for (var i=0; i<aPathArray.length; i++)
    dir.append(aPathArray[i]);

  return dir;
}
   
/******************************************************************************
 * Get the top most open window.  A window has to open for this to be called.
 * Use this if the type of window does not matter.
 * 
 * @return  A window object used for modality.
 *****************************************************************************/
function getTopWindow()
{
  //get top window
  var mediator = Cc["@mozilla.org/appshell/window-mediator;1"].
                 getService(Ci.nsIWindowMediator);
  return mediator.getMostRecentWindow(null); 
}
   
/******************************************************************************
 * Get the main application window.  Use this if the type of window does matter.
 * 
 * @return  A window object used for modality.
 *****************************************************************************/
function getMainWindow()
{
  /** this may need to change if main window of a 
      supported app is not "navigator:browser" **/
  
  //get the mediator service
  var mediator = Cc["@mozilla.org/appshell/window-mediator;1"].
                 getService(Ci.nsIWindowMediator);
  
  //get the app window
  var main = mediator.getMostRecentWindow("navigator:browser");
  if (main)
    return main;
                       
  //get the watcher service
  var watcher = Cc["@mozilla.org/embedcomp/window-watcher;1"].
                getService(Ci.nsIWindowWatcher);                 

  //open a new window
  switch (getGUID()) {
  case SUITE_GUID:
  case SEAMONKEY_GUID:
    main = watcher.openWindow(null, "chrome://navigator/content/navigator.xul", 
                              "_blank", "chrome,all,dialog=no", "about:blank");
    break;
  case FIREFOX_GUID:
  case NETSCAPE_GUID:
  case FLOCK_GUID:
  default:        
    main = watcher.openWindow(null, "chrome://browser/content/browser.xul", 
                              "_blank", "chrome,all,dialog=no", "about:blank");
    break;
  }
  
  return main;
}
     
/******************************************************************************
 * String enumerator of hash table keys.
 * 
 * @param   Javascript hash table. 
 * @return  A nsIStringEnumerator of the keys.
 *****************************************************************************/
function KeyEnumerator(aHashTable)
{
  //setup key array
  this._keys = [];
  this._index = 0;
  
  //load with data
  if (aHashTable) {
    for (var name in aHashTable)
      this._keys.push(name);
  }
}
KeyEnumerator.prototype = {
  _index: null,
  _keys: null,
  
  QueryInterface: function KeyEnumerator_QueryInterface(aIID)
  {
    if (!aIID.equals(Ci.nsIStringEnumerator) ||
        !aIID.equals(Ci.nsISupports))
      throw Cr.NS_ERROR_NO_INTERFACE; 
    return this;   
  },
  
  hasMore: function KeyEnumerator_hasMore()
  {
    return this._index < this._keys.length;
  },
  
  getNext: function KeyEnumerator_getNext()
  {
    var rv = this._keys[this._index];
    this._index++; 
    return rv;
  }
};

/******************************************************************************
 * Sorts an array ascending where the items have a name property. 
 *
 * @param   Current array item.
 * @param   Next array item.
 *
 * @return  1 if greater, 0 if equal, and -1 if less than. 
 *****************************************************************************/
function sortByName(aItem1, aItem2)
{
  if (aItem1.name < aItem2.name)
    return -1;
  else if (aItem1.name == aItem2.name)
    return 0;

  return 1;
}

/******************************************************************************
 * Get a new prompter.
 *
 * @param   The parent window for the prompter can be null.
 *
 * @return  A new prompter. 
 *****************************************************************************/
function getPrompter(aParent)
{
  //get the watcher service
  var watcher = Cc["@mozilla.org/embedcomp/window-watcher;1"].
                getService(Ci.nsIWindowWatcher);
                
  //return a prompter
  return watcher.getNewPrompter(aParent);
}

/******************************************************************************
 * Gets the forecastfox string bundle.
 *
 * @return  A nsIStringBundle interface for the requested url.
 *****************************************************************************/
var gHelpersBundle = null;
function getBundle()
{
  if (gHelpersBundle != null)
    return gHelpersBundle;
    
  const BUNDLE_URL = "chrome://forecastfox/locale/forecastfox.properties";
 
  //get the stringbundle service
  var sbSvc = Cc["@mozilla.org/intl/stringbundle;1"].
              getService(Ci.nsIStringBundleService); 
  
  //get the bundle and return it  
  gHelpersBundle = sbSvc.createBundle(BUNDLE_URL);       
  return gHelpersBundle;
}

/******************************************************************************
 * Checks if the alert service is included.
 *
 * @return  True if alert service is present. 
 *****************************************************************************/
var gHelpersHasAlert = null;
function checkAlertService()
{
  //return cached alert check
  if (gHelpersHasAlert != null) 
    return gHelpersHasAlert;

  //check if the alert interface exists
  if ("nsIAlertsService" in Ci)
    gHelpersHasAlert = true;
  else
    gHelpersHasAlert = false;
    
  //cache the flag and return the value
  return gHelpersHasAlert;
}

/******************************************************************************
 * Checks if the application can handle our overflow code.
 *
 * @return  True if the app can.
 *****************************************************************************/ 
var gHelpersCanOverflow = null;
function canOverflow() 
{
  //return cached check
  if (gHelpersCanOverflow != null)
    return gHelpersCanOverflow;
  
  gHelpersCanOverflow = false;  
  switch(getGUID()) {
  
  //app can overflow
  case FIREFOX_GUID:
  case SEAMONKEY_GUID:
    gHelpersCanOverflow = true;
    break;
    
  //app cannot overflow
  case SUITE_GUID:
  case FLOCK_GUID:
  case NETSCAPE_GUID:
  default:
    gHelpersCanOverflow = false;
    break;
  }
  
  //return the value  
  return gHelpersCanOverflow;
}

/******************************************************************************
 * Open a link in the main application window
 *
 * @param   The url to open.
 * @param   Where to open the link (current, window, tab, tabshifted)
 *****************************************************************************/ 
function openLink(aURL, aWhere)
{
  /* XXX may need to change this code if main window 
     of a supported app is not a browser */
  var win = getMainWindow();
  var browser = win.document.getElementById("content");
  var features = "chrome,all,dialog=no";
  var chrome = "";
  switch (aWhere) {
  
  //open in a new window
  case "window":
  
    switch (getGUID()) {
      
    //apps with navigator.xul as main window
    case SEAMONKEY_GUID:
    case SUITE_GUID:
      chrome = "chrome://navigator/content/navigator.xul";
      win.openDialog(chrome, "_blank", features, aURL, null, null);
      break;
    
    //apps with browser.xul as main window
    case FIREFOX_GUID:
    case NETSCAPE_GUID:
    case FLOCK_GUID:
    default:    
      chrome = "chrome://browser/content/browser.xul";    
      win.openDialog(chrome, "_blank", features, aURL, null, null);
      break;
    }   
    break;
    
  //open in a new tab
  case "tab":
  case "tabshifted":
    var tab = browser.addTab(aURL);
    
    //focus the tab
    if (aWhere == "tab") {
      browser.selectedTab = tab;
      win.content.focus();
    }        
    break;
    
  //open in the current tab
  case "current":
  default: 
    browser.loadURI(aURL);
    win.content.focus();
    break;
  }
}

/******************************************************************************
 * Generic item constructor used by different item components as
 * a prototype for the component.
 *
 * @param     Component name.
 ******************************************************************************/
function ItemBase(aName)
{
  this._name = aName;
  this._ifaces = [this.interfaceID, Ci.ffIItem, 
                  Ci.nsIClassInfo, Ci.nsISupports];
}
ItemBase.prototype = {
  _name: null,
  _ifaces: null,
     
  ////////////////////////////////
  // nsISupports
  QueryInterface: function ItemBase_QueryInterface(aIID)
  {
    var ifaces = this.getInterfaces({});
    for (var i=0; i<ifaces.length; i++) {
      if (aIID.equals(ifaces[i]))
        return this;
    }

    throw Cr.NS_ERROR_NO_INTERFACE;
  },
            
  ////////////////////////////////
  // nsIClassInfo
  getInterfaces: function ItemBase_getInterfaces(aCount)
  {
    aCount.value = this._ifaces.length;
    return this._ifaces;
  },
  
  getHelperForLanguage: function ItemBase_getHelperForLanguage(aLanguage) { return null; },
  get contractID() { return gComponents[this._name].contractID; },
  get classID() { return gComponents[this._name].classID; },
  get classDescription() { return gComponents[this._name].className; },
  get implementationLanguage() { return Ci.nsIProgrammingLanguage.JAVASCRIPT; },
  get flags() { return Ci.nsIClassInfo.MAIN_THREAD_ONLY; },
            
  ////////////////////////////////
  // ffIItem
    
  /**
   * Unique ID of the item.
   */ 
  get ID() { return this.getProperty("ID"); },
    
  /**
   * String enumerator of property names.
   * 
   */
   get properties() { return new KeyEnumerator(this._properties); },
    
  /**
   * Check if a given property is present in the item.
   * 
   * @param   Name of the property to check.
   * @return  True if present, false if absent.
   */
  hasProperty: function ItemBase_hasProperty(aName)
  {
    return this._properties.hasOwnProperty(aName);
  },
                    
  /**
   * Retrieves a specific property from the item.
   * 
   * @param   Name of the property to retrieve.
   * @return  The value of the property or null if property doesn't exist
   */
  getProperty: function ItemBase_getProperty(aName)
  {
    if (!this.hasProperty(aName))
      return null;
    else
      return this._properties[aName];
  },
  
  /**
   * Sets a specific property for the item.
   * 
   * @param   Name of the property to set.
   * @param   The value to set.
   */
  setProperty: function ItemBase_setProperty(aName, aValue)
  {
    this._properties[aName] = aValue;
  },
  
  /**
   * Removes a property.
   * 
   * @param   Name of property to remove.
   */
  deleteProperty: function ItemBase_deleteProperty(aName)
  {
    //do nothing if property not set
    if (!this.hasProperty(aName))
      return;
    
    //delete the property  
    delete this._properties[aName];  
  },
    
  /**
   * Make a duplicate copy of a item.
   * 
   * @return  A item with the same values as the current item.
   */
  clone: function ItemBase_clone()  
  {
    //create a new item
    var item = Cc[this.contractID].createInstance(this.interfaceID);
               
    //loop through all properties and set on new item
    for (var name in this._properties)
      item.setProperty(name, this._properties[name]);
      
    //return the new item
    return item;             
  },
            
  ////////////////////////////////
  // Internal Functions
  
  /**
   * Helper property to get the main interface.
   */
  get interfaceID() { return gComponents[this._name].interfaceID; }     
};

/******************************************************************************
 * Generic service constructor used by different service components as
 * a prototype for the component.
 *
 * @param     Component name.
 ******************************************************************************/
function ServiceBase(aName)
{
  this._name = aName;
  this._ifaces = [this.interfaceID, Ci.ffIService, 
                  Ci.nsIClassInfo, Ci.nsISupports];
  this._bundle = getBundle();  
  this._branch = getBranch(false, null);  
}
ServiceBase.prototype = {
  _name: null,
  _ifaces: null,
  _error: null,
  _bundle: null,
  _branch: null,
     
  ////////////////////////////////
  // nsISupports
  QueryInterface: function ServiceBase_QueryInterface(aIID)
  {
    var ifaces = this.getInterfaces({});
    for (var i=0; i<ifaces.length; i++) {
      if (aIID.equals(ifaces[i]))
        return this;
    }

    throw Cr.NS_ERROR_NO_INTERFACE;
  },
            
  ////////////////////////////////
  // nsIClassInfo
  getInterfaces: function ServiceBase_getInterfaces(aCount)
  {
    aCount.value = this._ifaces.length;
    return this._ifaces;
  },
  
  getHelperForLanguage: function ServiceBase_getHelperForLanguage(aLanguage) { return null; },
  get contractID() { return gComponents[this._name].contractID; },
  get classID() { return gComponents[this._name].classID; },
  get classDescription() { return gComponents[this._name].className; },
  get implementationLanguage() { return Ci.nsIProgrammingLanguage.JAVASCRIPT; },
  get flags() { return Ci.nsIClassInfo.SINGLETON; },
            
  ////////////////////////////////
  // ffIService
  
  /**
   * Initialize the component.  Called by the manager service.  Returns false
   * if component could not be loaded.  Chech the lastError property for
   * more information.
   */
  start: function ServiceBase_start() { return true; },
  
  /**
   * Destroy the component.  Called by the manager service.  This may be
   * called prior to start so it needs to be safe.
   */
  stop: function ServiceBase_stop() {},
      
  /**
   * Last error that occurred.
   */
  get lastError() { return this._error; },
  
  /**
   * The default string bundle.
   */
  get bundle() { return this._bundle; },
  
  /**
   * The default user prefernce branch.
   */
  get branch() { return this._branch; },
  
  ////////////////////////////////
  // Internal Functions
  
  /**
   * Helper property to get the main interface.
   */
  get interfaceID() { return gComponents[this._name].interfaceID; }   
};
 
/******************************************************************************
 * Make a component factory used in getClassObject of nsIModule interface.
 *
 * @param   Component constructor.
 * @return  an nsIFactory object.
 *****************************************************************************/  
function makeFactory(aConstructor)
{
  var factory = {
    QueryInterface: function factory_QueryInterface(aIID) 
    {
      if (!aIID.equals(Ci.nsISupports) &&
          !aIID.equals(Ci.nsIFactory))
        throw Cr.NS_ERROR_NO_INTERFACE;
          
      return this;
    },

    createInstance: function factory_createInstance(aOuter, aIID) 
    {
      if (aOuter != null)
        throw Cr.NS_ERROR_NO_AGGREGATION;
       
      return (new aConstructor()).QueryInterface(aIID);
    },
    
    lockFactory: function factory_lockFactory(aLock)
    {
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    }
  };

  //return the factory object
  return factory;    
}

/******************************************************************************
 * Load a components script.
 *
 * @param   URL of the script file to load.
 *****************************************************************************/  
function loadScript(aURL)
{  
  //get script loader
  var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].
               getService(Ci.mozIJSSubScriptLoader);
                                   
  //load the script
  loader.loadSubScript(aURL, null);
}
 
/******************************************************************************
 * Registration data
 *****************************************************************************/
var gComponents = {
                       
  ErrorItem: {
    classID: Components.ID("{05B9426A-EC5D-4327-99B9-7926AD8491A1}"),
    className: "Forecastfox Error Item",
    contractID: "@ensolis.com/forecastfox/error-item;1",
    interfaceID: Ci.ffIErrorItem,
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/utilities/error-item.js",
    constructor: "ErrorItem"
  },
  
  DiskService: {
    classID: Components.ID("{4386D2C0-560C-45f9-A55F-413FEE243F3D}"),
    className: "Forecastfox Disk I/O Service",
    contractID: "@ensolis.com/forecastfox/disk-service;1",
    interfaceID: Ci.ffIDiskService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/utilities/disk-service.js",
    constructor: "DiskService"
  },
    
  PingService: {
    classID: Components.ID("{0FF66E5D-62B3-4ed2-BF9B-21FCA2CBD357}"),
    className: "Forecastfox Ping Service",
    contractID: "@ensolis.com/forecastfox/ping-service;1", 
    interfaceID: Ci.ffIPingService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/utilities/ping-service.js",
    constructor: "PingService"
  },
                               
  ResolverItem: {
    classID: Components.ID("{0B770FA3-40C6-4a37-806E-6A47E0FFADAE}"),
    className: "Forecastfox Namespace Resolver Item",
    contractID: "@ensolis.com/forecastfox/resolver-item;1", 
    interfaceID: Ci.nsIDOMXPathNSResolver,
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/parser/resolver-item.js",
    constructor: "ResolverItem"
  },
                      
  ConverterItem: {
    classID: Components.ID("{A8102480-27EA-432a-AC68-5161B3E45CC0}"),
    className: "Forecastfox Converter Item",
    contractID: "@ensolis.com/forecastfox/converter-item;1", 
    interfaceID: Ci.ffIConverterItem,
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/parser/converter-item.js",
    constructor: "ConverterItem"
  },
                   
  ConverterService: {
    classID: Components.ID("{0DEC2682-40DB-4b51-A1E5-085991D800D9}"),
    className: "Forecastfox Converter Service",
    contractID: "@ensolis.com/forecastfox/converter-service;1", 
    interfaceID: Ci.ffIConverterService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/parser/converter-service.js",
    constructor: "ConverterService"
  },
                       
  ParserItem: {
    classID: Components.ID("{FC48D906-4F00-4ee0-A035-DEE0CE5AFB9D}"),
    className: "Forecastfox Parser Item",
    contractID: "@ensolis.com/forecastfox/parser-item;1", 
    interfaceID: Ci.ffIParserItem,
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/parser/parser-item.js",
    constructor: "ParserItem"
  },
                   
  ParserService: {
    classID: Components.ID("{1CE4E984-6F2A-4ac8-BE74-8E47C0F4B445}"),
    className: "Forecastfox Parser Service",
    contractID: "@ensolis.com/forecastfox/parser-service;1", 
    interfaceID: Ci.ffIParserService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/parser/parser-service.js",
    constructor: "ParserService"
  },
  
  ProfileItem: {
    classID: Components.ID("{F41536F9-D435-42fe-A362-32217C972418}"),
    className: "Forecastfox Profile Item",
    contractID: "@ensolis.com/forecastfox/profile-item;1", 
    interfaceID: Ci.ffIProfileItem,
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/profiles/profile-item.js",
    constructor: "ProfileItem"
  },   
                   
  ProfileService: {
    classID: Components.ID("{01F8B6C4-F9E1-4dc8-A980-5A9985CD4111}"),
    className: "Forecastfox Profile Service",
    contractID: "@ensolis.com/forecastfox/profile-service;1", 
    interfaceID: Ci.ffIProfileService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/profiles/profile-service.js",
    constructor: "ProfileService"
  },
                   
  MigratorService: {
    classID: Components.ID("{E938FEBC-166F-498c-A35E-654BB0E2DE7E}"),
    className: "Forecastfox Migrator Service",
    contractID: "@ensolis.com/forecastfox/migrator-service;1", 
    interfaceID: Ci.ffIMigratorService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/profiles/migrator-service.js",
    constructor: "MigratorService"
  },
   
  IconItem: {
    classID: Components.ID("{B1DB225E-C16C-452f-B042-F917732D9C2E}"),
    className: "Forecastfox Icon Item",
    contractID: "@ensolis.com/forecastfox/icon-item;1", 
    interfaceID: Ci.ffIIconItem,
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/icons/icon-item.js",
    constructor: "IconItem"
  },
                       
  PackItem: {
    classID: Components.ID("{0666DE3E-4F11-4e0f-9154-894DAA76CC6E}"),
    className: "Forecastfox Pack Item",
    contractID: "@ensolis.com/forecastfox/pack-item;1",
    interfaceID: Ci.ffIPackItem,
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/icons/pack-item.js",
    constructor: "PackItem"
  },                              
  
  PackService: {
    classID: Components.ID("{0AC191C4-F5C5-4590-B95D-46602B430598}"),
    className: "Forecastfox Icon Pack Service",
    contractID: "@ensolis.com/forecastfox/pack-service;1", 
    interfaceID: Ci.ffIPackService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/icons/pack-service.js",
    constructor: "PackService"
  },
    
  WebService: {
    classID: Components.ID("{9172437D-0D7D-4f86-B3E9-0D57AAFA541C}"),
    className: "Forecastfox Web Service",
    contractID: "@ensolis.com/forecastfox/web-service;1", 
    interfaceID: Ci.ffIWebService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/icons/web-service.js",
    constructor: "WebService",
    category: "JavaScript global property",
    entry: "forecastfox"
  },
                                                             
  ManagerService: {
    classID: Components.ID("{5ADF9E4D-EAA6-4223-853D-D932060094E0}"),
    className: "Forecastfox Manager Service",
    contractID: "@ensolis.com/forecastfox/manager-service;1", 
    interfaceID: Ci.ffIManagerService, 
    scriptLoaded: false,
    scriptURL: "chrome://forecastfox/content/utilities/manager-service.js",
    constructor: "ManagerService"
  }    
};

/******************************************************************************
 * Object that implements the nsIModule interface
 *****************************************************************************/
var gModule = {

  registerSelf: function gModule_registerSelf(aCompMgr, aFileSpec, aLocation, aType) 
  {      
    //get the component registrar
    var compMgr = aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
    
    //get the category manager
    var catMgr = Cc["@mozilla.org/categorymanager;1"].
                 getService(Ci.nsICategoryManager);
                 
    //loop through components registration data             
    for (var name in gComponents) {
      var comp = gComponents[name];

      //register factory location
      compMgr.registerFactoryLocation(comp.classID, comp.className, 
                                      comp.contractID, aFileSpec,
                                      aLocation, aType); 
      
      //register category                                
      if (comp.hasOwnProperty("category"))
        catMgr.addCategoryEntry(comp.category, comp.entry, 
                                comp.contractID, true, true);                                      
                                                           
    }
  },

  unregisterSelf: function gModule_unregisterSelf(aCompMgr, aLocation, aType)
  {
    //get the component registrar  
    var compMgr = aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
    
    //get the category manager
    var catMgr = Cc["@mozilla.org/categorymanager;1"].
                 getService(Ci.nsICategoryManager);
                                      
    //loop through components registration data             
    for (var name in gComponents) {
      var comp = gComponents[name];
      
      //unregister factory location
      compMgr.unregisterFactoryLocation(comp.classID, aLocation);  
      
      //unregister category                                
      if (comp.hasOwnProperty("category"))      
        catMgr.deleteCategoryEntry(comp.category, comp.entry,
                                   comp.contractID, true);                                         
    }        
  },
  
  getClassObject: function gModule_getClassObject(aCompMgr, aCID, aIID) 
  {
    //throw if not requesting a factory
    if (!aIID.equals(Ci.nsIFactory))
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;
      
    //loop through components registration data             
    for (var name in gComponents) {
      var comp = gComponents[name];

      //component matches  
      if (aCID.equals(comp.classID)) {
        
        //load the script if it isn't loaded
        if (!comp.scriptLoaded) {
          loadScript(comp.scriptURL);
          comp.scriptLoaded = true;
        }
            
        //return factory
        return makeFactory(eval(comp.constructor));
      }
    }
    
    //throw if not found
    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function gModule_canUnload(compMgr) { return true; }
};

/******************************************************************************
 * Module entry point
 *****************************************************************************/
function NSGetModule(compMgr, fileSpec) 
{
  return gModule;
}
