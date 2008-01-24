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
 * The Original Code is Mozilla.
 *
 * The Initial Developer of the Original Code is IBM Corporation.
 * Portions created by IBM Corporation are Copyright (C) 2004
 * IBM Corporation. All Rights Reserved.
 *
 * Contributor(s):
 *   Collin Jackson <mozilla@collinjackson.com>
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

/* Module related constants */
const kMODULE_NAME = "History Wrapper";
const kMODULE_CONTRACTID = "@mozilla.org/browser/global-history;2";
const kMODULE_CID = Components.ID("e1364741-77b9-4a96-aebe-06e2a3e3eeb2");
const kENABLED_PREF = "stanford-safehistory.enabled";
const nsISafeHistory = Components.interfaces.nsISafeHistory;

/* Mozilla defined interfaces */
const nsISupports = Components.interfaces.nsISupports;
const nsIComponentRegistrar = Components.interfaces.nsIComponentRegistrar;
const nsIGlobalHistory2 = Components.interfaces.nsIGlobalHistory2; 
const nsIBrowserHistory = Components.interfaces.nsIBrowserHistory; 
const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
const kHistoryInterfaces = [ "nsIBrowserHistory", "nsIGlobalHistory2" ];

/* Mozilla defined components */
const kREAL_HISTORY_CID = "{59648a91-5a60-4122-8ff2-54b839c84aed}";
const kREAL_HISTORY = Components.classesByID[kREAL_HISTORY_CID];
const kPREFS = Components.classes["@mozilla.org/preferences-service;1"];
const kOBSERVERS = Components.classes["@mozilla.org/observer-service;1"];

var debug = false;

function HistoryWrapper() {
  this._enabled = function() {
    return kPREFS.getService(nsIPrefBranch).getBoolPref(kENABLED_PREF);
  };
  this._history = function() {
    var history = kREAL_HISTORY.getService();
    for (var i = 0; i < kHistoryInterfaces.length; i++) {
      history.QueryInterface(Components.interfaces[kHistoryInterfaces[i]]);
    }
    return history;
  };
  if(debug) dump("SSH: History wrapper initialized.\n");
}

HistoryWrapper.prototype =
{
  QueryInterface: function(iid) {

    if (iid.equals(Components.interfaces.nsISafeHistory ||
        iid.equals(Components.interfaces.nsISupports))) {
      return this;
    }

    var history = this._history().QueryInterface(iid);
    this.init(history);
    return this;
  },

  /* 
   * Copies methods from the true history object
   */
  init: function(history) {
    var mimic = function(obj, method) {
      obj[method] = function(a, b, c, d, e, f, g) {
        history[method](a, b, c, d, e, f, g);
      };
      if(debug) dump("SSH: Now copying " + method + " of history.\n");
    };
    for (var method in history) {
      if(typeof(this[method]) == "undefined") mimic(this, method);
    }
  },

  /* 
   * When true, history will report visited links normally.
   * Otherwise, history will report links as unvisited.
   */
  isVisitedLinkAllowed: false, 

  /* 
   * Use isVisitedLinksAllowed to modify answer to isVisited
   */ 
  isVisited: function(aURI) {
    return (this.isVisitedLinkAllowed || !this._enabled()) && 
      this._history().isVisited(aURI);
  },

  /*
   * Add the current referrer to the list of referrers
   */
  addURI: function(aURI, redirect, toplevel, referrer) { 
    if(referrer) {
      var prefix = "http://www.safehistory.com/referrer?";
      var solution = prefix + escape(referrer.spec);
      var RDF = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                          .getService(Components.interfaces.nsIRDFService);
      var history = RDF.GetDataSource("rdf:history");
      var source = RDF.GetResource(aURI.spec);
      var property = 
        RDF.GetResource("http://home.netscape.com/NC-rdf#Referrer");
      var targets = history.GetTargets(source, property, true);
      while (targets.hasMoreElements()) {
        var target = targets.getNext();
        target.QueryInterface(Components.interfaces.nsIRDFResource);
        if (target.Value.indexOf(prefix) == 0) {
          solution = target.Value + "&" + escape(referrer.spec);          
          var oldreferrers = target.Value.split("?")[1].split("&");
          for (var i = 0; i < oldreferrers.length; i++) {
            if (oldreferrers[i] == escape(referrer.spec)) {
              solution = target.Value; 
            }
          }
        }
      }
      var ioService = 
        Components.classes["@mozilla.org/network/io-service;1"]
                  .getService(Components.interfaces.nsIIOService);
      try {
        referrer = ioService.newURI(solution, null, null);
        this._history().removePage(aURI);  // allows referrer to change
        if(debug) dump("SSH: Stored referrer to " + referrer.spec + ".\n");
      } catch(ex) { 
        if(debug) dump("SSH: Failed to parse " + solution + "\n"); 
      }
    }
    this._history().addURI(aURI, redirect, toplevel, referrer);
  },

  count getter: function() { return this._history().count; },
};
 
var HistoryWrapperSingleton = null;
var HistoryWrapperFactory = new Object();

HistoryWrapperFactory.createInstance = function (outer, iid)
{
  if (outer != null)
    throw Components.results.NS_ERROR_NO_AGGREGATION;

  if (!iid.equals(nsIGlobalHistory2) &&
      !iid.equals(nsIBrowserHistory) &&
      !iid.equals(nsISafeHistory) &&
      !iid.equals(nsISupports))
    throw Components.results.NS_ERROR_NO_INTERFACE;

  if(!HistoryWrapperSingleton)
    HistoryWrapperSingleton = new HistoryWrapper();

  return HistoryWrapperSingleton;
};


/**
 * JS XPCOM component registration goop:
 *
 * We set ourselves up to observe the xpcom-startup category.  This provides
 * us with a starting point.
 */

var HistoryWrapperModule = new Object();

HistoryWrapperModule.registerSelf = 
function (compMgr, fileSpec, location, type){
  compMgr = compMgr.QueryInterface(nsIComponentRegistrar);
  compMgr.registerFactoryLocation(kMODULE_CID,
                                  kMODULE_NAME,
                                  kMODULE_CONTRACTID,
                                  fileSpec, 
                                  location, 
                                  type);
};

HistoryWrapperModule.getClassObject = function (compMgr, cid, iid)
{
  if (!cid.equals(kMODULE_CID))
    throw Components.results.NS_ERROR_NO_INTERFACE;

  if (!iid.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    
  return HistoryWrapperFactory;
};

HistoryWrapperModule.canUnload = function (compMgr)
{
  return true;
};

function NSGetModule(compMgr, fileSpec)
{
  return HistoryWrapperModule;
}
