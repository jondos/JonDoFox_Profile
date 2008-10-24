/******************************************************************************
 * Copyright (C) 2008, JonDos GmbH
 * Author: Johannes Renner
 *
 * JonDoFox extension management and compatibility tasks + utilities
 * TODO: Create another component containing the utils only
 *****************************************************************************/
 
///////////////////////////////////////////////////////////////////////////////
// Debug stuff
///////////////////////////////////////////////////////////////////////////////

var mDebug = true;

// Log a message
function log(message) {
  if (mDebug) dump("JDFManager :: " + message + "\n");
}

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////

// XPCOM constants
const CLASS_ID = Components.ID('{b5eafe36-ff8c-47f0-9449-d0dada798e00}');
const CLASS_NAME = 'JonDoFox-Manager'; 
const CONTRACT_ID = '@jondos.de/jondofox-manager;1';

const CC = Components.classes;
const CI = Components.interfaces;

///////////////////////////////////////////////////////////////////////////////
// Listen for events to delete traces in case of uninstall etc.
///////////////////////////////////////////////////////////////////////////////

// Singleton instance definition
var JDFManager = {
  
  // Extension version
  VERSION: null,

  // The proxy state preference
  STATE_PREF: 'extensions.jondofox.proxy.state',
  NO_PROXIES: 'extensions.jondofox.proxy.no_proxies_on',
  REF_PREF: 'extensions.jondofox.set_referrer',
 
  // Possible values of the 'STATE_PREF'
  STATE_NONE: 'none',  
  STATE_JONDO: 'jondo',
  STATE_TOR: 'tor',
  STATE_CUSTOM: 'custom',

  // Set this to indicate that cleaning up is necessary
  clean: false,
  // Remove jondofox preferences branch on uninstall only
  uninstall: false,
  // Set this to true if the user was warned that an important pref was modified
  userWarned: false,

  // Incompatible extensions with their IDs
  extensions: { 
    'CuteMenus':'{63df8e21-711c-4074-a257-b065cadc28d8}',
    'RefControl':'{455D905A-D37C-4643-A9E2-F6FEFAA0424A}',
    'SwitchProxy':'{27A2FD41-CB23-4518-AB5C-C25BAFFDE531}' 
  },

  // This map of string preferences is given to the prefsMapper
  stringPrefsMap: { 
    'general.appname.override':'extensions.jondofox.appname_override',
    'general.appversion.override':'extensions.jondofox.appversion_override',
    'general.buildID.override':'extensions.jondofox.buildID_override',
    'general.oscpu.override':'extensions.jondofox.oscpu_override',
    'general.platform.override':'extensions.jondofox.platform_override',
    'general.productsub.override':'extensions.jondofox.productsub_override',
    'general.useragent.override':'extensions.jondofox.useragent_override',
    'general.useragent.vendor':'extensions.jondofox.useragent_vendor',
    'general.useragent.vendorSub':'extensions.jondofox.useragent_vendorSub',
    'intl.accept_languages':'extensions.jondofox.accept_languages',
    'intl.charset.default':'extensions.jondofox.default_charset',
    'intl.accept_charsets':'extensions.jondofox.accept_charsets',
    'network.http.accept.default':'extensions.jondofox.accept_default' 
  },

  // Different services
  prefsHandler: null,
  prefsMapper: null,
  proxyManager: null,
  promptService: null,

  // Localization strings
  stringBundle: null,

  // Inititalize services and stringBundle
  init: function() {
    log("Initialize JDFManager");
    try {
      // Determine version
      this.VERSION = this.getVersion();
      // Init services
      this.prefsHandler = CC['@jondos.de/preferences-handler;1'].
                             getService().wrappedJSObject;
      this.prefsMapper = CC['@jondos.de/preferences-mapper;1'].
                            getService().wrappedJSObject;
      this.proxyManager = CC['@jondos.de/proxy-manager;1'].
                             getService().wrappedJSObject;
      this.promptService = CC['@mozilla.org/embedcomp/prompt-service;1'].
                              getService(CI.nsIPromptService);
      var bundleService = CC['@mozilla.org/intl/stringbundle;1'].
                             getService(CI.nsIStringBundleService);
      // Create the string bundle
      this.stringBundle = bundleService.createBundle(
                             'chrome://jondofox/locale/jondofox.properties');
      // Register the proxy filter
      this.registerProxyFilter();
    } catch (e) {
      log('init(): ' + e);
    }
  },

  // Implement nsIProtocolProxyFilter for being able to bypass 
  // proxies for certain URIs that are on the noProxyList below
  applyFilter: function(ps, uri, proxy) {
    //log("Applying proxy filter for URI: " + uri.spec);
    try {
      //log("Proxy is " + proxy.host + ":" + proxy.port);
      // Lookup the no proxy list
      if (this.noProxyListContains(uri.spec)) {
        log("URI is on the list --> No proxy for " + uri.spec);
        // No proxy
        return null;
      } else {
        return proxy;
      }
    } catch (e) {
      log("applyFilter(): " );
    }
  },

  // Register the proxy filter
  registerProxyFilter: function() {
    log("Registering proxy filter ..");
    try {
      // Get the proxy service
      proxyService = CC['@mozilla.org/network/protocol-proxy-service;1'].
                        getService(CI.nsIProtocolProxyService);
      proxyService.registerFilter(this, 0);
      // Example for creating a ProxyInfo object:
      //proxyService.newProxyInfo("direct", "", -1, 0, 0, null);
    } catch (e) {
      log("registerProxyFilter(): " + e);
    }
  },
 
  /**
   * Try to uninstall other extensions that are not compatible
   */ 
  checkExtensions: function() {
    try {
      // Indicate a necessary restart
      var restart = false;
      // Iterate
      for (e in this.extensions) {
        log('Checking for ' + e);
        // If present, uninstall
        if (this.isInstalled(this.extensions[e])) {
          // XXX: Allow RefControl in some cases
          if (e == 'RefControl' && 
                 !this.prefsHandler.getBoolPref(this.REF_PREF)) {
            log("Ignoring RefControl");
          } else {
            log('Found ' + e + ', uninstalling ..');
            // Prompt a message window for every extension
            this.showAlert(this.getString('jondofox.dialog.attention'), 
                   this.formatString('jondofox.dialog.message.extension', [e]));
            // Uninstall and set restart to true
            this.uninstallExtension(this.extensions[e]);
            restart = true;
          }
        } else {
          log(e + ' not found');
        }
      }
      if (restart) {
        // Programmatically restart the browser
        this.restartBrowser();
      }
    } catch (err) {
      log("checkExtensions(): " + err);
    }
  },

  // Call this on final-ui-startup
  onUIStartup: function() {
    log("Starting up, checking conditions ..");
    try {
      // Call init() first
      this.init();
      // Check for incompatible extensions
      this.checkExtensions();
      // Map all preferences
      this.prefsMapper.setStringPrefs(this.stringPrefsMap);  
      this.prefsMapper.map();
      // Add an observer to the main pref branch after setting the prefs
      var prefs = this.prefsHandler.prefs;
      prefs.QueryInterface(CI.nsIPrefBranch2);
      prefs.addObserver("", this, false);
      log("Observing privacy-related preferences ..");
      // XXX: Reset 'set_referrer' to true
      if (!this.prefsHandler.getBoolPref(this.REF_PREF) && 
             !this.isInstalled(this.extensions['RefControl']) ) {
        log("Resetting 'set_referrer'");
	this.prefsHandler.setBoolPref(this.REF_PREF, true);
      }
      // Disable the history
      this.prefsHandler.setIntPref('browser.history_expire_days', 0);
      // If cookies are accepted from *all* sites --> reject 3rd-party cookies
      var cookiePref = this.prefsHandler.
                               getIntPref('network.cookie.cookieBehavior');
      if (cookiePref == 0) {
        this.prefsHandler.setIntPref('network.cookie.cookieBehavior', 1);
      }
      // If this is set, set it to false
      if (this.prefsHandler.
                  isPreferenceSet('local_install.showBuildinWindowTitle')) {
        this.prefsHandler.
                setBoolPref('local_install.showBuildinWindowTitle', false);
      }
      // Set the initial proxy state
      log("Setting initial proxy state ..");
      this.setProxy(this.getState());
    } catch (e) {
      log("onUIStartup(): " + e);
    }
  },

  // General cleanup function for deinstallation etc.
  cleanup: function() {
    log("Cleaning up ..");
    try {
      // Remove the preferences observer      
      log("Stop observing preferences ..");
      this.prefsHandler.prefs.removeObserver("", this);
      // Unmap preferences
      this.prefsMapper.unmap();     
      // Delete the jondofox prefs branch only on uninstall
      if (this.uninstall) {
        log("Deinstallation, deleting jondofox branch ..");
        this.prefsHandler.deleteBranch('extensions.jondofox');
      } else {
        // On disable, reset the state only
        this.prefsHandler.deletePreference('extensions.jondofox.proxy.state');
      }
    } catch (e) {
      log("onUninstall(): " + e);
    }
  },

  // This is called once on application startup
  registerObservers: function() {
    log("Register observers");
    try {
      var observers = CC["@mozilla.org/observer-service;1"].
                         getService(CI.nsIObserverService);
      // Add general observers
      observers.addObserver(this, "final-ui-startup", false);
      observers.addObserver(this, "em-action-requested", false);
      observers.addObserver(this, "quit-application-granted", false);
      observers.addObserver(this, "xul-window-destroyed", false);
    } catch (ex) {
      log("registerObservers(): " + ex);
    }
  },

  // Called once on application shutdown
  unregisterObservers: function() {
    log("Unregister observers");
    try {
      var observers = CC["@mozilla.org/observer-service;1"].
                         getService(CI.nsIObserverService);
      // Remove general observers
      observers.removeObserver(this, "final-ui-startup");
      observers.removeObserver(this, "em-action-requested");
      observers.removeObserver(this, "quit-application-granted");    
      observers.removeObserver(this, "xul-window-destroyed");
    } catch (ex) {
      log("unregisterObservers(): " + ex);
    }
  },
  
  // Utility functions ////////////////////////////////////////////////////////
  
  // Show an alert using the prompt service
  showAlert: function(title, text) {
    try {
      return this.promptService.alert(null, title, text);
    } catch (e) {
      log("showAlert(): " + e);
    }
  },
  
  // Show a confirm dialog using the prompt service
  showConfirm: function(title, text) {
    try {
      return this.promptService.confirm(null, title, text);
    } catch (e) {
      log("showConfirm(): " + e);
    }
  },

  // Return a properties string
  getString: function(name) {
    //log("Getting localized string: '" + name + "'");
    try {
      return this.stringBundle.GetStringFromName(name);
    } catch (e) {
      log("getString(): " + e);
    }
  },

  // Return a formatted string
  formatString: function(name, strArray) {
    //log("Getting formatted string: '" + name + "'");
    try {
      return this.stringBundle.formatStringFromName(name, strArray, 
                                  strArray.length);
    } catch (e) {
      log("formatString(): " + e);
    }  
  },

  /**
   * Return the version string of this extension
   */
  getVersion: function() {
    try {
      // Get the extension-manager and rdf-service
      var extMgr = CC["@mozilla.org/extensions/manager;1"].
                      getService(CI.nsIExtensionManager);
      var rdfService = CC["@mozilla.org/rdf/rdf-service;1"].getService().
                          QueryInterface(CI.nsIRDFService);
      // Our ID
      var extID="{437be45a-4114-11dd-b9ab-71d256d89593}";
      var version = "";
      // Init ingredients
      var ds = extMgr.datasource;
      var res = rdfService.GetResource("urn:mozilla:item:" + extID);
      var prop = rdfService.
                    GetResource("http://www.mozilla.org/2004/em-rdf#version");
      // Get the target
      var target = ds.GetTarget(res, prop, true);
      if(target != null) {
        version = target.QueryInterface(CI.nsIRDFLiteral).Value;
      }
      log("Current version is " + version);
      return version;
    } catch (e) {
      log("getVersion(): " + e);
    }
  },


  /**
   * Return true if a given extension is installed, else return false
   */
  isInstalled: function(eID) {
    //log('Checking for ' + eID);
    try {
      // Get the extensions manager
      var em = CC['@mozilla.org/extensions/manager;1'].
                  getService(CI.nsIExtensionManager);
      // Try to get the install location
      var loc = em.getInstallLocation(eID);
      return loc != null;
    } catch (err) {
      log("isInstalled(): " + err);
    }    
  },

  /**
   * Uninstall a given extension
   */
  uninstallExtension: function(eID) {
    log('Uninstalling ' + eID);
    try {
      // Get the extensions manager
      var em = CC['@mozilla.org/extensions/manager;1'].
                  getService(CI.nsIExtensionManager);
      // Try to get the install location
      em.uninstallItem(eID);
    } catch (err) {
      log("uninstallExtension(): " + err);
    }
  },

  /**
   * Return the current number of browser windows (not used at the moment)
   */
  getWindowCount: function() {
    var ww = CC["@mozilla.org/embedcomp/window-watcher;1"].
                getService(CI.nsIWindowWatcher);  
    var window_enum = ww.getWindowEnumerator();
    var count = 0;
    while (window_enum.hasMoreElements()) {
      count++;
      window_enum.getNext();
    }
    return count;
  },

  /**
   * Restart the browser using nsIAppStartup
   */
  restartBrowser: function() {
    log("Restarting the application ..");
    try {
      var appStartup = CC['@mozilla.org/toolkit/app-startup;1'].
                          getService(CI.nsIAppStartup);
      // If this does not work, use 'eForceQuit'
      appStartup.quit(CI.nsIAppStartup.eAttemptQuit|CI.nsIAppStartup.eRestart);
    } catch (e) {
      log("restartBrowser(): " + e);
    }
  },
 
  // 'No proxy list' implementation ///////////////////////////////////////////

  // A list of URIs
  noProxyList: [],

  // Check if 'uri' is on the list
  noProxyListContains: function(uri) {
    //log("Lookup URI: " + uri);
    try {
      if (uri in this.convert(this.noProxyList)) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      log("noProxyListContains(): " + e);
    }
  },
 
  // XXX: Rather use RegExp here for performance reasons?
  // Enable value lookup by converting array to hashmap
  convert: function(a) {
    var o = {};
    for(var i=0; i<a.length; i++) {
      o[a[i]]='';
    }
    return o;
  },

  // Add an element to the list
  noProxyListAdd: function(uri) {
    log("No proxy list add: " + uri); 
    try {
      // Add URI if it is not already on the list
      if (!this.noProxyListContains(uri)) {
        this.noProxyList.push(uri);
      } else {
        log("NOT adding " + uri + " since it is already on the list");
      }
    } catch (e) {
      log("noProxyListAdd(): " + e);
    }
  },

  // Remove an URI from the list
  noProxyListRemove: function(uri) {
    log("No proxy list remove: " + uri);
    try {
      this.noProxyList.splice(this.noProxyList.indexOf(uri), 1);
    } catch (e) {
      log("noProxyListRemove(): " + e);
    } 
  },

  // Proxy and state management ///////////////////////////////////////////////

  // Set the value of the 'STATE_PREF'  
  setState: function(state) {
    try {
      this.prefsHandler.setStringPref(this.STATE_PREF, state);
    } catch (e) {
      log("setState(): " + e);
    }  
  },
  
  // Return the value of the 'STATE_PREF'
  getState: function() {
    try {
      return this.prefsHandler.getStringPref(this.STATE_PREF);
    } catch (e) {
      log("getState(): " + e);
    }
  },

  // Set state to NONE and disable the proxy
  disableProxy: function() {
    try {
      // Set the state and call disable on the proxy manager
      this.setState(this.STATE_NONE);
      this.proxyManager.disableProxy();
    } catch (e) {
      log("disableProxy(): " + e);
    }
  },

  // Set the JonDoFox-extension into a certain proxy state
  // Return true if the state has changed, false otherwise
  setProxy: function(state) {
    log("Setting proxy state to '" + state + "'");
    try {
      // Store the previous state to detect state changes
      var previousState = this.getState();
      // STATE_NONE --> straight disable
      if (state == this.STATE_NONE) {
        this.disableProxy();
      } else {
        // State is not 'STATE_NONE' --> enable
        switch (state) {
          case this.STATE_JONDO:
            // Set proxies for all protocols but SOCKS
            this.proxyManager.setProxyAll('127.0.0.1', 4001);
            this.proxyManager.setProxySOCKS('', 0, 5);
            // Set default exceptions
            this.proxyManager.setExceptions(this.prefsHandler.
                                 getStringPref(this.NO_PROXIES));
            break; 
 
          case this.STATE_TOR:
            // Set SOCKS proxy only
            this.proxyManager.setProxySOCKS('127.0.0.1', 9050, 5);
            this.proxyManager.setSocksRemoteDNS(true);
            this.proxyManager.setProxyAll('', 0);
            // Set default exceptions
            this.proxyManager.setExceptions(this.prefsHandler.
                                 getStringPref(this.NO_PROXIES));
            break;

          case this.STATE_CUSTOM:
            // Get custom prefs ..
            var prefix = "extensions.jondofox.custom.";
            this.proxyManager.setProxyHTTP(
                    this.prefsHandler.getStringPref(prefix + "http_host"),
                    this.prefsHandler.getIntPref(prefix + "http_port"));
            this.proxyManager.setProxySSL(
                    this.prefsHandler.getStringPref(prefix + "ssl_host"),
                    this.prefsHandler.getIntPref(prefix + "ssl_port"));
            this.proxyManager.setProxyFTP(
                    this.prefsHandler.getStringPref(prefix + "ftp_host"),
                    this.prefsHandler.getIntPref(prefix + "ftp_port"));
            this.proxyManager.setProxyGopher(
                    this.prefsHandler.getStringPref(prefix + "gopher_host"),
                    this.prefsHandler.getIntPref(prefix + "gopher_port"));
            this.proxyManager.setProxySOCKS(
                    this.prefsHandler.getStringPref(prefix + "socks_host"),
                    this.prefsHandler.getIntPref(prefix + "socks_port"),
                    this.prefsHandler.getIntPref(prefix + "socks_version"));
            this.proxyManager.setExceptions(
                    this.prefsHandler.getStringPref(prefix + "no_proxies_on"));
            break;

          default:
            log("!! Unknown proxy state: " + state);
            return false;
        }
        // Set the state first and then enable
        this.setState(state);
        this.proxyManager.enableProxy();
      }
      // Return true if the state has changed, false otherwise
      if (previousState == state) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      log("setProxy(): " + e);
    }
  },

  // Clear all cookies, e.g. when switching from one state to another
  clearAllCookies: function() {
    log("Clearing all cookies");
    try {
      CC["@mozilla.org/cookiemanager;1"].getService(CI.nsICookieManager).
                                            removeAll();
    } catch (e) {
      log("clearAllCookies(): " + e);
    }
  },

  // Implement nsIObserver ////////////////////////////////////////////////////
  
  observe: function(subject, topic, data) {
    try {
      switch (topic) {        
        case 'app-startup':
          log("Got topic --> " + topic);
          // Register observers
          this.registerObservers();
          break;
        
        case 'quit-application-granted':
          log("Got topic --> " + topic);
          // Clear preferences on shutdown after uninstall
          if (this.clean) {
            this.cleanup();
          }
          // Unregister observers
          this.unregisterObservers();
          break;
        
        case 'final-ui-startup':
          log("Got topic --> " + topic);
          // Check conditions on startup
          this.onUIStartup();
          log("Finished UI startup");
          break;

        case 'em-action-requested':
          // Filter on the item ID here to detect deinstallation etc.
          subject.QueryInterface(CI.nsIUpdateItem);
          if (subject.id == "{437be45a-4114-11dd-b9ab-71d256d89593}") {
            log("Got topic --> " + topic + ", data --> " + data);
            if (data == "item-uninstalled" || data == "item-disabled") {
              // Uninstall or disable
              this.clean = true;
              // If we are going to uninstall .. remove jondofox pref branch
              if (data == "item-uninstalled") {
                this.uninstall = true;
              }
            } else if (data == "item-cancel-action") {
              // Cancellation ..
              this.clean = false;
              this.uninstall = false;
            }
          }
          break;

        case 'xul-window-destroyed':
          // Get the index of the closed window
          //var i = this.getWindowCount();
          //log("Window " + i + " --> " + topic);
          
          // Not necessary since closing the last window will also cause
          // 'quit-application-granted' .. let the code stay here though:
          //   http://forums.mozillazine.org/viewtopic.php?t=308369
          /* if (i == 0 && this.clean) { 
            this.cleanup(); 
            this.unregisterObservers()
          } */
          break;

        case 'nsPref:changed':
          // Check if someone enables the history?
          //   'browser.history_expire_days'
          
          // Do not allow to accept ALL cookies
          if (data == 'network.cookie.cookieBehavior') {
            if (this.prefsHandler.getIntPref('network.cookie.cookieBehavior') == 0) {
              this.prefsHandler.setIntPref('network.cookie.cookieBehavior', 1)
              // Warn the user
              this.showAlert(this.getString('jondofox.dialog.attention'), 
                             this.getString('jondofox.dialog.message.cookies'));
            }
          }

          // Check if the changed preference is on the map
          else if (data in this.stringPrefsMap && !this.userWarned) {
            log("Pref '" + data + "' is on the map!");
            // If the new value is not the recommended ..
            if (this.prefsHandler.getStringPref(data) != 
                   this.prefsHandler.getStringPref(this.stringPrefsMap[data])) {
              // ... warn the user
              this.showAlert(this.getString('jondofox.dialog.attention'), 
                             this.getString('jondofox.dialog.message.prefchange'));
              this.userWarned = true;
            } else {
              log("All good!");
            }
          }
          break;
          
        default:
          log("!! Topic not handled --> " + topic);
          break;
      }
    } catch (ex) {
      log("observe: " + ex);
    }
  },
  
  // Implement nsISupports
  QueryInterface: function(iid) {
    if (!iid.equals(CI.nsISupports) &&
        !iid.equals(CI.nsIObserver))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
}

///////////////////////////////////////////////////////////////////////////////
// Implementations of nsIModule and nsIFactory
///////////////////////////////////////////////////////////////////////////////

var JDFManagerModule = {

  // BEGIN nsIModule
  registerSelf: function(compMgr, fileSpec, location, type) {
    log("Registering '" + CLASS_NAME + "' ..");
    compMgr.QueryInterface(CI.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, 
               fileSpec, location, type);
    var catMan = CC["@mozilla.org/categorymanager;1"].
                    getService(CI.nsICategoryManager);
    catMan.addCategoryEntry("app-startup", "JDFManager", CONTRACT_ID, true, 
              true);
  },

  unregisterSelf: function(compMgr, fileSpec, location) {
    log("Unregistering '" + CLASS_NAME + "' ..");
    compMgr.QueryInterface(CI.nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(CLASS_ID, fileSpec);
    var catMan = CC["@mozilla.org/categorymanager;1"].
                    getService(CI.nsICategoryManager);
    catMan.deleteCategoryEntry("app-startup", CONTRACT_ID, true);
  },

  getClassObject: function(compMgr, cid, iid) {
    if (!cid.equals(CLASS_ID))
      throw Components.results.NS_ERROR_FACTORY_NOT_REGISTERED;
    if (!iid.equals(CI.nsIFactory))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this.classFactory;
  },

  canUnload: function(compMgr) { 
    return true; 
  },
  // END nsIModule

  // Implement nsIFactory
  classFactory: {
    createInstance: function(aOuter, aIID) {
      //log("createInstance()");
      if (aOuter != null)
        throw Components.results.NS_ERROR_NO_AGGREGATION;
      // Set wrappedJSObject
      if (!JDFManager.wrappedJSObject) {
        log("Creating instance, setting wrappedJSObject ..");
        JDFManager.wrappedJSObject = JDFManager;
      }
      return JDFManager.QueryInterface(aIID);
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
// This function is called when the application registers the component
///////////////////////////////////////////////////////////////////////////////

function NSGetModule(comMgr, fileSpec) {
  return JDFManagerModule; 
}
