// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2007 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;

// ====================================================================================
FoxClocks_Logger.classID = Components.ID("{11eead30-59dd-11da-8cd6-0800200c9a66}");
FoxClocks_Logger.contractID = "@stemhaus.com/firefox/foxclocks/logger;1";
FoxClocks_Logger.classDescription = "FoxClocks Logging Service";

FoxClocks_Logger._levelAsString = new Array("DEBUG", "INFO", "WARN", "ERROR");

// ====================================================================================
function FoxClocks_Logger()
{
	this.componentStarted = false;
	
	this.DEBUG = 0;
	this.INFO = 1;
	this.WARN = 2;
	this.ERROR = 3;
	
	this._outStream = null;
	this._outStreamEnabled = false;

	this._consoleService = CC['@mozilla.org/consoleservice;1'].getService(CI.nsIConsoleService);
	this._level = this.INFO; // default level
}

// ====================================================================================
FoxClocks_Logger.prototype =
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
	onObserve: function(aSubject, aTopic, aData)
	{
	},
	
	// ====================================================================================
	log: function(message, level)
	{
		// AFM - should be passing in method name
		//
		var logLevel = level != null ? level : this.DEBUG;
		
		if (logLevel < this._level)
			return;
			
		var appName = "FoxClocks";
		var levelString = FoxClocks_Logger._levelAsString[logLevel];
				
		if (logLevel <= this.INFO)
		{
			this._consoleService.logStringMessage(appName + " (" + levelString + "): " + message);
		}
		else
		{
			var flag = (logLevel == this.WARN ? CI.nsIScriptError.warningFlag : CI.nsIScriptError.errorFlag);

			var error = CC["@mozilla.org/scripterror;1"].createInstance(CI.nsIScriptError);
			error.init(appName + ": " + message, null, null, null, null, flag, null);
			this._consoleService.logMessage(error);
		}

		if (this._outStreamEnabled == true && this._outStream != null)
		{
			var messageString = appName + " (" + levelString + "): " + message + "\n";
			this._outStream.write(messageString, messageString.length);
		}
	},

	// ====================================================================================
	setLevel: function(level)
	{
		if (level < this.DEBUG || level > this.ERROR)
			return false;

		this._level = level;
		return true;
	},
	
	// ====================================================================================
	getLevel: function()
	{
		return this._level;
	},
	
	// ====================================================================================
	enableTmpLog: function(truth)
	{
		this._outStreamEnabled = truth;
		
		if (this._outStreamEnabled == true && this._outStream == null)
		{	
			try
			{
				var tmpFile = CC["@mozilla.org/file/directory_service;1"]
						.getService(CI.nsIProperties).get("TmpD", CI.nsILocalFile);
											 
				tmpFile.append("foxclocks.log");
				tmpFile.createUnique(CI.nsIFile.NORMAL_FILE_TYPE, 0664);
			
				this._outStream = CC["@mozilla.org/network/file-output-stream;1"]
						.createInstance(CI.nsIFileOutputStream);
						
				// AFM - write, create, truncate
				//
				this._outStream.init(tmpFile, 0x02 | 0x08 | 0x20, 0664, 0);
				
				tmpFile.QueryInterface(CI.nsIFile);
				this.log("FoxClocks_Logger::enableTmpLog(): stream created on " + tmpFile.path);
			}
			catch (ex)
			{
				this.log("FoxClocks_Logger::enableTmpLog(): file logging initialization failed: " + ex, this.ERROR);
				this._outStreamEnabled = false;
			}
		}
		
		this.log("FoxClocks_Logger::enableTmpLog(): " + this._outStreamEnabled);
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
	get contractID() { return FoxClocks_Logger.contractID; },
	get classID() { return FoxClocks_Logger.classID; },
	get classDescription() { return FoxClocks_Logger.classDescription; },
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
var gXpComObjects = [FoxClocks_Logger];
var gCatObserverName = FoxClocks_Logger.classDescription; // can be anything
var gCatContractID = FoxClocks_Logger.contractID;

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