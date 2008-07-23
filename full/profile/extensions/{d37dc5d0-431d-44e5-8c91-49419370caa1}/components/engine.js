// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;

// ====================================================================================
FoxClocks_Engine.classID = Components.ID("88575671-c0d6-4802-8bd5-a12cfd36247a");
FoxClocks_Engine.contractID = "@stemhaus.com/firefox/foxclocks/engine;1";
FoxClocks_Engine.classDescription = "FoxClocks Engine";

// ====================================================================================
// AFM - Event model:
// - only the engine interfaces with preferences; specifically, other components
//   do not receive pref change notifications
// - engine calls methods on the other components directly; it does not broadcast
//   events to other components
// - engine communicates to chrome JS via ("foxclocks") broadcasts only (the only
//   alternative is pref changes, which makes no sense)
// - currently async notifications from other components back to the engine are by
//   by broadcast. Not sure about this one, but certainly other components are not
//   aware of the engine
// - Note that this model is only enforced in components - chrome JS is still strongly
//   coupled to pref change events, and to writing preferences. Todo, one day
// ====================================================================================

// ====================================================================================
function FoxClocks_Engine()
{
	this.componentStarted = false;

	this._logger = null;
	this._prefManager = null;
	this._updateManager = null;
	this._utils = null;
	this._zoneManager = null;
	this._observerService = null;
	
	this._components = [];
}

// ====================================================================================
FoxClocks_Engine.prototype =
{	
	// ====================================================================================
	startup: function()
	{
		this._logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
 		this._prefManager = CC["@stemhaus.com/firefox/foxclocks/prefmanager;1"].getService(CI.nsISupports).wrappedJSObject;
  		this._updateManager = CC["@stemhaus.com/firefox/foxclocks/updatemanager;1"].getService(CI.nsISupports).wrappedJSObject;
   		this._utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;			
  		this._zoneManager = CC["@stemhaus.com/firefox/foxclocks/zonemanager;1"].getService(CI.nsISupports).wrappedJSObject;			
   		this._watchlistManager = CC["@stemhaus.com/firefox/foxclocks/watchlistmanager;1"].getService(CI.nsISupports).wrappedJSObject;			
 
		this._components = [this._logger, this._prefManager, this._updateManager, this._utils,
								this._zoneManager, this._watchlistManager];

		this._observerService = CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService);
		
		this._prefManager.declarePrefAsXml("foxclocks.watchlist");
		
		// AFM - so that the pref manager will set these values if imported from file
		// (we don't need to declare foxclocks.zones.indexes.* as legacy since they
		// were never exported to file. All a bit of a hack really
		//
		this._prefManager.declarePrefAsLegacy("foxclocks.zones");
 		this._prefManager.addPrefObserver("foxclocks.", this);
		this._prefManager.addPrefObserver("extensions." + this._utils.FC_GUID_FOXCLOCKS + ".", this);
		this._observerService.addObserver(this, "foxclocks", false);
		
		this._onComponentStartup();
		
		this.componentStarted = true;
		CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService)
			.notifyObservers(this, "foxclocks", "component:startup");
	},
		
	// ====================================================================================
	shutdown: function()
	{			
		this._prefManager.removePrefObserver("foxclocks.", this);
		this._prefManager.removePrefObserver("extensions." + this._utils.FC_GUID_FOXCLOCKS + ".", this);
		this._observerService.removeObserver(this, "foxclocks");
	},
	
	// ====================================================================================
	onObserve: function(aSubject, aTopic, aData)
	{
		// AFM - rather than observe(), which we leave as boilerplate below
		//
	
		// this._logger.log("FoxClocks_Engine::onObserve(): <" + aTopic + ">, <" +
		// aData + ">", this._logger.INFO);
				
		if (aTopic == "foxclocks")
		{				
			if (aData == "component:startup")
			{
				if (aSubject.wrappedJSObject != this)
					this._onComponentStartup();
			}
			else if (aData == "updatemanager:update-complete")
			{
				this._onDbUpdateComplete();
			}
			else if (aData == "watchlistmanager:watchlist-changed")
			{
				this._onWatchlistUpdated();
			}
			else if (aData == "prefmanager:legacy-prefs-imported")
			{
				this._convertLegacyParams(aSubject.wrappedJSObject.getImportedLegacyPrefs());
			}
		}
		else if (aTopic == "nsPref:changed")
		{
			switch (aData)
			{
				case "foxclocks.logging.tmpfile.enabled": this._enableTmpLog(); break;
				case "foxclocks.logging.level": this._setLogLevel(); break;
				case "foxclocks.data.update.auto.enabled": this._initUpdateManager(); break;
				case "foxclocks.data.update.auto.interval": this._initUpdateManager(); break;
				case "foxclocks.data.update.noserver.updateurl": this._initUpdateManager(); break;
				case "foxclocks.watchlist": this._populateWatchlistFromPrefs(); break;
				
				case "extensions." + this._utils.FC_GUID_FOXCLOCKS + ".devel": this._initUpdateManager(); break;
				case "extensions." + this._utils.FC_GUID_FOXCLOCKS + ".data.update.prevupdate":
						this._initUpdateManager(); break;
						
				case "foxclocks.zonepicker.dataurl":
				{		
					if (this._initZonePicker() == true)
						this._observerService.notifyObservers(null, "foxclocks", "engine:zone-picker-changed");
					break;
				}	
			}
		}
		else if (aTopic == "alertclickcallback")
		{
			if (aData == "engine-internal:foxclocks-zone-data-update-complete:new")
				this._utils.openFoxClocksDbUpdateURL();
		}
	},

	// ====================================================================================
	_onComponentStartup: function()
	{
		// AFM - make sure that all components on which we depend have started up before we do anything
		//
		var startCount = 0;
		
		for (var i=0; i < this._components.length; i++)
		{
			if (this._components[i].componentStarted == true)
				startCount++;
		}
		
		var allStarted = (startCount == this._components.length);
		
		// this._logger.log("FoxClocks_Engine::_onComponentStartup(): " + startCount + "/" +
		//	this._components.length + " components started", this._logger.INFO);
			
		if (allStarted == true)
			this._init();
		
		// this._logger.log("-FoxClocks_Engine::_onComponentStartup()");
	},
	
	// ====================================================================================
	_init: function(noUpdateManager)
	{
		// AFM - the real initialisation, after we're sure all other components are up
		// There's still stuff in foxclocksoverlay.js that isn't window-specific -
		// should be moved here
		//
		this._setLogLevel(); // ASAP
		this._enableTmpLog();	
		
		// AFM - local data url is available before update manager is initialised
		//
		this._zoneManager.initZoneData(this._updateManager.getLocalDataURL());
		this._initZonePicker();
		
		// AFM - need above zone data to convert legacy params and populate watchlist
		//
		this._convertLegacyParams(null);
		this._populateWatchlistFromPrefs();
				
		if (noUpdateManager != true)
			this._initUpdateManager();
		
		this._doDiagnostics();
	},
					
	// ====================================================================================
	_initUpdateManager: function()
	{
		var autoUpenabled = this._prefManager.getPref("foxclocks.data.update.auto.enabled");
		
		// AFM - maximum one update a day
		//
		var prevUpdateSecs = this._prefManager.getPref("extensions." +
					this._utils.FC_GUID_FOXCLOCKS + ".data.update.prevupdate");
					
		var isDevelParam = this._prefManager.getPref("extensions." + this._utils.FC_GUID_FOXCLOCKS + ".devel");
		var isDevel = isDevelParam != null && isDevelParam == true;
			
		var autoUpdateIntervalParam = this._prefManager.getPref("foxclocks.data.update.auto.interval");
		
		// AFM - minimum of 1 day, if we're not in devel mode
		//
		var autoUpdateInterval = isDevel ? autoUpdateIntervalParam : Math.max(autoUpdateIntervalParam, 86400);
		
		var noServerUpdateURL = this._prefManager.getPref("foxclocks.data.update.noserver.updateurl");
		if (noServerUpdateURL == "")
			noServerUpdateURL = null;
			
		this._updateManager.init(autoUpenabled, autoUpdateInterval, prevUpdateSecs, isDevel, noServerUpdateURL);
		
		// AFM - the way the GUI is notified of these changes is poor; if the devel param is modified,
		// eg, the GUI doesn't update (because it's not watching the extensions.{ branch
		//
	},
					
	// ====================================================================================
	_initZonePicker: function()
	{
		const BUILTIN_ZONE_PICKER_DATA_URL = "chrome://foxclocks/locale/zonepicker.xml";
		
		this._logger.log("+FoxClocks_Engine::_initZonePicker()");
						
  		var zonePickerDataUrl = this._prefManager.getPref("foxclocks.zonepicker.dataurl");
		
		if (zonePickerDataUrl == "fc-zonepicker-dataurl-builtin")
			zonePickerDataUrl = BUILTIN_ZONE_PICKER_DATA_URL;
	
		// AFM - failure implies non-builtin URL for non-existent/non-readable file. Probably
		//			
		var ret = this._zoneManager.initZonePicker(zonePickerDataUrl);
		if (ret == false && zonePickerDataUrl != BUILTIN_ZONE_PICKER_DATA_URL)
		{
			this._logger.log("FoxClocks_Engine::_initZonePicker(): failed to load zone picker locale data from "
				+ zonePickerDataUrl  + " - using built-in locale data", this._logger.ERROR);
				
			ret = this._zoneManager.initZonePicker(BUILTIN_ZONE_PICKER_DATA_URL);
		}
		
		if (ret != true)
			this._logger.log("FoxClocks_Engine::_initZonePicker(): failed to load built-in " +
			"zone picker locale data. Giving up", this._logger.ERROR);
			
		this._logger.log("-FoxClocks_Engine::_initZonePicker()");			
		return ret;
	},
	
	// ====================================================================================		
	_onDbUpdateComplete: function()
	{
		// AFM - we set the param on completion of any update attempt
		//
		this._prefManager.removePrefObserver("extensions." + this._utils.FC_GUID_FOXCLOCKS + ".", this);
		this._prefManager.setPref("extensions." + this._utils.FC_GUID_FOXCLOCKS + ".data.update.prevupdate",
				Math.round(this._updateManager.lastUpdateDate.getTime()/1000));
		this._prefManager.addPrefObserver("extensions." + this._utils.FC_GUID_FOXCLOCKS + ".", this);

		if (this._updateManager.lastUpdateResult == "OK_NEW")
		{	
			if (this._prefManager.getPref("foxclocks.data.update.auto.alert.enabled") == true)
				this._doDatabaseUpdateAlert();
			                   
			this._logger.log("FoxClocks_Engine::_onDbUpdateComplete(): reinitialising on new data");
			this._init(true); // do not re-init update manager
		}
			
		this._observerService.notifyObservers(this._updateManager, "foxclocks", "engine:zone-data-update-complete");	
	},
	
	// ====================================================================================
	_onWatchlistUpdated: function()
	{
		this._prefManager.setPref("foxclocks.watchlist", this._watchlistManager.watchlistToXmlString());
		this._observerService.notifyObservers(this._watchlistManager, "foxclocks", "engine:watchlist-changed");	
	},
	
	// ====================================================================================
	_populateWatchlistFromPrefs: function()
	{
		this._logger.log("+FoxClocks_Engine::_populateWatchlistFromPrefs()");
		this._watchlistManager.watchlistFromXmlString(this._prefManager.getPref("foxclocks.watchlist"));
		this._observerService.notifyObservers(this._watchlistManager, "foxclocks", "engine:watchlist-changed");
		this._logger.log("-FoxClocks_Engine::_populateWatchlistFromPrefs()");
	},
	
	// ====================================================================================
	_doDatabaseUpdateAlert: function()
	{
 		var stringBundleService = CC["@mozilla.org/intl/stringbundle;1"].getService(CI.nsIStringBundleService);
		var foxClocksBundle = stringBundleService.createBundle("chrome://foxclocks/locale/foxclocks.properties");
		
		// AFM - reusing this property here
		//
		var alertText = foxClocksBundle.GetStringFromName("options.data.update.last.status.ok_new.label");
		var alertsService = CC["@mozilla.org/alerts-service;1"].getService(CI.nsIAlertsService);
		
		// AFM - register 'this' to observe 'alertclickcallback' and 'alertfinished'
		//
		alertsService.showAlertNotification("chrome://foxclocks/skin/icon.png", 
			"FoxClocks", alertText, true, "engine-internal:foxclocks-zone-data-update-complete:new", this);
	},
			
	// ====================================================================================
	_setLogLevel: function()
	{
		this._logger.setLevel(this._prefManager.getPref("foxclocks.logging.level"));
	},

	// ====================================================================================
	_enableTmpLog: function()
	{
		this._logger.enableTmpLog(this._prefManager.getPref("foxclocks.logging.tmpfile.enabled"));
	},	
	
	// ====================================================================================
	_convertLegacyParams : function(importedLegacyParams)
	{
		// AFM - we need to convert legacy params on startup and preference file import
		//
		this._logger.log("+FoxClocks_Engine::_convertLegacyParams()");

		var prefService = CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefBranch);
		prefService.QueryInterface(CI.nsIPrefService);
		
		var watchlistItems = new Array();							
		this._convertLegacyZonesParam(watchlistItems, importedLegacyParams);
		
		if (watchlistItems.length > 0)
		{
			this._watchlistManager.setWatchlist(watchlistItems);
			
			// AFM - this call actually notifies the engine to update the pref...
			// 
			this._watchlistManager.setUpdated();
		}
		
		// AFM - rename foxclocks.prevrun.version - params starting 'foxclocks.' now relate to true
		// configuration, and can be imported/exported
		//	
		var oldPrevRunVersionParam = this._prefManager.getPref("foxclocks.prevrun.version");
		if (oldPrevRunVersionParam != null)
		{
			this._prefManager.setPref("extensions." + this._utils.FC_GUID_FOXCLOCKS +
					".prevrun.version", oldPrevRunVersionParam);
		}
		
		// AFM - delete old prefs
		//
		prefService.getBranch("foxclocks.firstrun").deleteBranch("");
		prefService.getBranch("foxclocks.updateinterval").deleteBranch("");
		prefService.getBranch("foxclocks.zones").deleteBranch("");
		prefService.getBranch("foxclocks.prevrun.version").deleteBranch("");
		prefService.getBranch("foxclocks.format.all.standard").deleteBranch("");
		prefService.getBranch("foxclocks.format.all.custom").deleteBranch("");
		
		this._logger.log("-FoxClocks_Engine::_convertLegacyParams()");
	},

	// ====================================================================================
	_convertLegacyZonesParam : function(watchlistItems, importedLegacyParams)
	{
		this._logger.log("+FoxClocks_Engine::_convertLegacyZonesParam()");

		// AFM - foxclocks.zones param to array of WatchlistItems
		//
				
		zonesPref = (importedLegacyParams != null) ? importedLegacyParams["foxclocks.zones"]:
			this._prefManager.getPref("foxclocks.zones");
			
		if (zonesPref == null)
		{
			this._logger.log("-FoxClocks_Engine::_convertLegacyZonesParam(): no legacy data - nothing to do");
			return false;
		}
		
		const FC_LOCATION_DELIM = '|';
		var zonesPrefArray = zonesPref.split(FC_LOCATION_DELIM);
	
		for (var i = 0; zonesPrefArray != "" && i < zonesPrefArray.length; i++)
		{		
			var watchlistItem = this._watchlistManager.createItem(null);
			if (watchlistItem.legacyFromZoneParam(zonesPrefArray[i]) == false)
				continue;

			watchlistItems.push(watchlistItem);
		}
		
		this._logger.log("-FoxClocks_Engine::_convertLegacyZonesParam()", this._logger.INFO);
			
		return true;
	},
	
	// ====================================================================================
	_doDiagnostics: function()
	{
		try
		{
			var appInfo = this._utils.getAppInfo();
			var date = new Date();
			
			// AFM - SeaMonkey/XPFE
			//
			var osString = "nsIXULRuntime" in CI ?
				CC["@mozilla.org/xre/app-info;1"].getService(CI.nsIXULRuntime).OS :
				CC["@mozilla.org/network/protocol;1?name=http"].getService(CI.nsIHttpProtocolHandler).oscpu;

			var localeService = CC["@mozilla.org/intl/nslocaleservice;1"].getService(CI.nsILocaleService);
			var systemLocale = localeService.getSystemLocale().getCategory("NSILOCALE_CTYPE");
			var appLocale = this._utils.getAppLocale().string;
			var dataSource = this._zoneManager.dataSource;
 			var extensionsString = "";
 			
			if ("@mozilla.org/extensions/manager;1" in CC && "nsIExtensionManager" in CI)
			{
				var em = CC["@mozilla.org/extensions/manager;1"].getService(CI.nsIExtensionManager);
				var addons = em.getItemList(CI.nsIUpdateItem.TYPE_EXTENSION, { });
				
				for (var i = 0; i < addons.length; i++)
				{
					var addon = addons[i];
					extensionsString += addon.name + " (" + addon.version + ")";
					
					if (i < addons.length - 1)
						extensionsString += ", ";
				}
			}
			else
			{
				// AFM - SeaMonkeyXPFE
				//
				extensionsString += "(unavailable)";
			}

			this._logger.log("DIAGNOSTICS: FoxClocks " + this._utils.getFoxClocksVersion() +
				" (" + dataSource.name + " " + dataSource.version + ") / " + appInfo.appName +
				" " + appInfo.appVersion + " (" + appLocale + ") on " + osString + " (" + systemLocale +
				"). Auto-update " + (this._updateManager.nextUpdateDate != null ? "enabled" : "disabled") +
				". Universal time " + date.toUTCString() + "; local time " + date.toString() + " - offset " + date.getTimezoneOffset() + " mins"

				, this._logger.INFO);

			this._logger.log("DIAGNOSTICS: Installed extensions: " + extensionsString + "\n");
		}
		catch (ex)
		{
			this._logger.log("FoxClocks_Engine::_doDiagnostics(): diagnostics failed: " + ex, this._logger.ERROR);
		}
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
	get contractID() { return FoxClocks_Engine.contractID; },
	get classID() { return FoxClocks_Engine.classID; },
	get classDescription() { return FoxClocks_Engine.classDescription; },
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
var gXpComObjects = [FoxClocks_Engine];
var gCatObserverName = FoxClocks_Engine.classDescription; // can be anything
var gCatContractID = FoxClocks_Engine.contractID;

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
		catman.addCategoryEntry("xpcom-startup", this._catObserverName, "" + this._catContractId, true, true);
		catman.addCategoryEntry("xpcom-shutdown", this._catObserverName, "" + this._catContractId, true, true);
	},

	// ====================================================================================
	unregisterSelf: function(aCompMgr, aFileSpec, aLocation)
	{
		var catman = CC["@mozilla.org/categorymanager;1"].getService(CI.nsICategoryManager);
		catman.deleteCategoryEntry("xpcom-startup", this._catObserverName, true);
		catman.deleteCategoryEntry("xpcom-shutdown", this._catObserverName, true)
				
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