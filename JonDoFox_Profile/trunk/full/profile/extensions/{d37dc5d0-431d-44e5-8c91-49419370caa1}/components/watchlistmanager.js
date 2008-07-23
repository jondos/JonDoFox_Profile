// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;

// ====================================================================================
function FoxClocks_WatchlistItem(location)
{ 
	this.location = location;

 	var prefManager = CC["@stemhaus.com/firefox/foxclocks/prefmanager;1"].getService(CI.nsISupports).wrappedJSObject;	
	this.showClock_statusbar = prefManager.getPref("foxclocks.clock.bar.clock.new.visible");
	this.showClock_statusbarFlag = prefManager.getPref("foxclocks.clock.bar.clock.new.showflag");
	this.showClock_statusbarTooltip = prefManager.getPref("foxclocks.clock.tooltip.clock.new.visible");
	this.showClock_statusbarTooltipFlag = prefManager.getPref("foxclocks.clock.tooltip.clock.new.showflag");
	
	this.bold = false;
	this.italic = false;
	this.underline = false;
	this.colour = "";
	this.altColour_enabled = false;
	this.altColour = "";
	this.altColour_startTime = 540; // 9am
	this.altColour_endTime = 1020; // 5pm
	
	this.customFlagUrl = "";
	this.useCustomFlag = false;
		
	// AFM - we shouldn't know anything about formatters here, but it's very handy. So hackety hack
	// Currently not supporting per-clock formats in Watchlist
	//
	this._statusbarTimeFormat = ""; // empty -> use global format
	this._tooltipTimeFormat = ""; // empty -> use global format
	this._statusbarTimeFormatter = null;
	this._tooltipTimeFormatter = null;
}

// ====================================================================================
FoxClocks_WatchlistItem.prototype =
{
	// ====================================================================================
	toXml : function(parentNode)
	{
		// AFM - in order to create elements
		//		
		var doc = parentNode.ownerDocument;
		
		var watchlistItemNode = doc.createElement("WatchlistItem");
		parentNode.appendChild(watchlistItemNode);
			    		
		var locationNode = doc.createElement("Location");
		watchlistItemNode.appendChild(locationNode);
		
		var zoneNode = doc.createElement("Zone");
		locationNode.appendChild(zoneNode);
		zoneNode.setAttribute("id", this.location.zone.id);
	
		// AFM - <Name/> will not exist if we're using the default name
		// If a user switches locales when using default names, their locations will be renamed nicely
		// More significantly, because of this the default foxclocks.watchlist param
		// doesn't need to be localised
		//
		if (this.location.name != this.location.zone.defaultLocation.name)
		{	
			var nameNode = doc.createElement("Name");
			locationNode.appendChild(nameNode);
			nameNode.appendChild(doc.createTextNode(this.location.name));
		}
		
		// AFM - <Coordinates/> will not exist unless we have lat/long
		//
		if (this.location.getLatitude() != null && this.location.getLongitude != null)
		{
			var coordsNode = doc.createElement("Coordinates");
			locationNode.appendChild(coordsNode);
			coordsNode.setAttribute("latitude", this.location.getLatitude());	
			coordsNode.setAttribute("longitude", this.location.getLongitude());
		}
		
		var styleNode = doc.createElement("Style");
		watchlistItemNode.appendChild(styleNode);
		
		var statusbarNode = doc.createElement("Statusbar");
		styleNode.appendChild(statusbarNode);
		
		statusbarNode.setAttribute("visible", this.showClock_statusbar);
		statusbarNode.setAttribute("showflag", this.showClock_statusbarFlag);
	
		if (this._statusbarTimeFormat != "")
			statusbarNode.setAttribute("timeformat", this._statusbarTimeFormat);
				
		var usualStateNode = doc.createElement("UsualState");
		statusbarNode.appendChild(usualStateNode);
		
		usualStateNode.setAttribute("colour", this.colour);
		usualStateNode.setAttribute("bold", this.bold);
		usualStateNode.setAttribute("italic", this.italic);
		usualStateNode.setAttribute("underline", this.underline);

		var alternateStateNode = doc.createElement("AlternateState");
		statusbarNode.appendChild(alternateStateNode);
		
		alternateStateNode.setAttribute("enabled", this.altColour_enabled);
		alternateStateNode.setAttribute("colour", this.altColour);
		alternateStateNode.setAttribute("starttime", this.altColour_startTime);
		alternateStateNode.setAttribute("endtime", this.altColour_endTime);
		
		var statusbarTooltipNode = doc.createElement("StatusbarTooltip");
		styleNode.appendChild(statusbarTooltipNode);
						
		statusbarTooltipNode.setAttribute("visible", this.showClock_statusbarTooltip);
		statusbarTooltipNode.setAttribute("showflag", this.showClock_statusbarTooltipFlag);
		
		if (this._tooltipTimeFormat != "")
			statusbarTooltipNode.setAttribute("timeformat", this._tooltipTimeFormat);
			
		if (this.customFlagUrl != "")
		{
			var flagNode = doc.createElement("Flag");
			watchlistItemNode.appendChild(flagNode);
			
			flagNode.setAttribute("type", "custom");
			flagNode.setAttribute("url", this.customFlagUrl);
			flagNode.setAttribute("in_use", this.useCustomFlag);
		}
	},

	// ====================================================================================
	fromXml : function(itemNode)
	{
		// AFM - itemNode should be a WatchlistItem
		//
		var logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"]
				.getService(CI.nsISupports).wrappedJSObject;
		var utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].
				getService(CI.nsISupports).wrappedJSObject;	
		var zoneManager = CC["@stemhaus.com/firefox/foxclocks/zonemanager;1"]
				.getService(CI.nsISupports).wrappedJSObject;
				
		var locationNode = utils.getFirstEltByTagAsNode(itemNode, "Location");
		var zoneNode = utils.getFirstEltByTagAsNode(locationNode, "Zone");
		var zoneId = zoneNode.getAttribute("id");
					
		var zone = zoneManager.getZones()[zoneId];
		if (zone == null)
		{
			logger.log("FoxClocks_WatchlistItem::fromXml(): could not find zone with id <" +
				zoneId + ">", logger.ERROR);
			return false;
		}
	
		var locationNameNode = utils.getFirstEltByTagAsNode(locationNode, "Name");
		var locationName = locationNameNode != null ?
						locationNameNode.firstChild.nodeValue : zone.defaultLocation.name;
								
		var latitude = null;
		var longitude = null;
			
		var coordsNode = utils.getFirstEltByTagAsNode(locationNode, "Coordinates");
		if (coordsNode != null)
		{
			// AFM - if <Coordinates/> exist, we expect both lat/long attributes
			//
			latitude = coordsNode.getAttribute("latitude");
			longitude = coordsNode.getAttribute("longitude");
		}
							
		this.location = zoneManager.createLocation(zone, locationName, latitude, longitude);

		var styleNode = utils.getFirstEltByTagAsNode(itemNode, "Style");
		var statusbarNode = utils.getFirstEltByTagAsNode(styleNode, "Statusbar");
		
		var visibleSbarAtt = statusbarNode.getAttribute("visible");
		if (visibleSbarAtt != null) this.showClock_statusbar = visibleSbarAtt == "true";
		var showFlagAtt = statusbarNode.getAttribute("showflag");
		if (showFlagAtt != null) this.showClock_statusbarFlag = showFlagAtt == "true";
		
		this.setStatusbarTimeFormat(statusbarNode.getAttribute("timeformat"));			
		
		var usualStateNode = utils.getFirstEltByTagAsNode(statusbarNode, "UsualState");
		var usualColourAtt = usualStateNode.getAttribute("colour");
		if (usualColourAtt != null) this.colour = usualColourAtt;

		var usualBoldAtt = usualStateNode.getAttribute("bold");
		if (usualBoldAtt != null) this.bold = usualBoldAtt == "true";
		
		var usualItalicAtt = usualStateNode.getAttribute("italic");
		if (usualItalicAtt != null) this.italic = usualItalicAtt == "true";
		
		var usualUnderlineAtt = usualStateNode.getAttribute("underline");
		if (usualUnderlineAtt != null) this.underline = usualUnderlineAtt == "true";		
					
		// AFM - we expect this node to exist right now, but just in case...
		//
		var altStateNode = utils.getFirstEltByTagAsNode(statusbarNode, "AlternateState");
		if (altStateNode != null)
		{
			var altEnabledAtt = altStateNode.getAttribute("enabled");
			if (altEnabledAtt != null) this.altColour_enabled = altEnabledAtt == "true";
	
			var altColourAtt = altStateNode.getAttribute("colour");
			if (altColourAtt != null) this.altColour = altColourAtt;
			
			var altStartTimeAtt = altStateNode.getAttribute("starttime");
			if (altStartTimeAtt != null) this.altColour_startTime = Number(altStartTimeAtt);
			
			var altEndTimeAtt = altStateNode.getAttribute("endtime");
			if (altEndTimeAtt != null) this.altColour_endTime = Number(altEndTimeAtt);
		}
		
		var statusbarTooltipNode = utils.getFirstEltByTagAsNode(styleNode, "StatusbarTooltip");
		
		// AFM - we expect this node to exist, but the default behaviour is harmless
		//
		var visibleSbarTooltipAtt = statusbarTooltipNode.getAttribute("visible");
		this.showClock_statusbarTooltip = (visibleSbarTooltipAtt != null) ? (visibleSbarTooltipAtt == "true") : false;
		
		// AFM - newer node; may not exist
		//
		var showFlagSbarTooltipAtt = statusbarTooltipNode.getAttribute("showflag");
		this.showClock_statusbarTooltipFlag = (showFlagSbarTooltipAtt != null) ? (showFlagSbarTooltipAtt == "true") : false;		
		
		this.setTooltipTimeFormat(statusbarTooltipNode.getAttribute("timeformat"));
		
		var flagNode = utils.getFirstEltByTagAsNode(itemNode, "Flag");
		if (flagNode != null && flagNode.getAttribute("type") == "custom")
		{
			var customFlagUrlAtt = flagNode.getAttribute("url");
			this.customFlagUrl = (customFlagUrlAtt != null) ? customFlagUrlAtt : "";
			
			var useCustomFlagAtt = flagNode.getAttribute("in_use");
			this.useCustomFlag = (useCustomFlagAtt != null) ? (useCustomFlagAtt == "true") : false;
		}
	},

	// ====================================================================================
	getStatusbarTimeFormat : function() { return this._statusbarTimeFormat; },
	getTooltipTimeFormat : function() { return this._tooltipTimeFormat; },
	getStatusbarTimeFormatter : function() { return this._statusbarTimeFormatter; },
	getTooltipTimeFormatter : function() { return this._tooltipTimeFormatter; },	
	
	// ====================================================================================
	setStatusbarTimeFormat : function(formatString)
	{
		if (formatString != null && formatString != "")
		{
			this._statusbarTimeFormat = formatString;
			
			this._statusbarTimeFormatter = CC["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
							.createInstance(CI.nsISupports).wrappedJSObject;
			this._statusbarTimeFormatter.setTimeFormat(this._statusbarTimeFormat);
		}
		else
		{
			this._statusbarTimeFormat = "";
			this._statusbarTimeFormatter = null;
		}
	},
		
	// ====================================================================================
	setTooltipTimeFormat : function(formatString)
	{
		if (formatString != null && formatString != "")
		{
			this._tooltipTimeFormat = formatString;
			
			this._tooltipTimeFormatter = CC["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
							.createInstance(CI.nsISupports).wrappedJSObject;
			this._tooltipTimeFormatter.setTimeFormat(this._tooltipTimeFormat);
		}
		else
		{
			this._tooltipTimeFormat = "";
			this._tooltipTimeFormatter = null;
		}
	},

	// ====================================================================================
	getFlagUrl : function()
	{	
		// AFM - checks for existence of image, unlike zone.getFlagUrl()
		//
		var url = this.useCustomFlag ? this.customFlagUrl : this.location.zone.getFlagUrl();
			
		if (url != "")
		{
			var utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;		
			if (!utils.isUriAvailable(url))
			{
				// AFM - only log warning if its a custom flag
				//
				if (this.useCustomFlag == true)
				{
					var logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
					logger.log("FoxClocks_WatchlistItem::getFlagUrl(): flag at url <" + url + "> does not exist", logger.WARN);
				}
				
				url = "";
			}
		}
		
		return url;
	},
			
	// ====================================================================================
	legacyFromZoneParam : function(zoneParam)
	{
		var logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"]
				.getService(CI.nsISupports).wrappedJSObject;
		var zoneManager = CC["@stemhaus.com/firefox/foxclocks/zonemanager;1"]
				.getService(CI.nsISupports).wrappedJSObject;
								
		var zoneParamArray = zoneParam.split("%");
		if (zoneParamArray == "" || zoneParamArray.length < 4) // magic number - yuk
		{
			logger.log("FoxClocks_WatchlistItem::legacyFromZoneParam(): insufficient data", logger.ERROR);
			return false;
		}
				
		var zoneId = zoneParamArray[0];
		var locationName = zoneParamArray[1];
		var latitude = zoneParamArray[2] != "" ? zoneParamArray[2] : null;
		var longitude = zoneParamArray[3] != "" ? zoneParamArray[3] : null;
							
		var zone = zoneManager.getZones()[zoneId];
		if (zone == null)
		{
			logger.log("FoxClocks_WatchlistItem::legacyFromZoneParam(): could not find zone with id <" +
				zoneId + ">", logger.ERROR);
			return false;
		}
		
		if (locationName == "")
			locationName = zone.defaultLocation.name;

		this.location = zoneManager.createLocation(zone, locationName, latitude, longitude);

		if (zoneParamArray.length > 4) this.showClock_statusbar = zoneParamArray[4] == 1;
		if (zoneParamArray.length > 5) this.showClock_statusbarTooltip = zoneParamArray[5] == 1;
		if (zoneParamArray.length > 6) this.bold = zoneParamArray[6] == 1;
		if (zoneParamArray.length > 7) this.italic = zoneParamArray[7] == 1;
		if (zoneParamArray.length > 8) this.underline = zoneParamArray[8] == 1;
		if (zoneParamArray.length > 9) this.colour = zoneParamArray[9];
		if (zoneParamArray.length > 10) this.altColour_enabled = zoneParamArray[10] == 1;
		if (zoneParamArray.length > 11) this.altColour = zoneParamArray[11];			
		if (zoneParamArray.length > 12) this.altColour_startTime = Number(zoneParamArray[12]);
		if (zoneParamArray.length > 13) this.altColour_endTime = Number(zoneParamArray[13]);
		if (zoneParamArray.length > 14) this.showClock_statusbarFlag = zoneParamArray[14] == 1;
		
		// AFM - not supported by legacy prefs
		//
		this.showClock_statusbarTooltipFlag = false;
		this.setStatusbarTimeFormat(null);
		this.setTooltipTimeFormat(null);
	
		return true;
	}
}

// ====================================================================================
// FoxClocks_WatchlistManager - quick hack - interface needs improvement
// ====================================================================================
FoxClocks_WatchlistManager.classID = Components.ID("7fceef58-e060-11db-be14-24a155d89593");
FoxClocks_WatchlistManager.contractID = "@stemhaus.com/firefox/foxclocks/watchlistmanager;1";
FoxClocks_WatchlistManager.classDescription = "FoxClocks Watchlist Manager";

// ====================================================================================
function FoxClocks_WatchlistManager()
{
	this.componentStarted = false;
	this._watchlist = new Array();
}

// ====================================================================================
FoxClocks_WatchlistManager.prototype =
{
	// ====================================================================================
	startup: function()
	{	
		this.componentStarted = true;
		CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService)
			.notifyObservers(this, "foxclocks", "component:startup");
	},
	
	// ====================================================================================
	shutdown: function()
	{
		// AFM - comment out to log xpcom shutdown events
		//
		// if (this._outStream != null)
		//	this._outStream.close();
	},
	
	// ====================================================================================
	getItem: function(i) { return this._watchlist[i]; },
	setItem: function(i, item) { this._watchlist[i] = item; },
	getWatchlist: function() { return this._watchlist; },
	setWatchlist: function(watchlist) { this._watchlist = watchlist; },
	clearWatchlist: function() { this._watchlist = new Array(); },

	// ====================================================================================
	setUpdated: function()
	{
		// AFM - fairly ropey. Call this to say you've done updating the watchlist,
		// so that others can be notified. In fact, only the engine is listening for
		// this event, so it can update the pref and broadcast its own - more widely
		// listened-to - update message
		//
		CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService)
			.notifyObservers(this, "foxclocks", "watchlistmanager:watchlist-changed");
	},
	
	// ====================================================================================
	watchlistToXmlString: function()
	{
		var utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;
		var serializer = CC["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(CI.nsIDOMSerializer);
				
		var watchlistDoc = utils.getDOMImpl().createDocument(utils.FC_URL_FOXCLOCKSHOME +
				"prefs", "Watchlist", null);
				
		var watchlistNode = watchlistDoc.documentElement;
		
		for (var i=0; i < this._watchlist.length; i++)
		{
			var watchlistItem = this._watchlist[i];
			watchlistItem.toXml(watchlistNode);
		}
		
		return serializer.serializeToString(watchlistDoc);
	},
	
	// ====================================================================================
	watchlistFromXmlString: function(xmlString)
	{
		var watchlistDoc = CC["@mozilla.org/xmlextras/domparser;1"].createInstance(CI.nsIDOMParser)
				.parseFromString(xmlString, "text/xml");
		var watchlistNode = watchlistDoc.documentElement;
		
		this._watchlist = new Array();
		for (var i = 0; i < watchlistNode.childNodes.length; i++)
		{
			var watchlistItemNode = watchlistNode.childNodes.item(i);
			watchlistItemNode.QueryInterface(CI.nsIDOMElement);
			
			var watchlistItem = new FoxClocks_WatchlistItem(null);
			if (watchlistItem.fromXml(watchlistItemNode) == false)
				continue;
			
			this._watchlist.push(watchlistItem);
		}	
	},
	
	// ====================================================================================
	onObserve: function(aSubject, aTopic, aData)
	{
	},
	
	// ====================================================================================
	createItem: function(location)
	{
		return new FoxClocks_WatchlistItem(location);
	},
	
	// ====================================================================================
	// AFM - nsISupports
	QueryInterface: function(aIID)
	{
		if( aIID.equals(CI.nsISupports) ||
			aIID.equals(CI.nsIClassInfo) ||
			aIID.equals(CI.nsIObserver))
		{
			return this;
		}
		
		throw CR.NS_ERROR_NO_INTERFACE;
	},
  
	// ====================================================================================
	// AFM -  nsIClassInfo  
	getInterfaces: function(aCount)
	{			
		var ifaces = new Array();
		ifaces.push(CI.nsISupports);
		ifaces.push(CI.nsIClassInfo);
		ifaces.push(CI.nsIObserver);
		aCount.value = ifaces.length;
		return ifaces;
	},
  
	// ====================================================================================
	// AFM - nsIClassInfo  
	getHelperForLanguage: function(aLanguage) { return null; },
	get contractID() { return FoxClocks_WatchlistManager.contractID; },
	get classID() { return FoxClocks_WatchlistManager.classID; },
	get classDescription() { return FoxClocks_WatchlistManager.classDescription; },
	get implementationLanguage() { return CI.nsIProgrammingLanguage.JAVASCRIPT; },
	get flags() { return CI.nsIClassInfo.SINGLETON; },
  
	// ====================================================================================
	// AFM - nsIObserver
	observe: function(aSubject, aTopic, aData)
	{
		switch(aTopic)
		{
			case "xpcom-startup":
				// this is run very early, right after XPCOM is initialized, but before
				// user profile information is applied. Register ourselves as an observer
				// for 'profile-after-change' and 'quit-application'
				//			
				var obsSvc = CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService);
				obsSvc.addObserver(this, "profile-after-change", false);
				obsSvc.addObserver(this, "quit-application", false);
				break;
			
			case "profile-after-change":
				// This happens after profile has been loaded and user preferences have been read.
				// startup code here
				this.startup();
				break;
			
			case "quit-application":
				this.shutdown();
				var obsSvc = CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService);
				obsSvc.removeObserver(this, "profile-after-change");
				obsSvc.removeObserver(this, "quit-application");
				var logService = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
				logService.log("shutdown: " + gCatContractID);
				break;
		
			default:
				this.onObserve(aSubject, aTopic, aData);
		}
	},
	
	// ====================================================================================
	// AFM - http://www.mozilla.org/scriptable/js-components-status.html
	//
	get wrappedJSObject() { return this; }
};

// ====================================================================================
// constructors for objects we want to XPCOMify
//
var gXpComObjects = [FoxClocks_WatchlistManager];
var gCatObserverName = FoxClocks_WatchlistManager.classDescription; // can be anything
var gCatContractID = FoxClocks_WatchlistManager.contractID;

// **********
// AFM - generic registration code below. Useful URL: http://www.mozilla.org/projects/xpcom/book/cxc/html/weblock.html
// **********

// ====================================================================================
function NSGetModule(compMgr, fileSpec)
{
	gModule._catObserverName = gCatObserverName;
	gModule._catContractId = gCatContractID;
	
	for (var i in gXpComObjects)
		gModule._xpComObjects[i] = new FactoryHolder(gXpComObjects[i]);
		
	return gModule;
}

// ====================================================================================
function FactoryHolder(aObj)
{
	this.classID = aObj.classID;
	this.contractID = aObj.contractID;
	this.className  = aObj.classDescription;
	this.factory =
	{
		createInstance: function(aOuter, aIID)
		{
			if (aOuter)
				throw CR.NS_ERROR_NO_AGGREGATION;
				
			return (new this.constructor).QueryInterface(aIID);
		}
	};
	
	this.factory.constructor = aObj;
}

// ====================================================================================
var gModule =
{
	_xpComObjects: {},
	_catObserverName: null,
	_catContractId: null,
	
	// ====================================================================================
	registerSelf: function(aComponentManager, aFileSpec, aLocation, aType)
	{
		aComponentManager.QueryInterface(CI.nsIComponentRegistrar);
		for (var key in this._xpComObjects)
		{
			var obj = this._xpComObjects[key];
			aComponentManager.registerFactoryLocation(obj.classID, obj.className,
			obj.contractID, aFileSpec, aLocation, aType);
		}
		
		var catman = CC["@mozilla.org/categorymanager;1"].getService(CI.nsICategoryManager);
		catman.addCategoryEntry("xpcom-startup", this._catObserverName, this._catContractId, true, true);
		catman.addCategoryEntry("xpcom-shutdown", this._catObserverName, this._catContractId, true, true);
	},

	// ====================================================================================
	unregisterSelf: function(aCompMgr, aFileSpec, aLocation)
	{
		var catman = CC["@mozilla.org/categorymanager;1"].getService(CI.nsICategoryManager);
		catman.deleteCategoryEntry("xpcom-startup", this._catObserverName, true);
		catman.deleteCategoryEntry("xpcom-shutdown", this._catObserverName, true);
		
		aComponentManager.QueryInterface(CI.nsIComponentRegistrar);
		for (var key in this._xpComObjects)
		{
			var obj = this._xpComObjects[key];
			aComponentManager.unregisterFactoryLocation(obj.classID, aFileSpec);
		}
	},

	// ====================================================================================
	getClassObject: function(aComponentManager, aCID, aIID)
	{
		if (!aIID.equals(CI.nsIFactory))
			throw CR.NS_ERROR_NOT_IMPLEMENTED;
		
		for (var key in this._xpComObjects)
		{
			if (aCID.equals(this._xpComObjects[key].classID))
				return this._xpComObjects[key].factory;
		}
	
		throw CR.NS_ERROR_NO_INTERFACE;
	},

	// ====================================================================================
	canUnload: function(aComponentManager) { return true; }
};