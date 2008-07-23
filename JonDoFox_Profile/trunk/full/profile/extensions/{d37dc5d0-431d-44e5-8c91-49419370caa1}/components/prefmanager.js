// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;

// ====================================================================================
FoxClocks_PrefManager.classID = Components.ID("{69344f1c-270c-4d47-8e50-81108fcf7f2c}");
FoxClocks_PrefManager.contractID = "@stemhaus.com/firefox/foxclocks/prefmanager;1";
FoxClocks_PrefManager.classDescription = "FoxClocks Preference Service";
				
// ====================================================================================
function FoxClocks_PrefManager()
{
	this.componentStarted = false;
	this._prefService = null;
	this._prefsDeclaredAsXml = new Array();
	this._prefsDeclaredAsLegacy = new Array();
	this._importedLegacyPrefs = null;
}

// ====================================================================================
FoxClocks_PrefManager.prototype =
{
	// ====================================================================================
	startup: function()
	{
		this._prefService = CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefBranch);

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
	getPrefTypeString : function(prefType)
	{
		if (prefType == CI.nsIPrefBranch.PREF_STRING)
			return "PREF_STRING";
		else if (prefType == CI.nsIPrefBranch.PREF_INT)
			return "PREF_INT";
		else if (prefType == CI.nsIPrefBranch.PREF_BOOL)
			return "PREF_BOOL";
		else
			return "PREF_INVALID";
	},		
	
	// ====================================================================================
	getPref : function(prefName)
	{
		try
		{
			var prefType = this._prefService.getPrefType(prefName);
			
			// AFM - don't use getCharPref(): all string prefs are unicode
			//
			if (prefType == this._prefService.PREF_STRING)
			{		
				var data = this._prefService.getComplexValue(prefName, CI.nsISupportsString).data;
				
				// AFM - there's no way to know whether a pref has a localised default, but this works well
				// unless there's really a pref which is a chrome URL
				//
				if (data.substring(0, 9) == "chrome://")
					data = this._prefService.getComplexValue(prefName, CI.nsIPrefLocalizedString).data;
	
				return data;
			}	
			else if (prefType == this._prefService.PREF_INT)
			{
				return this._prefService.getIntPref(prefName);
			}
			else if (prefType == this._prefService.PREF_BOOL)
			{
				return this._prefService.getBoolPref(prefName);
			}
			else
			{
				return null;
			}
		}
		catch (ex)
		{	
			var logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"].
				getService(CI.nsISupports).wrappedJSObject;
			logger.log("FoxClocks_PrefManager::getPref(): error on pref <" + prefName +
				">: " + ex, logger.ERROR);
			return null;
		}
	},
	  
	// ====================================================================================
	setPref : function(prefName, value)
	{
		var prefType = this._prefService.getPrefType(prefName);
		
		if (prefType == this._prefService.PREF_STRING)
		{
			// AFM - don't use setCharPref(): all string prefs are unicode
			//
			var supportsString = CC["@mozilla.org/supports-string;1"]
					.createInstance(CI.nsISupportsString);
			supportsString.data = value;
		
			this._prefService.setComplexValue(prefName, CI.nsISupportsString, supportsString);
		}
		else if (prefType == this._prefService.PREF_INT)
		{
			this._prefService.setIntPref(prefName, value);
		}
		else if (prefType == this._prefService.PREF_BOOL)
		{
			this._prefService.setBoolPref(prefName, value);
		}
	},
	
	// ====================================================================================
	addPrefObserver : function(branchName, observer)
	{
		var nsIPrefBranchInternal = this._prefService.QueryInterface(CI.nsIPrefBranchInternal);
		nsIPrefBranchInternal.addObserver(branchName, observer, false);
	},
	
	// ====================================================================================
	removePrefObserver : function(branchName, observer)
	{
		var nsIPrefBranchInternal = this._prefService.QueryInterface(CI.nsIPrefBranchInternal);
		nsIPrefBranchInternal.removeObserver(branchName, observer);
	},

	// ====================================================================================
	declarePrefAsXml : function(fqPrefName, truth)
	{
		// AFM - the pref must not be a document fragment
		//
		this._prefsDeclaredAsXml[fqPrefName] = (typeof(truth) == "undefined" || truth == true); 
	},
	
	// ====================================================================================
	prefIsDeclaredAsXml : function(fqPrefName)
	{
		var truth = this._prefsDeclaredAsXml[fqPrefName];
		return (typeof(truth) != "undefined" && truth == true); 
	},

	// ====================================================================================
	declarePrefAsLegacy : function(fqPrefName, truth)
	{
		this._prefsDeclaredAsLegacy[fqPrefName] = (typeof(truth) == "undefined" || truth == true); 
	},
	
	// ====================================================================================
	prefIsDeclaredAsLegacy : function(fqPrefName)
	{
		var truth = this._prefsDeclaredAsLegacy[fqPrefName];
		return (typeof(truth) != "undefined" && truth == true); 
	},

	// ====================================================================================
	getImportedLegacyPrefs : function()
	{
		return this._importedLegacyPrefs; 
	},
				
	// ====================================================================================
	prefsToXml : function(branchName, xmlns, rootElt, version)
	{    
		var utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;
		var domParser = CC["@mozilla.org/xmlextras/domparser;1"].createInstance(CI.nsIDOMParser);

		var doc = utils.getDOMImpl().createDocument(xmlns, rootElt, null);
		var root = doc.documentElement;
		
		if (version != null)
			root.setAttribute("version", version);
			
		var prefsList = this._prefService.getChildList(branchName, {});
	        
		for (var i=0; i < prefsList.length; i++)
		{
			var currPref = prefsList[i];
			var currPrefTypeStr = this.getPrefTypeString(this._prefService.getPrefType(currPref));
						
			var elt = doc.createElement("Pref");
			root.appendChild(elt);
			elt.setAttribute("id", currPref);
			elt.setAttribute("type", currPrefTypeStr);
			
			var currPrefValue = this.getPref(currPref);
			
			if (this.prefIsDeclaredAsXml(currPref))
			{
				var valueNode = doc.createElement("Value");
				elt.appendChild(valueNode);

				// AFM - the pref must not be a document fragment
				//
				var currPrefValueAsDoc = domParser.parseFromString(currPrefValue, "text/xml");
				var nodeToImport = doc.importNode(currPrefValueAsDoc.documentElement, true); // true => deep copy
				valueNode.appendChild(nodeToImport);
			}
			else
			{
				elt.setAttribute("value", currPrefValue);
			}
		}
		
		return doc; 
	},
	
	// ====================================================================================
	xmlToPrefs : function(branchName, doc)
	{
		var utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].
			getService(CI.nsISupports).wrappedJSObject;

		var logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"].
			getService(CI.nsISupports).wrappedJSObject;

		var serializer = CC["@mozilla.org/xmlextras/xmlserializer;1"].
			createInstance(CI.nsIDOMSerializer);
		
		var root = doc.documentElement;
										
		if (root.nodeName == "parsererror")
			return false;
	
		// AFM - hack: beta versions of FoxClocks 2.0 went out with root node
		// <FoxClocks>. These are not supported
		//
		if (root.nodeName == "FoxClocks")
		{
			logger.log("FoxClocks_PrefManager::xmlToPrefs(): unsupported format", logger.ERROR);
			return false;
		}
			
		var importedPrefs = [];			
		var prefNodes = root.getElementsByTagName("Pref");

		for (var i=0; i < prefNodes.length; i++)
		{
			var prefNode = prefNodes.item(i);
			prefNode.QueryInterface(CI.nsIDOMElement);
			
			var id = prefNode.getAttribute("id");
			var value = prefNode.getAttribute("value");
			var type = prefNode.getAttribute("type");
			
			if (id == null || type == null)
			{
				logger.log("FoxClocks_PrefManager::xmlToPrefs(): pref node has missing attributes - skipping", logger.WARN);
			}
			else
			{
				if (importedPrefs[id] != null)
				{
					logger.log("FoxClocks_PrefManager::xmlToPrefs(): duplicate pref <" + id +
							"> - overwriting", logger.WARN);
				}
				
				// AFM - pref is stored in the 'value' attribute
				//
				if (value != null)
				{	
					// AFM - change from string type to bool type
					//
					if (type == "PREF_BOOL")
						importedPrefs[id] = (value == "true" ? true : false);
					else
						importedPrefs[id] = value;
				}
				else
				{
					var valueNode = utils.getFirstEltByTagAsNode(prefNode, "Value");
					if (valueNode != null && valueNode.firstChild != null)
						importedPrefs[id] = serializer.serializeToString(valueNode.firstChild);
					else
						logger.log("FoxClocks_PrefManager::xmlToPrefs(): pref node has missing value - skipping", logger.WARN);
				}	
			}
		}		
			
		var prefsList = this._prefService.getChildList(branchName, {});
		for (var i=0; i < prefsList.length; i++)
		{
			var currPref = prefsList[i];
			var value = importedPrefs[currPref];
			
			if (value == null)
			{
				logger.log("FoxClocks_PrefManager::xmlToPrefs(): document does not contain pref <" +
						currPref + ">", logger.WARN);
			}		
			else if (value == this.getPref(currPref))
			{
				logger.log("FoxClocks_PrefManager::xmlToPrefs(): pref <" + currPref + ">, value <" +
					value + "> - no change");
			}
			else
			{
				logger.log("FoxClocks_PrefManager::xmlToPrefs(): pref <" + currPref + ">, value <" +
					value + "> - changed");
					
				this.setPref(currPref, value);
			}
		}

		// AFM - see any of the prefs we've just imported in are legacy; if so, put them in
		// a hash table and notify observers
		//
		this._importedLegacyPrefs = new Array();
		var shouldNotify = false;
		
		for (currPref in this._prefsDeclaredAsLegacy)
		{
			logger.log("FoxClocks_PrefManager::xmlToPrefs(): legacy pref <" + currPref + ">, imported <" +
				(importedPrefs[currPref] != null) + ">");
					
			if (importedPrefs[currPref] != null)
			{
				shouldNotify = true;
				this._importedLegacyPrefs[currPref] = importedPrefs[currPref];
			}
		}

		if (shouldNotify)
		{		
			logger.log("FoxClocks_PrefManager::xmlToPrefs(): notifying");
								
			CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService)
				.notifyObservers(this, "foxclocks", "prefmanager:legacy-prefs-imported");
		}
				
		this._importedLegacyPrefs = null;
		return true;
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
	get contractID() { return FoxClocks_PrefManager.contractID; },
	get classID() { return FoxClocks_PrefManager.classID; },
	get classDescription() { return FoxClocks_PrefManager.classDescription; },
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
var gXpComObjects = [FoxClocks_PrefManager];
var gCatObserverName = FoxClocks_PrefManager.classDescription; // can be anything
var gCatContractID = FoxClocks_PrefManager.contractID;

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