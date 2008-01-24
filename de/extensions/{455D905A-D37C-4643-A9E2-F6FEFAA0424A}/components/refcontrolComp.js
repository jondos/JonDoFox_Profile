
function myDump(aMessage) {
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage("RefControl: " + aMessage);
}

var myObserver = {
	
	bEnabled: true,
	aRefActions: {},
	
	is3rdPartyRequest: function(oChannel)
	{
		return	(oChannel.referrer != null) && 
				(oChannel.URI.host != oChannel.referrer.host);
	},
	
	performVariableInterpolation: function(oChannel, sRef)
	{
		var vars = { '$': '$' };	// $$ is a literal $
		var arr = 
		[ 
			{ name: 'URL', uri: oChannel.URI }, 
			{ name: 'REF', uri: oChannel.referrer }
		];
		for (var i in arr)
		{
			var o = arr[i];
			if (o.uri)
			{
				vars[o.name]				= o.uri.spec;
				vars[o.name + "_PREPATH"]	= o.uri.prePath;
				vars[o.name + "_SCHEME"]	= o.uri.scheme;
				vars[o.name + "_USERPASS"]	= o.uri.userPass;
				vars[o.name + "_USERNAME"]	= o.uri.username;
				vars[o.name + "_PASSWORD"]	= o.uri.password;
				vars[o.name + "_HOSTPORT"]	= o.uri.hostPort;
				vars[o.name + "_HOST"]		= o.uri.host;
				vars[o.name + "_PORT"]		= 
					o.uri.port != -1 ? 
					o.uri.port : 
					o.uri.schemeIs('http') ? 80 : 
					o.uri.schemeIs('https') ? 443 : 
					o.uri.port;
				vars[o.name + "_PATH"]		= o.uri.path;
			}
		}

		return sRef.replace(
						/\$\{(\$|[a-zA-Z0-9_]*)\}|\$(\$|[a-zA-Z0-9_]*)/g, 
						function (str, match1, match2)
						{
							var var_name = match1 ? match1 : match2;
							return vars[var_name] ? vars[var_name] : "";
						}
					);
	},

	adjustRef: function(oChannel, sSite)
	{
		try {
			var sRef;
			var refAction = this.aRefActions[sSite];
			if (refAction == undefined)
				return false;

			if (refAction.if3rdParty && !this.is3rdPartyRequest(oChannel))
				return false;
				
			if (refAction.str.charAt(0) == '@')
			{
				// special actions
				switch (refAction.str)
				{
					case '@NORMAL':		// act as if we weren't here
						return true;
					case '@FORGE':		// use target's prepath
//						sRef = oChannel.URI.prepath;
						sRef = oChannel.URI.scheme + "://" + oChannel.URI.hostPort + "/";
						break;
					default:
						myDump("adjustRef: unknown RefAction: " + refAction.str);
						return false;
				}
			}
			else
				sRef = this.performVariableInterpolation(oChannel, refAction.str);

//myDump("adjustRef: setting Referer for " + oChannel.URI.spec + " to " + sRef);
			oChannel.setRequestHeader("Referer", sRef, false);
			if (oChannel.referrer)
				oChannel.referrer.spec = sRef;

			return true;
		} catch (ex) {
			myDump("adjustRef: " + ex);
		}
		return false;
	},

	onModifyRequest: function(oHttpChannel)
	{
		try {
			if (!this.bEnabled)
				return;
			
			oHttpChannel.QueryInterface(Components.interfaces.nsIChannel);

			// handle wildcarding
			// try matching "www.foo.example.com", "foo.example.com", "example.com", ...
			for (var s = oHttpChannel.URI.host; s != ""; s = s.replace(/^.*?(\.|$)/, ""))
			{
				if (this.adjustRef(oHttpChannel, s))
					return;
			}
			// didn't find any matches, fall back on configured default action
			this.adjustRef(oHttpChannel, '@DEFAULT');
		} catch (ex) {
			myDump("onModifyRequest: " + ex);
		}
	},

	getActionsFromBranch: function(oPrefBranch)
	{
		function myDecodeURI(sEncodedURI)
		{
			if (sEncodedURI.charAt(0) == '@')
				return sEncodedURI;
			try {
				return decodeURI(sEncodedURI);
			} catch (ex) {
				return sEncodedURI;
			}
		}

		var sActions = oPrefBranch.getCharPref('actions');
		
		var aRefActions = {};
		aRefActions['@DEFAULT'] = { str: '@NORMAL', if3rdParty: false };	// in case it is not in the pref
		
		var aActions = sActions.split(' ');
		for (var i in aActions)
		{
			var aKV = aActions[i].match(/(.*?)=(.*)/);
			if (aKV != null)
			{
				var s3rdParty = '@3RDPARTY';
				var res;
				if (aKV[2].substr(0, s3rdParty.length) == s3rdParty)
					res = { str: myDecodeURI(aKV[2].substr(s3rdParty.length + 1)), if3rdParty: true };
				else
					res = { str: myDecodeURI(aKV[2]), if3rdParty: false };
				aRefActions[aKV[1]] = res;
			}
		}
		
		return aRefActions;
	},

	onChangeEnabled: function(oPrefBranch)
	{
		try {
			this.bEnabled = oPrefBranch.getBoolPref('enabled');
		} catch (ex) {
			myDump("onChangeEnabled: " + ex);
		}
	},
	
	onChangeActions: function(oPrefBranch)
	{
		try {
			this.aRefActions = this.getActionsFromBranch(oPrefBranch);
		} catch (ex) {
			myDump("onChangeActions: " + ex);
		}
	},

	onAppStartup: function()
	{
		try {
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			observerService.addObserver(this, "http-on-modify-request", true);
			
			var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
			this.prefBranch = prefService.getBranch("refcontrol.");
			this.prefBranch.QueryInterface(Components.interfaces.nsIPrefBranchInternal);
			this.prefBranch.addObserver("enabled", this, true);
			this.prefBranch.addObserver("actions", this, true);
		} catch (ex) {
			myDump("onAppStartup: " + ex);
		}
	},

	// Implement nsIObserver
	observe: function(aSubject, aTopic, aData)
	{
//myDump("observe: " + aTopic);
		try {
			switch (aTopic)
			{
				case 'http-on-modify-request':
					aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
					this.onModifyRequest(aSubject);
					break;
				
				case 'nsPref:changed':
					aSubject.QueryInterface(Components.interfaces.nsIPrefBranch);
					switch (aData)
					{
						case 'enabled':
							this.onChangeEnabled(aSubject);
							break;
						case 'actions':
							this.onChangeActions(aSubject);
							break;
						default:
							myDump("observe: unknown pref changing: " + aData);
							break;
					}
					break;
					
				case 'app-startup':
					this.onAppStartup();
					break;
					
				default:
					myDump("observe: unknown topic: " + aTopic);
					break;
			}
		} catch (ex) {
			myDump("observe: " + ex);
		}
	},
	
	// Implement nsISupports
	QueryInterface: function(iid)
	{
		if (!iid.equals(Components.interfaces.nsISupports) &&
			!iid.equals(Components.interfaces.nsIObserver) &&
			!iid.equals(Components.interfaces.nsISupportsWeakReference))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		
		return this;
    }
};

var myModule = {
	myCID:			Components.ID("{07C3DD15-0F44-4723-94DE-720B3B2FF9AF}"),
	myContractID:	"@mozilla.org/refcontrol;1",

	firstTime:		true,

	// Implement nsIModule
	registerSelf: function(compMgr, fileSpec, location, type)
	{
		if (this.firstTime)
		{
			this.firstTime = false;
			throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
		}

		compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(this.myCID, "RefControl Component", this.myContractID,
										fileSpec, location, type);

		var catMan = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
		catMan.addCategoryEntry("app-startup", "RefControl", this.myContractID, true, true);
	},

    unregisterSelf: function(compMgr, fileSpec, location)
    {
		// Remove the auto-startup
		compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(this.myCID, fileSpec);

		var catMan = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
		catMan.deleteCategoryEntry("app-startup", this.myContractID, true);
    },

    getClassObject: function(compMgr, cid, iid)
    {
		if (!cid.equals(this.myCID))
			throw Components.results.NS_ERROR_FACTORY_NOT_REGISTERED;

		if (!iid.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NO_INTERFACE;

		return this.myFactory;
    },

	canUnload: function(compMgr) { return true; },
	// end Implement nsIModule

	myFactory: {
		// Implement nsIFactory
		createInstance: function(outer, iid)
		{
			if (outer != null)
				throw Components.results.NS_ERROR_NO_AGGREGATION;
			
			return myObserver.QueryInterface(iid);
	    }
	}
};

/* module initialisation */
function NSGetModule(comMgr, fileSpec) { return myModule; }

