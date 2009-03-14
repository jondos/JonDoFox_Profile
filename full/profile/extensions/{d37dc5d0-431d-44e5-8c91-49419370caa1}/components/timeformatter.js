// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;
var fc_gUtils = null;

// ====================================================================================
FoxClocks_TimeFormatter.classID = Components.ID("75743d84-df97-11db-9cae-9a8b55d89593");
FoxClocks_TimeFormatter.contractID = "@stemhaus.com/firefox/foxclocks/timeformatter;1";
FoxClocks_TimeFormatter.classDescription = "FoxClocks Time Formatter";

// ====================================================================================
function FoxClocks_TimeFormatter(formatString)
{	
	this.currentFormatArray = formatString ? FoxClocks_TimeFormatter._createFormatArray(formatString) : new Array();
}

// ====================================================================================
FoxClocks_TimeFormatter.prototype =
{
	// ====================================================================================
	startup: function()
	{
		fc_gUtils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;
	
 		var stringBundleService = CC["@mozilla.org/intl/stringbundle;1"].getService(CI.nsIStringBundleService);
		var foxClocksBundle = stringBundleService.createBundle("chrome://foxclocks/locale/foxclocks.properties");
		
		var amlower = foxClocksBundle.GetStringFromName("misc.am.lower");
		var pmlower = foxClocksBundle.GetStringFromName("misc.pm.lower");
		var amupper = foxClocksBundle.GetStringFromName("misc.am.upper");
		var pmupper = foxClocksBundle.GetStringFromName("misc.pm.upper");
		var monthNameLongArray = foxClocksBundle.GetStringFromName("misc.list.month.name.long").split(",");
		var monthNameShortArray = foxClocksBundle.GetStringFromName("misc.list.month.name.short").split(",");
		var dayNameLongArray = foxClocksBundle.GetStringFromName("misc.list.day.name.long").split(",");	
		var dayNameShortArray = foxClocksBundle.GetStringFromName("misc.list.day.name.short").split(",");			
		var dayOrdinalArray = foxClocksBundle.GetStringFromName("misc.list.day.ordinal").split(",");
		var defaultLocation = foxClocksBundle.GetStringFromName("misc.default.location");
		var defaultOffset = foxClocksBundle.GetStringFromName("misc.default.offset");
		var defaultZoneName = foxClocksBundle.GetStringFromName("misc.default.zonename");
			
		var pHolderSecs = foxClocksBundle.GetStringFromName("options.format.custom.secs.value");
		var pHolderMins = foxClocksBundle.GetStringFromName("options.format.custom.mins.value");
		var pHolderHours121 = foxClocksBundle.GetStringFromName("options.format.custom.hours.12.1.value");
		var pHolderHours122 = foxClocksBundle.GetStringFromName("options.format.custom.hours.12.2.value");
		var pHolderHours241 = foxClocksBundle.GetStringFromName("options.format.custom.hours.24.1.value");
		var pHolderHours242 = foxClocksBundle.GetStringFromName("options.format.custom.hours.24.2.value");
		var pHolderAmLower = foxClocksBundle.GetStringFromName("options.format.custom.am.lower.value");
		var pHolderAmUpper = foxClocksBundle.GetStringFromName("options.format.custom.am.upper.value");
		var pHolderYear4 = foxClocksBundle.GetStringFromName("options.format.custom.year.4.value");
		var pHolderYear2 = foxClocksBundle.GetStringFromName("options.format.custom.year.2.value");
		var pHolderMonthNum1 = foxClocksBundle.GetStringFromName("options.format.custom.month.num.1.value");
		var pHolderMonthNum2 = foxClocksBundle.GetStringFromName("options.format.custom.month.num.2.value");
		var pHolderMonthNameLong = foxClocksBundle.GetStringFromName("options.format.custom.month.name.long.value");
		var pHolderMonthNameShort = foxClocksBundle.GetStringFromName("options.format.custom.month.name.short.value");
		var pHolderDayNum1 = foxClocksBundle.GetStringFromName("options.format.custom.day.num.1.value");
		var pHolderDayNum2 = foxClocksBundle.GetStringFromName("options.format.custom.day.num.2.value");
		var pHolderDayNameLong = foxClocksBundle.GetStringFromName("options.format.custom.day.name.long.value");
		var pHolderDayNameShort = foxClocksBundle.GetStringFromName("options.format.custom.day.name.short.value");
		var pHolderDayOrdinal = foxClocksBundle.GetStringFromName("options.format.custom.day.ordinal.value");
		var pHolderDayOfYear = foxClocksBundle.GetStringFromName("options.format.custom.day.ofyear.value");
		var pHolderLocation = foxClocksBundle.GetStringFromName("options.format.custom.other.location.value");
		var pHolderOtherOffset = foxClocksBundle.GetStringFromName("options.format.custom.other.offset.value");
		var pHolderOtherZone = foxClocksBundle.GetStringFromName("options.format.custom.other.zone.value");
		
		FoxClocks_TimeFormatter.formatters = new Array();
		FoxClocks_TimeFormatter.formatters["secs"] = new FC_FormatSecs(pHolderSecs);
		FoxClocks_TimeFormatter.formatters["mins"] = new FC_FormatMins(pHolderMins);
		FoxClocks_TimeFormatter.formatters["hours.12.1"] = new FC_Format12Hour1(pHolderHours121);
		FoxClocks_TimeFormatter.formatters["hours.12.2"] = new FC_Format12Hour2(pHolderHours122);
		FoxClocks_TimeFormatter.formatters["hours.24.1"] = new FC_Format24Hour1(pHolderHours241);
		FoxClocks_TimeFormatter.formatters["hours.24.2"] = new FC_Format24Hour2(pHolderHours242);
		FoxClocks_TimeFormatter.formatters["am.lower"] = new FC_FormatAmLower(pHolderAmLower, amlower, pmlower);
		FoxClocks_TimeFormatter.formatters["am.upper"] = new FC_FormatAmUpper(pHolderAmUpper, amupper, pmupper);
		FoxClocks_TimeFormatter.formatters["year.4"] = new FC_FormatYear4(pHolderYear4);
		FoxClocks_TimeFormatter.formatters["year.2"] = new FC_FormatYear2(pHolderYear2);
		FoxClocks_TimeFormatter.formatters["month.num.1"] = new FC_FormatMonthNum1(pHolderMonthNum1);
		FoxClocks_TimeFormatter.formatters["month.num.2"] = new FC_FormatMonthNum2(pHolderMonthNum2);
		FoxClocks_TimeFormatter.formatters["month.name.long"] = new FC_FormatMonthNameLong(pHolderMonthNameLong, monthNameLongArray);
		FoxClocks_TimeFormatter.formatters["month.name.short"] = new FC_FormatMonthNameShort(pHolderMonthNameShort, monthNameShortArray);
		FoxClocks_TimeFormatter.formatters["day.num.1"] = new FC_FormatDayNum1(pHolderDayNum1);
		FoxClocks_TimeFormatter.formatters["day.num.2"] = new FC_FormatDayNum2(pHolderDayNum2);
		FoxClocks_TimeFormatter.formatters["day.name.long"] = new FC_FormatDayNameLong(pHolderDayNameLong, dayNameLongArray);
		FoxClocks_TimeFormatter.formatters["day.name.short"] = new FC_FormatDayNameShort(pHolderDayNameShort, dayNameShortArray);
		FoxClocks_TimeFormatter.formatters["day.ordinal"] = new FC_FormatDayOrdinal(pHolderDayOrdinal, dayOrdinalArray);
		FoxClocks_TimeFormatter.formatters["day.ofyear"] = new FC_FormatDayOfYear(pHolderDayOfYear);
		FoxClocks_TimeFormatter.formatters["other.location"] = new FC_FormatLocation(pHolderLocation, defaultLocation);
		FoxClocks_TimeFormatter.formatters["other.offset"] = new FC_FormatOffset(pHolderOtherOffset, defaultOffset);
		FoxClocks_TimeFormatter.formatters["other.zone"] = new FC_FormatZoneName(pHolderOtherZone, defaultZoneName);
		
		// AFM - may not have these translations available
		//
		try {
			var defaultDSTIndicator = foxClocksBundle.GetStringFromName("misc.default.dstindic");
			var pHolderOtherDstIndic = foxClocksBundle.GetStringFromName("options.format.custom.other.dstindic.value");
			FoxClocks_TimeFormatter.formatters["other.dstindic"] = new FC_FormatDSTIndicator(pHolderOtherDstIndic, defaultDSTIndicator);
		} catch (ex) {}
		
		try {
			var defaultAlignmentPosition = foxClocksBundle.GetStringFromName("misc.default.alignpos");
			var pHolderOtherAlignPos = foxClocksBundle.GetStringFromName("options.format.custom.other.alignpos.value");
			FoxClocks_TimeFormatter.formatters["other.alignpos"] = new FC_FormatAlignmentPosition(pHolderOtherAlignPos, defaultAlignmentPosition);
		} catch (ex) {}
		
		try {
			var pHolderDayOfYear3 = foxClocksBundle.GetStringFromName("options.format.custom.day.ofyear.3.value");
			FoxClocks_TimeFormatter.formatters["day.ofyear.3"] = new FC_FormatDayOfYear3(pHolderDayOfYear3)
		} catch (ex) {}
		
		
		var formatsRegexpString = "";	
		var isFirstIndex = true;
		
		for (var currFormatterKey in FoxClocks_TimeFormatter.formatters)
		{
			if (isFirstIndex)
				isFirstIndex = false;
			else
				formatsRegexpString += "|";
		
			// AFM - not using the format regexps really, but keeping them around for future use
			//
			formatsRegexpString += FoxClocks_TimeFormatter.formatters[currFormatterKey].placeholderRegexp.source;
		}
		
		FoxClocks_TimeFormatter.formatsRegexp = new RegExp(formatsRegexpString, "g");
	
		this.componentStarted = true;
		CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService)
			.notifyObservers(this, "foxclocks", "component:startup");
	},
	
	// ====================================================================================
	shutdown: function()
	{
		// AFM - comment out to log xpcom shutdown events
		//
		if (this._outStream != null)
			this._outStream.close();
	},
	
	// ====================================================================================
	onObserve: function(aSubject, aTopic, aData)
	{
	},
	
	// ====================================================================================
	getTimeString : function(location, date)
	{
		return FoxClocks_TimeFormatter._getTimeString(location, date, this.currentFormatArray);
	},
	
	// ====================================================================================
	getTimeStringFromFormat : function(location, date, formatString)
	{
		var formatArray = FoxClocks_TimeFormatter._createFormatArray(formatString);
		return FoxClocks_TimeFormatter._getTimeString(location, date, formatArray);
	},

	// ====================================================================================
	getUTCTimeStringFromFormat : function(date, formatString)
	{
		var formatArray = FoxClocks_TimeFormatter._createFormatArray(formatString);
		return FoxClocks_TimeFormatter._getTimeString(null, date, formatArray, false);
	},

		// ====================================================================================
	getLocalTimeStringFromFormat : function(date, formatString)
	{
		var formatArray = FoxClocks_TimeFormatter._createFormatArray(formatString);
		return FoxClocks_TimeFormatter._getTimeString(null, date, formatArray, true);
	},
	
	// ====================================================================================
	setTimeFormat : function(formatString)
	{
		this.currentFormatArray = FoxClocks_TimeFormatter._createFormatArray(formatString);
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
	get contractID() { return FoxClocks_TimeFormatter.contractID; },
	get classID() { return FoxClocks_TimeFormatter.classID; },
	get classDescription() { return FoxClocks_TimeFormatter.classDescription; },
	get implementationLanguage() { return CI.nsIProgrammingLanguage.JAVASCRIPT; },
	get flags() { return 0; },
  
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
FoxClocks_TimeFormatter._getTimeString = function(location, date, formatArray, defaultToLocal)
{	
	var displayDate = null;
	
	if (location != null)
		displayDate = location.zone.currDisplayDate(date);
	else if (defaultToLocal == true)
		displayDate = new Date(date.getTime() - date.getTimezoneOffset()*1000*60);
	else
		displayDate = date;
	
	var timeString = "";
	for (var i=0; i < formatArray.length; i++)
	{
		// AFM - pass in the original date for things like FC_FormatZoneName.dateToZoneName
		//
		timeString += formatArray[i].dateToText(date, displayDate, location);
	}
	
	return timeString;
}
	
// ====================================================================================
FoxClocks_TimeFormatter._createFormatArray = function(formatString)
{
	// AFM - anon function is not in the scope of the zone manager
	//
	var tmpCurrentFormat = new Array();
	var tmpFormatObjects = new Array();
	
	for (var currFormatterKey in FoxClocks_TimeFormatter.formatters)
	{
		tmpFormatObjects.push(FoxClocks_TimeFormatter.formatters[currFormatterKey]);
	}
	
	// AFM - we make a reasonable (??) assumption that matches are made in the order in which they occur in the text...
	// So anyway, this is ugly and grim, and we're not really doing any replacing; we just want the anon function executed on
	// each match, and I'm guessing it's better than regexp.exec()...
	// Frankly, this is all nonsense...
	//
	var nextMatchIndex = 0;
	
	formatString.replace(FoxClocks_TimeFormatter.formatsRegexp,
	
		function (str, p1, p2, offset, s)
		{
			if (nextMatchIndex < p1)
			{
				var unmatchedText = formatString.substr(nextMatchIndex, (p1 - nextMatchIndex))
				tmpCurrentFormat.push(new FC_FormatText(unmatchedText));
			}
	
			nextMatchIndex = p1 + str.length;
			
			for (var j = 0; j < tmpFormatObjects.length; j++)
			{
				if (str == tmpFormatObjects[j].placeholderRegexp.source)
				{
					tmpCurrentFormat.push(tmpFormatObjects[j]);
					break;
				}
			}
		}
	);
	
	// AFM - check for text after the last match
	//
	if (nextMatchIndex <= formatString.length - 1)
	{
		var text = formatString.substr(nextMatchIndex)
		tmpCurrentFormat.push(new FC_FormatText(text));
	}
	
	return tmpCurrentFormat;
}

// ====================================================================================
// constructors for objects we want to XPCOMify
//
var gXpComObjects = [FoxClocks_TimeFormatter];
var gCatObserverName = FoxClocks_TimeFormatter.classDescription; // can be anything
var gCatContractID = FoxClocks_TimeFormatter.contractID;

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

// ====================================================================================
// AFM - util classes
// ====================================================================================

// ====================================================================================
function FC_getDayOfYear(doyDate)
{
	const DAYS_IN_MONTH_NORMAL = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	const DAYS_IN_MONTH_LEAP = new Array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

	var day = doyDate.getUTCDate();
	var month = doyDate.getUTCMonth();
	var year = doyDate.getUTCFullYear();
	
	var isLeapYear = year % 4 == 0 && (year % 100 != 0 || year % 400 != 0);
	var monthArray = isLeapYear ? DAYS_IN_MONTH_LEAP : DAYS_IN_MONTH_NORMAL;

	var dayOfYear = 0;
	for (var i=0; i < month; i++)
	{
		dayOfYear += monthArray[i];
	}
	dayOfYear += day;
	
	return dayOfYear;
}

// ====================================================================================
// AFM - format classes
// ====================================================================================

// ====================================================================================
function FC_FormatText(text)
{
	if (typeof(FC_FormatText.prototype.dateToText) == "undefined")
	{
		FC_FormatText.prototype.dateToText = function (date, displayDate) { return this.text; }
		FC_FormatText.prototype.placeholderRegexp = null;
	}

	this.text = text;
}

// ====================================================================================
function FC_Format12Hour1(placeholderString)
{
	if (typeof(FC_Format12Hour1.prototype.dateToText) == "undefined")
	{
		FC_Format12Hour1.prototype.dateToText = function (date, displayDate)
		{ return fc_gUtils.as12hr(displayDate.getUTCHours()); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_Format12Hour2(placeholderString)
{
	if (typeof(FC_Format12Hour2.prototype.dateToText) == "undefined")
	{
		FC_Format12Hour2.prototype.dateToText = function (date, displayDate)
		{ return fc_gUtils.asTwoDigit(fc_gUtils.as12hr(displayDate.getUTCHours()));}
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_Format24Hour1(placeholderString)
{
	if (typeof(FC_Format24Hour1.prototype.dateToText) == "undefined")
	{
		FC_Format24Hour1.prototype.dateToText = function(date, displayDate)
		{ return displayDate.getUTCHours(); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_Format24Hour2(placeholderString)
{
	if (typeof(FC_Format24Hour2.prototype.dateToText) == "undefined")
	{
		FC_Format24Hour2.prototype.dateToText = function (date, displayDate)
		{ return fc_gUtils.asTwoDigit(displayDate.getUTCHours()); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatMins(placeholderString)
{
	if (typeof(FC_FormatMins.prototype.dateToText) == "undefined")
	{
		FC_FormatMins.prototype.dateToText = function (date, displayDate)
		{ return fc_gUtils.asTwoDigit(displayDate.getUTCMinutes()); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatSecs(placeholderString)
{
	if (typeof(FC_FormatSecs.prototype.dateToText) == "undefined")
	{
		FC_FormatSecs.prototype.dateToText = function (date, displayDate)
		{ return fc_gUtils.asTwoDigit(displayDate.getUTCSeconds()); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatAmLower(placeholderString, amLower, pmLower)
{
	if (typeof(FC_FormatAmLower.prototype.dateToText) == "undefined")
	{
		FC_FormatAmLower.prototype.dateToText = function (date, displayDate)
		{ return displayDate.getUTCHours() < 12 ? this.amlower : this.pmlower; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
	this.amlower = amLower;
	this.pmlower = pmLower;
}

// ====================================================================================
function FC_FormatAmUpper(placeholderString, amUpper, pmUpper)
{
	if (typeof(FC_FormatAmUpper.prototype.dateToText) == "undefined")
	{
		FC_FormatAmUpper.prototype.dateToText = function (date, displayDate)
		{ return displayDate.getUTCHours() < 12 ? this.amupper : this.pmupper; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
	this.amupper = amUpper;
	this.pmupper = pmUpper;
}	

// ====================================================================================
function FC_FormatYear4(placeholderString)
{
	if (typeof(FC_FormatYear4.prototype.dateToText) == "undefined")
	{
		FC_FormatYear4.prototype.dateToText = function (date, displayDate)
		{ return displayDate.getUTCFullYear(); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatYear2(placeholderString)
{
	if (typeof(FC_FormatYear2.prototype.dateToText) == "undefined")
	{
		FC_FormatYear2.prototype.dateToText = function (date, displayDate)
		{ return displayDate.getUTCFullYear().toString().substr(2, 2); }
	}		
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatMonthNum1(placeholderString)
{
	if (typeof(FC_FormatMonthNum1.prototype.dateToText) == "undefined")
	{
		FC_FormatMonthNum1.prototype.dateToText = function (date, displayDate)
		{ return displayDate.getUTCMonth() + 1; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatMonthNum2(placeholderString)
{
	if (typeof(FC_FormatMonthNum2.prototype.dateToText) == "undefined")
	{
		FC_FormatMonthNum2.prototype.dateToText = function (date, displayDate)
		{ return fc_gUtils.asTwoDigit(displayDate.getUTCMonth() + 1); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatMonthNameLong(placeholderString, monthNameLongArray)
{
	if (typeof(FC_FormatMonthNameLong.prototype.dateToText) == "undefined")
	{
		FC_FormatMonthNameLong.prototype.dateToText = function (date, displayDate)
		{ return this.monthNameLongArray[displayDate.getUTCMonth()]; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
	this.monthNameLongArray = monthNameLongArray;
}

// ====================================================================================
function FC_FormatMonthNameShort(placeholderString, monthNameShortArray)
{
	if (typeof(FC_FormatMonthNameShort.prototype.dateToText) == "undefined")
	{
		FC_FormatMonthNameShort.prototype.dateToText = function (date, displayDate)
		{ return this.monthNameShortArray[displayDate.getUTCMonth()]; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
	this.monthNameShortArray = monthNameShortArray;
}

// ====================================================================================
function FC_FormatDayNum1(placeholderString)
{
	if (typeof(FC_FormatDayNum1.prototype.dateToText) == "undefined")
	{
		FC_FormatDayNum1.prototype.dateToText = function (date, displayDate)
		{ return displayDate.getUTCDate(); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatDayNum2(placeholderString)
{
	if (typeof(FC_FormatDayNum2.prototype.dateToText) == "undefined")
	{
		FC_FormatDayNum2.prototype.dateToText = function (date, displayDate)
		{ return fc_gUtils.asTwoDigit(displayDate.getUTCDate()); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatDayNameLong(placeholderString, dayNameLongArray)
{
	if (typeof(FC_FormatDayNameLong.prototype.dateToText) == "undefined")
	{
		FC_FormatDayNameLong.prototype.dateToText = function (date, displayDate)
		{ return this.dayNameLongArray[displayDate.getUTCDay()]; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
	this.dayNameLongArray = dayNameLongArray;	
}

// ====================================================================================
function FC_FormatDayNameShort(placeholderString, dayNameShortArray)
{
	if (typeof(FC_FormatDayNameShort.prototype.dateToText) == "undefined")
	{
		FC_FormatDayNameShort.prototype.dateToText = function (date, displayDate)
		{ return this.dayNameShortArray[displayDate.getUTCDay()]; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
	this.dayNameShortArray = dayNameShortArray;
}

// ====================================================================================
function FC_FormatDayOrdinal(placeholderString, dayOrdinalArray)
{
	if (typeof(FC_FormatDayOrdinal.prototype.dateToText) == "undefined")
	{
		FC_FormatDayOrdinal.prototype.dateToText = function (date, displayDate)
		{ return this.dayOrdinalArray[displayDate.getUTCDate() - 1]; }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
	this.dayOrdinalArray = dayOrdinalArray;
}

// ====================================================================================
function FC_FormatDayOfYear(placeholderString)
{
	if (typeof(FC_FormatDayOfYear.prototype.dateToText) == "undefined")
	{
		FC_FormatDayOfYear.prototype.dateToText = function (date, displayDate)
		{ return FC_getDayOfYear(displayDate); }
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatDayOfYear3(placeholderString)
{
	if (typeof(FC_FormatDayOfYear3.prototype.dateToText) == "undefined")
	{
		FC_FormatDayOfYear3.prototype.dateToText = function (date, displayDate)
		{
			var doy = FC_getDayOfYear(displayDate);
			
			if (doy < 10)
				doy = "00" + doy;
			else if (doy < 100)
				doy = "0" + doy;
			
			return doy;
		}
	}
	
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatLocation(placeholderString, defaultLocation)
{
	if (typeof(FC_FormatLocation.prototype.dateToText) == "undefined")
	{
		FC_FormatLocation.prototype.dateToText = function (date, displayDate, location)
		{ if (location) return location.name; else return this.defaultLocation; }
	}
	
	this.defaultLocation = defaultLocation;
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatOffset(placeholderString, defaultOffset)
{
	if (typeof(FC_FormatOffset.prototype.dateToText) == "undefined")
	{
		FC_FormatOffset.prototype.dateToText = function (date, displayDate, location)
		{ if (location) return location.zone.currOffsetString(date); else return this.defaultOffset; }
	}

	this.defaultOffset = defaultOffset;
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatZoneName(placeholderString, defaultZoneName)
{
	if (typeof(FC_FormatZoneName.prototype.dateToText) == "undefined")
	{
		FC_FormatZoneName.prototype.dateToText = function (date, displayDate, location)
		{ if (location) return location.zone.currName(date); else return this.defaultZoneName; }
	}
	
	this.defaultZoneName = defaultZoneName;
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatDSTIndicator(placeholderString, defaultDSTIndicator)
{
	if (typeof(FC_FormatDSTIndicator.prototype.dateToText) == "undefined")
	{
		FC_FormatDSTIndicator.prototype.dateToText = function (date, displayDate, location)
		{ if (location) return (location.zone.isDST(date) ? "*" : ""); else return this.defaultDSTIndicator; }
	}
	
	this.defaultDSTIndicator = defaultDSTIndicator;
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}

// ====================================================================================
function FC_FormatAlignmentPosition(placeholderString, defaultAlignmentPosition)
{
	if (typeof(FC_FormatAlignmentPosition.prototype.dateToText) == "undefined")
	{
		FC_FormatAlignmentPosition.prototype.dateToText = function (date, displayDate, location)
		{ return location ? this.alignmentChar : this.defaultAlignmentPosition; }
	}
	
	this.alignmentChar = "\t";
	this.defaultAlignmentPosition = defaultAlignmentPosition;
	this.placeholderRegexp = new RegExp(placeholderString, "g");
}