// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2007 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;

// ====================================================================================
FoxClocks_UpdateManager.classID = Components.ID("93b54d56-d965-44e3-a989-09b1b260cd94");
FoxClocks_UpdateManager.contractID = "@stemhaus.com/firefox/foxclocks/updatemanager;1";
FoxClocks_UpdateManager.classDescription = "FoxClocks Update Manager";

// ====================================================================================
function FoxClocks_UpdateManager()
{
	this.componentStarted = false;
	
	this._httpRequest = null;
	this._logger = null;
   	this._utils = null;		
	this._observerService = null;
	this._timer = null;
	this._isDevel = false;
	this._noServerUpdateURL = null;
	
	this.updateIntervalSecs = null;
	this.nextUpdateDate = null; // null if automatic updates disabled
	this.lastUpdateResult = "NONE"; // "ERROR", "OK_NEW", "OK_NO"
	this.lastUpdateDate = null;
	this.lastUpdateAuto = null;
	
	this.SERVER_RESP_STATUS_OK = 0;
	this.SERVER_RESP_STATUS_BAD_REQ = -1;
	this.SERVER_UPDATE_NO_NEW = 0;
	this.SERVER_UPDATE_NEW = 1;
	
	this.STATE_NOT_INIT = 0;
	this.STATE_OPEN = 1;
	this.STATE_SENT = 2;
	this.STATE_RECEIVING = 3;
	this.STATE_LOADED = 4;
	this._stateString = ["STATE_NOT_INIT", "STATE_OPEN", "STATE_SENT", "STATE_RECEIVING", "STATE_LOADED"];
	
	this._builtin_localDataFile = null;
	this._updated_localDataFile = null;	
	
	this.STATUS_HTTP_OK = 200;
}

// ====================================================================================
FoxClocks_UpdateManager.self = null;

// ====================================================================================
FoxClocks_UpdateManager.prototype =
{
	// ====================================================================================
	startup: function()
	{			
		FoxClocks_UpdateManager.self = this; // stupid
		
		this._httpRequest = CC["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(CI.nsIXMLHttpRequest);
		this._logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
		this._utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;	
		this._observerService = CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService);
		this._timer = CC["@mozilla.org/timer;1"].createInstance(CI.nsITimer);
		
		this._builtin_localDataFile = this._utils.getFoxClocksDir();
		this._builtin_localDataFile.append("data");
		this._builtin_localDataFile.append("zones.xml");

		this._updated_localDataFile = this._utils.getFoxClocksDir();		
		this._updated_localDataFile.append("data");
		this._updated_localDataFile.append("zones_update.xml");	
			
		this.componentStarted = true;
		this._observerService.notifyObservers(this, "foxclocks", "component:startup");
	},
		
	// ====================================================================================
	shutdown: function()
	{
	},

	// ====================================================================================
	onObserve: function(aSubject, aTopic, aData)
	{
	},
	
	// ====================================================================================
	init: function(enabled, intervalSecs, prevUpdateSecs, isDevel, noServerUpdateURL)
	{
		this._logger.log("FoxClocks_UpdateManager::init(): " + enabled + " " + intervalSecs +
			" " + prevUpdateSecs + " " + isDevel + " " + noServerUpdateURL);
				
		this.updateIntervalSecs = intervalSecs;	
		this.lastUpdateDate = new Date(prevUpdateSecs * 1000);
		this._isDevel = isDevel;
		this._noServerUpdateURL = noServerUpdateURL;
		this._setNextUpdateDate(enabled);
				
		// AFM - cancel pending request
		//
		if (enabled == false)
			this._resetConnection();
	},
	
	
	// ====================================================================================
	// AFM - implementing nsITimerCallback
	//
	notify: function(timer) { this.updateNow(true); },
		
	// ====================================================================================
	updateNow: function(isAutoUpdate)
	{
		this.lastUpdateAuto = isAutoUpdate != null && isAutoUpdate == true;
		
		this._logger.log("+FoxClocks_UpdateManager::updateNow(): " + (this.lastUpdateAuto ? "automatic" : "manual"));
		
		try
		{
			var requestURL = this._noServerUpdateURL != null ? this._noServerUpdateURL : this._getRemoteDataURL();
						
			// AFM - in order to get at onreadystatechange etc.
			//
			this._httpRequest.QueryInterface(CI.nsIJSXMLHttpRequest);
			
			this._httpRequest.open('GET', requestURL, true);
			this._httpRequest.onreadystatechange = this._onXMLReadyStateChange; 
         	this._httpRequest.channel.loadFlags |= CI.nsIRequest.LOAD_BYPASS_CACHE; 
         	
			try
			{
				if (this._httpRequest.channel instanceof CI.nsISupportsPriority)
					this._httpRequest.channel.priority = CI.nsISupportsPriority.PRIORITY_LOWEST;
			}
			catch(e) {this._logger.log("FoxClocks_UpdateManager::updateNow(): no priority");}; 
          	
          	// AFM - seems to block if, e.g. file://
          	//
			this._httpRequest.send(null);
			this._logger.log("-FoxClocks_UpdateManager::updateNow(): success");
		}
		catch (ex)
		{
			this._logger.log("-FoxClocks_UpdateManager::updateNow(): failed: " + ex, this._logger.ERROR);
			this._setUpdateComplete("ERROR");
		}
	},
		
	// ====================================================================================
	_resetConnection: function()
	{		
		if (this._httpRequest.readyState == this.STATE_NOT_INIT)
			return;
		
		this._logger.log("+FoxClocks_UpdateManager::_resetConnection(): state <" +
				this._stateString[this._httpRequest.readyState] + ">");
					
		if (this._httpRequest.readyState != this.STATE_LOADED)
		{
			// AFM - abnormal reuse of this._httpRequest
			//
			this._logger.log("FoxClocks_UpdateManager::_resetConnection(): aborting current request with state: " +
				this._stateString[this._httpRequest.readyState], this._logger.WARN);
		}
		
		this._httpRequest.abort();
		
		this._logger.log("-FoxClocks_UpdateManager::_resetConnection(): state <" +
				this._stateString[this._httpRequest.readyState] + ">");
	},
	
	// ====================================================================================
	_onXMLReadyStateChange: function()
	{		
		// AFM - get multiple STATE_RECEIVING
		//
		var self = FoxClocks_UpdateManager.self;
		var state = self._httpRequest.readyState;
		
		if (state != self.STATE_RECEIVING)
		{
			self._logger.log("+FoxClocks_UpdateManager::_onXMLReadyStateChange(): state <" +
				self._stateString[state] + ">");
		}
				
		if (state != self.STATE_LOADED)
			return;

		var updateResult = "ERROR";
		var httpStatus = null;
		
		// AFM - make sure exception is due to accessing _httpRequest.status
		//
		try { httpStatus = self._httpRequest.status; }
		catch (ex)
		{
			self._logger.log("FoxClocks_UpdateManager::_onXMLReadyStateChange(): timeout", self._logger.WARN);
		}
		
		if (httpStatus != null)
		{
			// AFM - the response can be null when we abort a live request - state transitions from STATE_OPEN,
			// to LOADED, to NOT_INIT
			//
			var doc = self._httpRequest.responseXML;
			
			// AFM - we get a 0 status for file:// requests, at least. In a feeble attempt to stop
			// this biting us, we only accept 0 status when we're using the user-supplied
			// no-server update URL. This will break if the _normal_ update URL is returned from file://
			//
			if (doc != null && (httpStatus == self.STATUS_HTTP_OK || (self._noServerUpdateURL != null && httpStatus == 0)))
			{
				updateResult = self._processXMLResponse(self._httpRequest.responseXML);
			}
			else
			{
				// AFM - statusText not necessarily available, even though status exists
				//
				var httpStatusText = "[status text unavailable]";
				try { httpStatusText = self._httpRequest.statusText; }
				catch (ex)
				{
					self._logger.log("FoxClocks_UpdateManager::_onXMLReadyStateChange(): status text unavailable");
				}
				
				self._logger.log("FoxClocks_UpdateManager::_onXMLReadyStateChange(): http status " +
					httpStatus + " (" +
					httpStatusText + "), doc is null: " + (doc == null), self._logger.WARN);	
			}
		}
		
		self._setUpdateComplete(updateResult);
		
		self._logger.log("-FoxClocks_UpdateManager::_onXMLReadyStateChange()");
	},
	
	// ====================================================================================
	_setUpdateComplete: function(updateResult)
	{
		this._logger.log("FoxClocks_UpdateManager::_setUpdateComplete(): result: " + updateResult);
			
		// AFM - do not reset the connection here. Connection is already 'done' even if it's LOADED
		// (usually request complete) or OPEN (when file not found in send(), eg). The connection
		// will be reset next time an update is started. Resetting here triggers stuff we don't want
		// triggered
		//
		// AFM - update. No, reset it but disable the callback
		//
		
		this._httpRequest.onreadystatechange = null; 
		this._resetConnection();
		this._httpRequest.onreadystatechange = this._onXMLReadyStateChange; 

		this.lastUpdateResult = updateResult;
		this.lastUpdateDate = new Date();
		this._setNextUpdateDate();
		
		this._observerService.notifyObservers(this, "foxclocks", "updatemanager:update-complete");
	},
	
	// ====================================================================================
	_setNextUpdateDate: function(enabled)
	{
		// AFM - depends on this.lastUpdateDate and this.updateIntervalSecs
		//
	
		// AFM - use current enabled status
		//
		if (enabled == null)
			enabled = (this.nextUpdateDate != null);
						
		if (enabled == false)
		{
			this.nextUpdateDate = null;
			this._timer.cancel();
			this._logger.log("FoxClocks_UpdateManager::_setNextUpdateDate(): auto-update disabled");
			return;
		}
			
		var utcAsMillis = new Date().getTime();
			
		var nextUpdateAsMillis = this.lastUpdateDate.getTime() + this.updateIntervalSecs * 1000;
		var millisToNextUpdate = Math.max(nextUpdateAsMillis - utcAsMillis, 0);

		var nextUpdateTimeMillis = millisToNextUpdate + utcAsMillis;
		this.nextUpdateDate = new Date(nextUpdateTimeMillis);
		
		this._logger.log("FoxClocks_UpdateManager::_setNextUpdateDate(): auto-update enabled: next update: " +
				this.nextUpdateDate.toLocaleString());
						
		this._timer.initWithCallback(this, millisToNextUpdate, CI.nsITimer.TYPE_ONE_SHOT);
	},
	
	// ====================================================================================
	_processXMLResponse: function(doc)
	{
		// AFM - returns true only on new data
		//
		var zoneManager = CC["@stemhaus.com/firefox/foxclocks/zonemanager;1"].
			getService(CI.nsISupports).wrappedJSObject;

		var retVal = "ERROR";
		var updateStatus = this.SERVER_UPDATE_NO_NEW;
		
		try
		{
			var root = doc.documentElement;
			
			// AFM - this can happen when a connection times out after a partial response
			//
			if (root.nodeName == "parsererror")
			{
				this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): parsererror: " +
						root.firstChild.nodeValue, this._logger.ERROR);
				return retVal;
			}
			
			if (this._noServerUpdateURL == null)
			{
				// AFM - a response from the server, rather than raw data
				//
				var respStatusNode = this._utils.getFirstEltByTagAsNode(root, "response-status");
		
				if (respStatusNode.getAttribute("code") != this.SERVER_RESP_STATUS_OK)
				{
					// AFM - should propagate this to user
					//
					var statusMsg = respStatusNode.getAttribute("msg");
	
					this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): response from server indicates error: " +
						statusMsg, this._logger.ERROR);
						
					return retVal;
				}
			
				var bodyNode = this._utils.getFirstEltByTagAsNode(root, "body");
				var updateStatusNode = this._utils.getFirstEltByTagAsNode(bodyNode, "update-status");
				updateStatus = updateStatusNode.getAttribute("code");
			}
			else
			{
				var sourceNode = this._utils.getFirstEltByTagAsNode(root, "Source");
				var remoteVersion = this._utils.getFirstEltByTagAsNode(sourceNode, "Version").firstChild.nodeValue;
				var remoteDate = this._utils.getFirstEltByTagAsNode(sourceNode, "Date").firstChild.nodeValue;
				
				var currVersion = zoneManager.dataSource.version;
				var currDate = zoneManager.dataSource.date;
		
				this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): from _noServerUpdateURL: remote version <" +
						remoteVersion + ">, remote date <" + remoteDate + ">, current version <" +
						currVersion + ">, current date <" + currDate + ">");
						
				if (remoteVersion > currVersion && remoteDate >= currDate)
					updateStatus = this.SERVER_UPDATE_NEW;
			}
			
			if (updateStatus == this.SERVER_UPDATE_NEW)
			{						
				this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): updating...");
		
				// AFM - dump zonesNode to string
				//
				const CHARSET = "UTF-8";			
				var serializer = CC["@mozilla.org/xmlextras/xmlserializer;1"].getService(CI.nsIDOMSerializer);
				
				var zonesNode = this._utils.getFirstEltByTagAsNode(doc, "zones");
				
				if (zonesNode == null)
					this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): zonesNode is null");
				var xmlString = this._utils.FC_XML_DEC + serializer.serializeToString(zonesNode, CHARSET);
    				                   				
				// AFM - write, create, truncate
				//
				var outStream = CC["@mozilla.org/network/file-output-stream;1"]
					.createInstance(CI.nsIFileOutputStream);
				outStream.init(this._updated_localDataFile, 0x02 | 0x08 | 0x20, 0664, 0);
						
				// AFM - do things in an i18n-safe way
				//		
				var outConvStream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
				                   .createInstance(Components.interfaces.nsIConverterOutputStream);
				
				outConvStream.init(outStream, CHARSET, 0, 0x0000);
				outConvStream.writeString(xmlString);
				outConvStream.close();
				
				this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): success - new data");
				retVal = "OK_NEW";
			}
			else
			{
				this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): success - local data is current");
				retVal = "OK_NO";
			}
		}
		catch (ex)
		{
			this._logger.log("FoxClocks_UpdateManager::_processXMLResponse(): error processing zone data: " + ex, this._logger.ERROR);
			retVal = "ERROR";
		}
		
		return retVal;
	},
	
	// ====================================================================================
	getLocalDataURL: function()
	{
		var protocolHandler = CC["@mozilla.org/network/protocol;1?name=file"].getService(CI.nsIFileProtocolHandler);
		
		var localDataFile = this._updated_localDataFile.exists() ? this._updated_localDataFile : this._builtin_localDataFile;
		return protocolHandler.getURLSpecFromFile(localDataFile);
	},
	
	// ====================================================================================
	_getRemoteDataURL: function()
	{
		// AFM - dear reader, as you can see, nothing personal is sent in the update check.
		// If you follow the code around, you'll see that a chunk of the server response
		// is written to the file data/zones_update.xml, which is used by the zonemanager to
		// rebuild its hash of time zone data. Your privacy is intact
		//
		var zoneManager = CC["@stemhaus.com/firefox/foxclocks/zonemanager;1"].
			getService(CI.nsISupports).wrappedJSObject;
			
		var remoteDataURL = "http://www.stemhaus.com/firefox/foxclocks/data/"
		remoteDataURL += (this._isDevel ? "zones-devel.cgi?devel=true&" : "zones.cgi?");
		remoteDataURL += "client_id=FoxClocks";
		remoteDataURL += "&client_version=" + this._utils.getFoxClocksVersion();
		remoteDataURL += "&zone_id=*";
		remoteDataURL += "&action=update-check";
		remoteDataURL += "&data_source_id=" + zoneManager.dataSource.id;
		remoteDataURL += "&data_source_version=" + zoneManager.dataSource.version;
		remoteDataURL += "&data_source_date=" + zoneManager.dataSource.date;
		remoteDataURL += "&year=" + new Date().getUTCFullYear();		
							
		remoteDataURL = encodeURI(remoteDataURL);
		
		this._logger.log("FoxClocks_UpdateManager::_getRemoteDataURL(): url <" + remoteDataURL + ">");
		return remoteDataURL;
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
	get contractID() { return FoxClocks_UpdateManager.contractID; },
	get classID() { return FoxClocks_UpdateManager.classID; },
	get classDescription() { return FoxClocks_UpdateManager.classDescription; },
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
var gXpComObjects = [FoxClocks_UpdateManager];
var gCatObserverName = FoxClocks_UpdateManager.classDescription; // can be anything
var gCatContractID = FoxClocks_UpdateManager.contractID;

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