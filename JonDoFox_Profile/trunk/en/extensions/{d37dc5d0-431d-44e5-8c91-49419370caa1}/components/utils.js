// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2007 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;

// ====================================================================================
FoxClocks_Utils.classID = Components.ID("2b2bdf40-54a3-11db-8373-b622a1ef5492");
FoxClocks_Utils.contractID = "@stemhaus.com/firefox/foxclocks/utils;1";
FoxClocks_Utils.classDescription = "FoxClocks Utility Service";

// ====================================================================================
function FoxClocks_Utils()
{
	this.componentStarted = false;

	this.FC_GUID_FIREFOX = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
	this.FC_GUID_THUNDERBIRD = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
	this.FC_GUID_SUNBIRD = "{718e30fb-e89b-41dd-9da7-e25a45638b28}";
	this.FC_GUID_SEAMONKEY = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";
	this.FC_GUID_FOXCLOCKS = "{d37dc5d0-431d-44e5-8c91-49419370caa1}";
	
	this.FC_CLOCK_UPDATE_INTERVAL = 500;
	this.FC_XML_DEC = '<?xml version="1.0" encoding="UTF-8"?>';
	
	this.FC_URL_FOXCLOCKSHOME = "http://www.stemhaus.com/firefox/foxclocks/";
	this.FC_URL_FOXCLOCKSCHANGELOG = this.FC_URL_FOXCLOCKSHOME + "#changelog";
	this.FC_URL_FOXCLOCKS_DATABASE_UPDATE = this.FC_URL_FOXCLOCKSHOME + "news/foxclocks-time-zone-database-updates/";
	
	this.FC_URI_ZONEPICKER_NAMESPACE = this.FC_URL_FOXCLOCKSHOME + "zonepicker";
	
	this.isFirefox15Up = false;
	
	this._domImpl = null;
}

// ====================================================================================
FoxClocks_Utils.prototype =
{
	// ====================================================================================
	startup: function()
	{
		var appInfo = this.getAppInfo();
		
		var comparator = CC["@mozilla.org/xpcom/version-comparator;1"].getService(CI.nsIVersionComparator);
			
		// AFM - hope this picks up various betas that may be out there
		//
		var appVs11 = comparator.compare(appInfo.appVersion, "1.1");
		this.isFirefox15Up = (appInfo.appName == "Firefox" && appVs11 >= 0);
		
		this.componentStarted = true;
		CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService)
			.notifyObservers(this, "foxclocks", "component:startup");
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
	getDOMImpl: function()
	{					
		// AFM - see http://boring.youngpup.net/2005/0918015401
		//
		if (this._domImpl == null)
		{
			this._domImpl = CC["@mozilla.org/xmlextras/domparser;1"].createInstance(CI.nsIDOMParser)
				.parseFromString("<foo/>", "text/xml").implementation;
		}
		
		return this._domImpl;
	},

	// ====================================================================================
	getAppLocale: function()
	{
		// AFM - don't use nsILocaleService.getApplicationLocale()
		//
		var prefService = CC["@stemhaus.com/firefox/foxclocks/prefmanager;1"].getService(CI.nsISupports).wrappedJSObject;
		var appLocale = prefService.getPref("general.useragent.locale");
		var appLocaleArray = appLocale.split('-');
		
		var retVal = {major: appLocaleArray[0], minor: null, string: appLocale};

		if (appLocaleArray.length > 1)
			retVal.minor = appLocaleArray[1];
			
		return retVal;		
	},
	
	// ====================================================================================
	getFoxClocksDir: function()
	{
		if ("@mozilla.org/extensions/manager;1" in CC && "nsIExtensionManager" in CI)
		{
			return CC["@mozilla.org/extensions/manager;1"].getService(CI.nsIExtensionManager)
				.getInstallLocation(this.FC_GUID_FOXCLOCKS)
				.getItemLocation(this.FC_GUID_FOXCLOCKS);	
		}
		else
		{
			// AFM - SeaMonkey/XPFE
			//
			var file = CC["@mozilla.org/file/directory_service;1"]
				.getService(CI.nsIProperties)
				.get("ProfD", CI.nsIFile);
				
			file.append("chrome");
			file.append("foxclocks");
			return file;
		}
    },
              
	// ====================================================================================
	as12hr: function(i) {return (i == 0 || i == 12) ? "12" : i % 12;},
	asTwoDigit: function(i) {return (i > 9) ? i : "0" + i;},

	// ====================================================================================
	getFoxClocksVersion: function()
	{		
		if ("@mozilla.org/extensions/manager;1" in CC && "nsIExtensionManager" in CI)
		{
			var em = CC["@mozilla.org/extensions/manager;1"].getService(CI.nsIExtensionManager);
			return em.getItemForID(this.FC_GUID_FOXCLOCKS).version;
		}
		else
		{
			// AFM - SeaMonkey/XPFE - version written in by ant
			//
			return "2.2.23";
		}
	},

	// ====================================================================================
	getFirstEltByTagAsNode: function(node, tag)
	{
		var elts = node.getElementsByTagName(tag);
		
		if (elts.length != 0)
			return elts.item(0).QueryInterface(CI.nsIDOMElement);
		else
			return null;
	},
	
	// ====================================================================================
	stringToTmpFile: function(dataString, charset, tmpFileName)
	{
		// AFM - from http://kb.mozillazine.org/Dev_:_Extensions_:_Example_Code_:_File_IO
		// and http://developer.mozilla.org/en/docs/Writing_textual_data
		// *** Should migrate to nsIConverterOutputStream for Gecko 1.8 ***
		// Wonder if there's better way to do this...
		//
				
		// AFM - create and init unicodeConverter, and convert string.
		// Converter doesn't support charsets with embedded nulls, e.g. UTF-16 and UTF-32
		//
		var unicodeConverter = CC["@mozilla.org/intl/scriptableunicodeconverter"]
				.createInstance(CI.nsIScriptableUnicodeConverter);
		unicodeConverter.charset = charset;
		var convertedString = unicodeConverter.ConvertFromUnicode(dataString);
				
		// AFM - create temp. file
		//
		var tmpFile = CC["@mozilla.org/file/directory_service;1"]
				.getService(CI.nsIProperties)
				.get("TmpD", CI.nsILocalFile);
									 
		tmpFile.append(tmpFileName);
		tmpFile.createUnique(CI.nsIFile.NORMAL_FILE_TYPE, 0664);
	
		// AFM - create stream for writing to file, and write
		//
		var outStream = CC["@mozilla.org/network/file-output-stream;1"]
				.createInstance(CI.nsIFileOutputStream);
				
		// AFM - write, create, truncate
		//
		outStream.init(tmpFile, 0x02 | 0x08 | 0x20, 0664, 0);
		outStream.write(convertedString, convertedString.length);
				
		// AFM - write finalisation stuff. Usually not needed; dependent on encoding
		//
		var finalData = unicodeConverter.Finish();
		if (finalData.length > 0)
			outStream.write(finalData, finalData.length);
	 
		outStream.close();
		
		return tmpFile;
	},

	// ====================================================================================
	openGoogleEarth : function(location)
	{
		var doc = this.getDOMImpl().createDocument("http://earth.google.com/kml/2.0", "kml", null);
				
		var kmlDocument = doc.createElement("Document");
		doc.documentElement.appendChild(kmlDocument);
		
		var kmlPlacemark = doc.createElement("Placemark")
		kmlDocument.appendChild(kmlPlacemark);

		var kmlName = doc.createElement("name");
		kmlPlacemark.appendChild(kmlName);		

		var kmlPoint = doc.createElement("Point");
		kmlPlacemark.appendChild(kmlPoint);

		var kmlAltitudeMode = doc.createElement("altitudeMode");
		kmlPoint.appendChild(kmlAltitudeMode);
		
		var kmlCoordinates = doc.createElement("coordinates");
		kmlPoint.appendChild(kmlCoordinates);
		
		var kmlLookAt = doc.createElement("LookAt");
		kmlPlacemark.appendChild(kmlLookAt);

		var kmlHeading = doc.createElement("heading");
		kmlLookAt.appendChild(kmlHeading);

		var kmlTilt = doc.createElement("tilt");
		kmlLookAt.appendChild(kmlTilt);
		
		var kmlRange = doc.createElement("range");
		kmlLookAt.appendChild(kmlRange);
		
		var kmlLatitude = doc.createElement("latitude");
		kmlLookAt.appendChild(kmlLatitude);
		
		var kmlLongitude = doc.createElement("longitude");
		kmlLookAt.appendChild(kmlLongitude);
	
		var prefService = CC["@stemhaus.com/firefox/foxclocks/prefmanager;1"].getService(CI.nsISupports).wrappedJSObject;
		var range = prefService.getPref("foxclocks.googleearth.lookat.range");
														
		kmlName.appendChild(doc.createTextNode(location.name));
		kmlAltitudeMode.appendChild(doc.createTextNode("relativeToGround"));
		kmlCoordinates.appendChild(doc.createTextNode(location.getLongitude() + "," + location.getLatitude() + ",0"));	
		kmlHeading.appendChild(doc.createTextNode("0"));
		kmlTilt.appendChild(doc.createTextNode("0"));
		kmlRange.appendChild(doc.createTextNode(range));
		kmlLatitude.appendChild(doc.createTextNode(location.getLatitude()));
		kmlLongitude.appendChild(doc.createTextNode(location.getLongitude()));		
		
		var serializer = CC["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(CI.nsIDOMSerializer);
		var kmlString = this.FC_XML_DEC + serializer.serializeToString(doc);

		// AFM - can throw
		//
		var kmlFile = this.stringToTmpFile(kmlString, "UTF-8", "foxclocks.kml");
		kmlFile.launch();
	},
	
	// ====================================================================================
	getAppInfo: function()
	{
		var appInfo = CC["@mozilla.org/xre/app-info;1"].getService(CI.nsIXULAppInfo);
		
		var retVal = {appName: "???", appVersion: appInfo.version};
			
		if (appInfo.ID == this.FC_GUID_FIREFOX)
			retVal.appName = "Firefox";
		else if (appInfo.ID == this.FC_GUID_THUNDERBIRD)
			retVal.appName = "Thunderbird";
		else if (appInfo.ID == this.FC_GUID_SUNBIRD)
			retVal.appName = "Sunbird";
		else if (appInfo.ID == this.FC_GUID_SEAMONKEY)
			retVal.appName = "SeaMonkey";
		
		return retVal;
	},

	// ====================================================================================
	openFoxClocksHomeURL: function(atChangeLog)
	{
		var url = atChangeLog ? this.FC_URL_FOXCLOCKSCHANGELOG : this.FC_URL_FOXCLOCKSHOME;
		this._openURL(url);
	},

	// ====================================================================================		
	openFoxClocksDbUpdateURL: function()
	{
		this._openURL(this.FC_URL_FOXCLOCKS_DATABASE_UPDATE);
	},
			
	// ====================================================================================
	_openURL: function(url)
	{
		var appInfo = this.getAppInfo();
	
		try
		{
			if (appInfo.appName == "Thunderbird")
			{
				var messenger = Components.classes["@mozilla.org/messenger;1"].getService(Components.interfaces.nsIMessenger);
				messenger.launchExternalURL(url);
			}
			else if (appInfo.appName == "Sunbird")
			{
				// AFM - from http://lxr.mozilla.org/mozilla/source/calendar/resources/content/applicationUtil.js#74
				//
				var externalLoader = (Components
					.classes["@mozilla.org/uriloader/external-protocol-service;1"]
					.getService(Components.interfaces.nsIExternalProtocolService));
					
				var nsURI = (Components
					.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService)
					.newURI(url, null, null));
					
				externalLoader.loadUrl(nsURI);
			}
			else if (appInfo.appName == "Firefox" || appInfo.appName == "SeaMonkey")
			{
				var mediatorService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
				var mrBrowserWindow = mediatorService.getMostRecentWindow("navigator:browser");
				
				if (mrBrowserWindow != null)
				{
					var loc = mrBrowserWindow.content.document.location;
					
					if (loc == "about:blank")
					{
						loc.assign(url);
						mrBrowserWindow.focus();
					}
					else if (loc == url)
					{
						mrBrowserWindow.focus();
					}
					else
					{	
						// AFM - could cycle through the tabs looking for the url, I suppose
						//
						var browser = mrBrowserWindow.document.getElementById("content");
						var tab = browser.addTab(url);
						browser.selectedTab = tab;
					}
				}
				else
				{
					var mrWindow = mediatorService.getMostRecentWindow(null);
					mrWindow.open(url, "", "");
				}
			}
		}
		catch(ex)
		{
			fc_gPromptService.alert(null, "FoxClocks", "FoxClocks_Utils::_openURL(): " + ex);
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
	get contractID() { return FoxClocks_Utils.contractID; },
	get classID() { return FoxClocks_Utils.classID; },
	get classDescription() { return FoxClocks_Utils.classDescription; },
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
var gXpComObjects = [FoxClocks_Utils];
var gCatObserverName = FoxClocks_Utils.classDescription; // can be anything
var gCatContractID = FoxClocks_Utils.contractID;

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