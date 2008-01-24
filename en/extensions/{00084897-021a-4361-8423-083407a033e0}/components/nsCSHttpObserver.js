/***************************************************************************
Name: CS Lite
Description: Control cookie permissions.
Author: Ron Beckman
Homepage: http://forum.softwareblaze.com
Email: support@softwareblaze.com

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

	getNameOfBrowser: function() {
		return Components.classes['@mozilla.org/xre/app-info;1'].
		createInstance(Components.interfaces.nsIXULAppInfo).
		name;
	},

	getCS: function() {
		return Components.classes["@mozilla.org/CookieSafe;1"].
		getService(Components.interfaces.nsICookieSafe);
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
		return Components.classes["@mozilla.org/permissionmanager;1"].
		getService(Components.interfaces.nsIPermissionManager);
	},

	init: function() {
		var os = this.getObserver();
		os.addObserver(this, 'quit-application', false);
		os.addObserver(this, 'http-on-modify-request', false);
		os.addObserver(this, 'http-on-examine-response', false);
		os.addObserver(this, 'http-on-examine-merged-response', false);
	},

	uninit: function() {
		var os = this.getObserver();
		os.removeObserver(this, 'quit-application');
		os.removeObserver(this, 'http-on-modify-request');
		os.removeObserver(this, 'http-on-examine-response');
		os.removeObserver(this, 'http-on-examine-merged-response');
	},

	observe: function(aSubject, aTopic, aData) {
		if (aTopic == "app-startup") {
			var brows = this.getNameOfBrowser();
			if (brows=='Thunderbird') this.init();
			return false;
		}

		if (aTopic == "quit-application") {
			this.uninit();
			return false;
		}

		try {
			var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
			var channelInternal = aSubject.QueryInterface(Components.interfaces.nsIHttpChannelInternal);
			var channel = aSubject.QueryInterface(Components.interfaces.nsIChannel);
		} catch(e) {
			return false;
		}

		var gPrefs = this.getGlobalPrefs();
		var behavior = gPrefs.getIntPref('cookieBehavior');

		/*Thunderbird will automatically strip cookie headers from channels using the https
		protocol.  There is presently NO solution for https uris so we can just return
		instead of trying to process the https cookie headers which will stripped anyway.*/

		if (channel.URI.scheme!='http') return false;

		//test whether uri host has permission to set or receive cookies
		var action = this.testPermission(channel.URI.host);

		if (aTopic=='http-on-modify-request') {
			try {
				var reqHead = httpChannel.getRequestHeader("Cookie");
			} catch(e) {
				return false;
			}

			if (!reqHead) {
				if (action==1 || action==8 || (behavior==0 && !action)) {
					var ckstr = this.createCookieString(channel.URI);
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
	},

	createCookieString: function(uri) {
		var ck,ck2;
		var ckstr = [];
		var mngr = this.getCookieManager();
		var cookies = mngr.enumerator;
		while (cookies.hasMoreElements()) {
			ck = cookies.getNext();
			ck.QueryInterface(Components.interfaces.nsICookie);
			ck2 = ck.QueryInterface(Components.interfaces.nsICookie2);
			if ((ck.isDomain && uri.host.indexOf(ck.host)==uri.host.length-ck.host.length) ||
			    uri.host==ck2.rawHost) {
				if (uri.path.indexOf(ck.path)==0) {
					if ((ck.isSecure && uri.scheme=='https' && uri.port==443) ||
					    !ck.isSecure) {
						ckstr.push(ck.name+'='+ck.value);
					}
				}
			}
		}

		//check for duplicate entries and remove them
		ckstr.sort();
		for (var i=0; i<ckstr.length-1; ++i) {
			while (ckstr[i]==ckstr[i+1]) {
				ckstr.splice(i,1);
			}
		}
		return ckstr.join('\; ');
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