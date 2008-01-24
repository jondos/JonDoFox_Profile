/***************************************************************************
Name: CS Lite
Description: Control cookie permissions.
Author: Ron Beckman
Homepage: http://forum.softwareblaze.com

Copyright (C) 2007  Ron Beckman

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to:

Free Software Foundation, Inc.
51 Franklin Street
Fifth Floor
Boston, MA  02110-1301
USA
***************************************************************************/


var cookiesafeShutdown = {

	exit: function() {
		//remove temp exceptions
		this.removeTempExceptions();

		//clear last 10 hosts array
		var lastten = this.getCSLast10Hosts();
		lastten.clearLastTenHosts();

		//clear all cookies and exceptions
		var prefs = this.getPrefs();
		var clck = prefs.getBoolPref('clearCookies');
		var clex = prefs.getBoolPref('clearExceptions');
		if (clck) this.clearCookies2();
		if (clex) this.clearExceptions2();

		//check if browser is TB2 and close db connection if possible
		var brows = this.getAppInfo();
		var num = parseInt(brows.version);
		if (brows.name=='Thunderbird' && num==2) {
			var permMngr = this.getPermManager();
			permMngr.closeDB();
		}
	},

	getCS: function() {
		return Components.classes['@mozilla.org/CookieSafe;1'].
		createInstance(Components.interfaces.nsICookieSafe);
	},

	getCSHiddenMenuItems: function() {
		return Components.classes['@mozilla.org/CSHiddenMenuItems;1'].
		createInstance(Components.interfaces.nsICSHiddenMenuItems);
	},

	getCSLast10Hosts: function() {
		return Components.classes['@mozilla.org/CSLast10Hosts;1'].
		getService(Components.interfaces.nsICSLast10Hosts);
	},

	getCSTempExceptions: function() {
		return Components.classes['@mozilla.org/CSTempExceptions;1'].
		getService(Components.interfaces.nsICSTempExceptions);
	},

	getExtManager: function() {
		var mngr = Components.classes['@mozilla.org/extensions/manager;1'];
		return (mngr) ? mngr.getService(Components.interfaces.nsIExtensionManager) : false;
	},

	restartBrowser: function() {
		var nsIAppStartup = Components.interfaces.nsIAppStartup;
		Components.classes["@mozilla.org/toolkit/app-startup;1"].
		getService(nsIAppStartup).
		quit(nsIAppStartup.eForceQuit | nsIAppStartup.eRestart);
	},

	getProfile: function() {
		return Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("ProfD", Components.interfaces.nsIFile);
	},

	getAppInfo: function() {
		return Components.classes['@mozilla.org/xre/app-info;1'].
		createInstance(Components.interfaces.nsIXULAppInfo);
	},

	getPermManager: function() {
		//check if browser is TB2
		var brows = this.getAppInfo();
		var num = parseInt(brows.version);
		if (brows.name=='Thunderbird' && num==2) {
			return Components.classes["@mozilla.org/CSPermManager;1"].
			getService(Components.interfaces.nsICSPermManager);
		} else {
			return Components.classes["@mozilla.org/permissionmanager;1"].
			getService(Components.interfaces.nsIPermissionManager);
		}
	},

	removeTempExceptions: function() {
		var tempExc = this.getCSTempExceptions();
		var perms = tempExc.getTempExceptions();
		if (!perms) return false;

		//remove temp exceptions
		perms = perms.split(' ');
		var mngr = this.getPermManager();
		for (var i=0; i<perms.length; ++i) {
			if (!perms[i]) continue;
			try {
				mngr.remove(perms[i],'cookie');
			} catch(e) {
				continue;
			}
		}

		tempExc.clearTempExceptions();

		/*we use the tempExceptons char pref as a backup in case the
		browser crashes before all temp exceptions can be cleared.
		the char pref is cleared only after they have all been
		successfully removed.*/
		var prefs = this.getPrefs();
		prefs.setCharPref('tempExceptions','');
		return false;
	},

	getPrefs: function() {
		return Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefService).
		getBranch("cookiesafe.");
	},

	clearCookies2: function() {
		var mngr = this.getCookieManager();
		mngr.removeAll();
	},

	getCookieManager: function() {
		return Components.classes["@mozilla.org/cookiemanager;1"].
		getService(Components.interfaces.nsICookieManager);
	},

	clearExceptions2: function() {
		var exc,perms,temp;
		var mngr = this.getPermManager();
		if (mngr instanceof Components.interfaces.nsIPermissionManager) {
			perms = mngr.enumerator;
			while (('hasMoreElements' in perms && perms.hasMoreElements()) ||
				 ('hasMore' in perms && perms.hasMore())) {
				exc = perms.getNext();
				exc.QueryInterface(Components.interfaces.nsIPermission);
				if (exc.type=='cookie') {
					mngr.remove(exc.host,'cookie');
				}
			}
		} else {
			perms = mngr.getAllPermissions().split(' ');
			for (var i=0; i<perms.length; ++i) {
				temp = perms[i].split('|');
				mngr.remove(temp[0],'cookie');
			}
		}
	}
};

var csHttpObserver = {

	QueryInterface : function(aIID) {
		if (aIID.equals(Components.interfaces.nsISupports) ||
		    aIID.equals(Components.interfaces.nsIObserver))
			return this;
		throw Components.results.NS_NOINTERFACE;
	},

	getObserver: function() {
		return Components.classes["@mozilla.org/observer-service;1"].
		getService(Components.interfaces.nsIObserverService);
	},

	getAppInfo: function() {
		return Components.classes['@mozilla.org/xre/app-info;1'].
		createInstance(Components.interfaces.nsIXULAppInfo);
	},

	getCS: function() {
		return Components.classes['@mozilla.org/CookieSafe;1'].
		createInstance(Components.interfaces.nsICookieSafe);
	},

	getCSHiddenMenuItems: function() {
		return Components.classes['@mozilla.org/CSHiddenMenuItems;1'].
		createInstance(Components.interfaces.nsICSHiddenMenuItems);
	},

	getCSLast10Hosts: function() {
		return Components.classes['@mozilla.org/CSLast10Hosts;1'].
		getService(Components.interfaces.nsICSLast10Hosts);
	},

	getCSTempExceptions: function() {
		return Components.classes['@mozilla.org/CSTempExceptions;1'].
		getService(Components.interfaces.nsICSTempExceptions);
	},

	getPrefs: function() {
		return Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefService).
		getBranch("cookiesafe.");
	},

	getGlobalPrefs: function() {
		return Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefService).
		getBranch("network.cookie.");
	},

	getCookieManager: function() {
		return Components.classes["@mozilla.org/cookiemanager;1"].
		getService(Components.interfaces.nsICookieManager);
	},

	getCookieManager2: function() {
		return Components.classes["@mozilla.org/cookiemanager;1"].
		getService(Components.interfaces.nsICookieManager2);
	},

	getCookieService: function() {
		return Components.classes["@mozilla.org/cookieService;1"].
		getService(Components.interfaces.nsICookieService);
	},

	testPermission: function(host) {
		var url = (host=='scheme:file') ? 'file:///cookiesafe' : 'http://'+host;
		var uri = this.getURI(url);
		var mngr = this.getPermManager();
		var action = mngr.testPermission(uri,'cookie');
		return action;
	},

	getURI: function(url) {
		return Components.classes["@mozilla.org/network/io-service;1"].
		getService(Components.interfaces.nsIIOService).
		newURI(url,null,null);
	},

	getPermManager: function() {
		//check if browser is TB2
		var brows = this.getAppInfo();
		var num = parseInt(brows.version);
		if (brows.name=='Thunderbird' && num==2) {
			return Components.classes["@mozilla.org/CSPermManager;1"].
			getService(Components.interfaces.nsICSPermManager);
		} else {
			return Components.classes["@mozilla.org/permissionmanager;1"].
			getService(Components.interfaces.nsIPermissionManager);
		}
	},

	init: function() {
		var os = this.getObserver();
		os.addObserver(this, 'http-on-modify-request', false);
		os.addObserver(this, 'http-on-examine-response', false);
		os.addObserver(this, 'http-on-examine-merged-response', false);
	},

	uninit: function() {
		var os = this.getObserver();
		os.removeObserver(this, 'http-on-modify-request');
		os.removeObserver(this, 'http-on-examine-response');
		os.removeObserver(this, 'http-on-examine-merged-response');
	},

	observe: function(aSubject, aTopic, aData) {
		if (aTopic == "app-startup") {
			//register observer for quit-application notifications
			var os = this.getObserver();
			os.addObserver(this, 'quit-application', false);

			//only init the http observer for Thunderbird
			var brows = this.getAppInfo();
			if (brows.name=='Thunderbird') this.init();
			return false;
		}

		if (aTopic == "quit-application") {
			//unregister observer for quit-application notifications
			var os = this.getObserver();
			os.removeObserver(this, 'quit-application');

			//perform cleanup for CS Lite shutdown
			cookiesafeShutdown.exit();

			//only uninit the http observer for Thunderbird
			var brows = this.getAppInfo();
			if (brows.name=='Thunderbird') this.uninit();
			return false;
		}

		try {
			var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
			var channelInternal = aSubject.QueryInterface(Components.interfaces.nsIHttpChannelInternal);
			var channel = aSubject.QueryInterface(Components.interfaces.nsIChannel);
		} catch(e) {
			return false;
		}

		/*Thunderbird will automatically strip cookie headers from channels using the https
		protocol.  There is presently NO solution for https uris so we can just return
		instead of trying to process the https cookie headers which will stripped anyway.*/

		if (channel.URI.scheme.substr(0,4) != 'http') return false;

		//make sure user wants CS to process cookies in TB, if more than one http
		//observer is active at a time there could be conflicts with other extensions
		var prefs = this.getPrefs();
		if (!prefs.getBoolPref('processTBCookies')) return false;

		//test whether uri host has permission to set or receive cookies
		var action = this.testPermission(channel.URI.host);

		var gPrefs = this.getGlobalPrefs();
		var behavior = gPrefs.getIntPref('cookieBehavior');

		if (aTopic=='http-on-modify-request') {
			try {
				var reqHead = httpChannel.getRequestHeader("Cookie");
			} catch(e) {
				return false;
			}

			if (!reqHead) {
				if (action==1 || action==8 || (behavior==0 && !action)) {
					var cksrv = this.getCookieService();
					var ckstr = cksrv.getCookieString(channel.URI,null);
					httpChannel.setRequestHeader("Cookie",ckstr,false);
				}
			}
		}

		if (aTopic=='http-on-examine-response' || aTopic=='http-on-examine-merged-response') {
			try {
				var resHead = httpChannel.getResponseHeader("Set-Cookie");
			} catch(e) {
				return false;
			}

			if (resHead) {
				if (action==1 || action==8 || (behavior==0 && !action)) {
					var cs = this.getCS();
					var mngr = this.getCookieManager2();
					var dt = new Date();
					var time = dt.getTime();
					var cookies = resHead.split('\n');
					for (var i=0; i<cookies.length; ++i) {
						var ck = cs.formatCookieString(cookies[i],channel.URI);
						if (action==8) ck.expires = 0;
						if ('cookieExists' in mngr) {
							mngr.add(ck.host,ck.path,ck.name,ck.value,ck.isSecure,true,
								(!ck.expires) ? true : false,
								(!ck.expires) ? parseInt(time / 1000) + 86400 : ck.expires);
						} else {
							mngr.add(ck.host,ck.path,ck.name,ck.value,ck.isSecure,
								(!ck.expires) ? true : false,
								(!ck.expires) ? parseInt(time / 1000) + 86400 : ck.expires);
						}
					}
					httpChannel.setResponseHeader("Set-Cookie","",false);
				}
			}
		}
		return false;
	}
};

var csHttpModule = {

	registerSelf: function (compMgr, fileSpec, location, type) {
		var compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(this.myCID,
		this.myName,
		this.myProgID,
		fileSpec,
		location,
		type);

		var catMgr = Components.classes["@mozilla.org/categorymanager;1"].
		getService(Components.interfaces.nsICategoryManager);
		catMgr.addCategoryEntry("app-startup", this.myName, this.myProgID, true, true);
	},

	getClassObject: function (compMgr, cid, iid) {
		return this.csHttpFactory;
	},

	myCID: Components.ID("{559f36d9-ef06-42ae-8378-846d452cd244}"),

	myProgID: "@mozilla.org/csHttpObserver;1",

	myName: "CookieSafe Http Observer",

	csHttpFactory: {
		QueryInterface: function (aIID) {
			if (!aIID.equals(Components.interfaces.nsISupports) &&
			    !aIID.equals(Components.interfaces.nsIFactory))
				throw Components.results.NS_ERROR_NO_INTERFACE;
			return this;
		},

		createInstance: function (outer, iid) {
			return csHttpObserver;
		}
	},

	canUnload: function(compMgr) {
		return true;
	}
};

function NSGetModule(compMgr, fileSpec) {
	return csHttpModule;
}