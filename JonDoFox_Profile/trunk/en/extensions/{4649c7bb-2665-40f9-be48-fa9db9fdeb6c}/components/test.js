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
const kMODULE_NAME = "History Wrapper Test";
const kMODULE_CONTRACTID = "@stanford.edu/components/test;1";
const kMODULE_CID = Components.ID("c8a071c7-80a1-4793-b564-3a242403b507");
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

var debug = true;

function HistoryWrapper() {
  if(debug) dump("SSH: History wrapper test initialized.");
}

HistoryWrapper.prototype =
{
  QueryInterface: function(iid) {

    if (iid.equals(Components.interfaces.nsISafeHistory ||
        iid.equals(Components.interfaces.nsISupports))) {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  /* 
   * When true, history will report visited links normally.
   * Otherwise, history will report links as unvisited.
   */
  isVisitedLinkAllowed: false, 
};
 
var HistoryWrapperSingleton = null;
var HistoryWrapperFactory = new Object();

HistoryWrapperFactory.createInstance = function (outer, iid)
{
  if (outer != null)
    throw Components.results.NS_ERROR_NO_AGGREGATION;

  if (!iid.equals(nsISafeHistory) &&
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
function (compMgr, fileSpec, location, type) {
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
