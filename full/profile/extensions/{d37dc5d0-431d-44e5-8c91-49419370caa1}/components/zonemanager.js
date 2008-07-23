// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// AFM - from http://forums.mozillazine.org/viewtopic.php?t=308369

// ====================================================================================
const CI = Components.interfaces, CC = Components.classes, CR = Components.results;
const FC_DEGREE_SYMBOL = "\u00b0";
const FC_MINUS_SYMBOL = "\u2212"; // AFM - prefer to hyphen-minus

// ====================================================================================
function FoxClocks_Zone(zoneNode)
{
	this.country_code = null;
	this.comments = null;
	this.comments_lang = null;
	this.dl_to_string = "";
	this.dl_name = "";
	this.dl_to = "";
	this.dl_start_gmt = null;
	this.dl_end_gmt = null;
	this.alias_for = null;
	this.deprecated = false;
	this.locdName = "TODO";
	
	// AFM - no error checking - will throw
	//
	
	var utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;	
	this.id = zoneNode.getAttribute("id");

	var deprecatedAtt = zoneNode.getAttribute("deprecated");
	this.deprecated = deprecatedAtt != null && deprecatedAtt == "true";
	
	var countryNode = utils.getFirstEltByTagAsNode(zoneNode, "Country");
	if (countryNode != null)
		this.country_code = countryNode.getAttribute("code");
	
	var commentsNode = utils.getFirstEltByTagAsNode(zoneNode, "Comments");
	if (commentsNode != null)
	{
		this.comments = commentsNode.firstChild.nodeValue;
		this.comments_lang = commentsNode.getAttribute("lang");
	}
	
	var aliasForNode = utils.getFirstEltByTagAsNode(zoneNode, "AliasFor");
	if (aliasForNode != null)
		this.alias_for = aliasForNode.firstChild.nodeValue;

	var standardNode = utils.getFirstEltByTagAsNode(zoneNode, "StandardTime");
	
	this.st_to_string = standardNode.getAttribute("offset").replace(/^-/, FC_MINUS_SYMBOL);
	this.st_name = standardNode.getAttribute("tzname");
		
	this.st_to = FoxClocks_Zone.timeZoneStringToMinOffset(this.st_to_string);
	
	var daylightNodes = zoneNode.getElementsByTagName("DaylightTime");
	if (daylightNodes.length == 1)
	{
		var daylightNode = daylightNodes.item(0);
		daylightNode.QueryInterface(CI.nsIDOMElement);
		
		this.dl_to_string = daylightNode.getAttribute("offset").replace(/^-/, FC_MINUS_SYMBOL);
		this.dl_name = daylightNode.getAttribute("tzname");
		var startTime = utils.getFirstEltByTagAsNode(daylightNode, "Start").firstChild.nodeValue;
		var endTime = utils.getFirstEltByTagAsNode(daylightNode, "End").firstChild.nodeValue;
		
		this.dl_to = FoxClocks_Zone.timeZoneStringToMinOffset(this.dl_to_string);
		this.dl_start_gmt = FoxClocks_Zone.dateStringToGmtDate(startTime);
		this.dl_end_gmt = FoxClocks_Zone.dateStringToGmtDate(endTime);
	}
	
	// AFM - lat and long - convert e.g. +0522200 to 52.366667 - no rounding
	//
	var def_latitude = null;
	var def_longitude = null;
	
	var coordsNodes = zoneNode.getElementsByTagName("Coordinates");
	if (coordsNodes.length == 1)
	{
		var coordsNode = coordsNodes.item(0);
		coordsNode.QueryInterface(CI.nsIDOMElement);
		
		var latString = coordsNode.getAttribute("latitude");
		var longString = coordsNode.getAttribute("longitude");
	
		def_latitude = Number(latString.substr(1, 3)) + Number(latString.substr(4, 2))/60 + Number(latString.substr(6, 2))/3600;
		if (latString[0] == "-") def_latitude = -1 * def_latitude;
	
		def_longitude = Number(longString.substr(1, 3)) + Number(longString.substr(4, 2))/60 + Number(longString.substr(6, 2))/3600;
		if (longString[0] == "-") def_longitude = -1 * def_longitude;
		
		/*
		if (latString == "+0353916")
		{
			var logService = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
			logService.log("-FoxClocks_Zone::FoxClocks_Zone(): zone id <" + this.id + ">: " + def_latitude);
		}
		*/
	}
	
	this.defaultLocation = new FoxClocks_Location(null, null, def_latitude, def_longitude);
}

// ====================================================================================
FoxClocks_Zone.prototype = 
{	
	// ====================================================================================
	currName : function(date)
	{
		return this.isDST(date) ? this.dl_name : this.st_name;
	},
	
	// ====================================================================================
	currOffsetString : function(date)
	{
		return this.isDST(date) ? this.dl_to_string: this.st_to_string;
	},
	
	// ====================================================================================
	currDisplayDate : function(date)
	{
		var offsetMillis = null;
		
		if (this.st_to != null)
			offsetMillis = (this.isDST(date) ? this.dl_to: this.st_to)*1000*60;
		else
			offsetMillis = -1 * date.getTimezoneOffset()*1000*60; // local time
	
		// AFM - critical to understand that this date is for display ONLY. Basically you should
		// be looking at getUTCHours() etc ONLY
		//
		return new Date(date.getTime() + offsetMillis);
	},
	
	// ====================================================================================
	isDST : function(date)
	{
		// AFM - note that the the DST start date is considered standard;
		// the DST end date is considered dst. Note that Date.getTimezoneOffset()
		// considers DST start to be dst. Basically don't use isDST() and Date.getTimezoneOffset() together...
		//	
		if (this.dl_start_gmt == null || this.dl_end_gmt == null)
			return false;
		else if (this.dl_start_gmt < this.dl_end_gmt)
			return (this.dl_start_gmt < date && date <= this.dl_end_gmt);
		else // southern hemisphere
			return !(this.dl_end_gmt < date && date <= this.dl_start_gmt);
	},
	
	// ====================================================================================
	getFlagUrl : function()
	{			
		return this.country_code != null ? "chrome://foxclocks/skin/flags/" + this.country_code.toLowerCase() + ".png" : "";
	}
}
	
// ====================================================================================
FoxClocks_Zone.dateStringToGmtDate = function(dateString)
{
	// AFM - static utility function. No regexp for expected string...
	// dateString eg: 2009-10-21T02:30:00-05:00
	//
	if (dateString == "")
		return null;
			
	var zoneMinOffset = FoxClocks_Zone.timeZoneStringToMinOffset(dateString.substr(19, 5));
	
	var dateTimeArray = dateString.split("T");
	var datePart = dateTimeArray[0];
			
	var date = new Date();
	date.setUTCFullYear(datePart.substr(0, 4), datePart.substr(5, 2) - 1, datePart.substr(8, 2));
		
	if (dateTimeArray.length == 2)
	{	
		var timePart = dateTimeArray[1];
		date.setUTCHours(timePart.substr(0, 2), timePart.substr(3, 2) - zoneMinOffset, timePart.substr(6, 2));
	}
	else
	{
		date.setUTCHours(0, -1 * zoneMinOffset, 0);
	}
		
	return date;
}

// ====================================================================================
FoxClocks_Zone.timeZoneStringToMinOffset = function(timeZoneString)
{					
	// AFM - convert e.g. timeZoneString +01:00 to +60 - static utility funtion
		
	var zoneMinOffset = 60 * Number(timeZoneString.substr(1, 2)) + Number(timeZoneString.substr(4, 2));
	if (timeZoneString.substr(0, 1) != '+')
		zoneMinOffset = -1 * zoneMinOffset;
		
	return zoneMinOffset;
}

// ====================================================================================
// FoxClocks_Location
// ====================================================================================
function FoxClocks_Location(zone, name, lat, lng)
{
	this.zone = zone;
	this.name = name;
	
	this._latitude = null;
	this._lat_degs = 0;
	this._lat_mins = 0;
	this._lat_secs = 0;
	
	this._longitude = null;
	this._long_degs = 0;
	this._long_mins = 0;
	this._long_secs = 0;
		
	this.setLatitude(lat);
	this.setLongitude(lng);
}

// ====================================================================================
FoxClocks_Location.northAsLocaleString = null;
FoxClocks_Location.southAsLocaleString = null;
FoxClocks_Location.eastAsLocaleString = null;
FoxClocks_Location.westAsLocaleString = null;

// ====================================================================================
FoxClocks_Location.prototype =
{
	// ====================================================================================
	getLatitude : function() { return this._latitude; },
	getLongitude : function() { return this._longitude; },
		
	// ====================================================================================
	setLatitude : function(lat)
	{
		// AFM - decimal degrees - 5dp - covers seconds
		//
		// AFM - weak typing: emptyString == 0 is true, and zero == "" is true. lat, lng
		// are sometimes strings, sometimes numbers
		//
		if (lat != null && ((typeof(lat) == "string" && lat != "") || typeof(lat) == "number"))
		{
			this._latitude = Math.round(lat*100000)/100000;
			
			var absLat = Math.abs(this._latitude);
			
			this._lat_degs = Math.floor(absLat);
			this._lat_mins = Math.floor(60 * (absLat - this._lat_degs));
			this._lat_secs = Math.round(3600 * (absLat - this._lat_degs - this._lat_mins/60));
			
			// AFM - may round up to 60
			//
			if (this._lat_secs == 60)
			{
				this._lat_mins++;
				this._lat_secs = 0;
			}	
		}
		else
		{
			this._latitude = null;
			this._lat_degs = 0;
			this._lat_mins = 0;
			this._lat_secs = 0;
		}
		
		/*
		if (this.zone.id == "Africa/Dakar")
		{
			var logService = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
			logService.log("FoxClocks_Location::setLatitude(): deg " + this._lat_degs + " min " + this._lat_mins +
				" sec " + this._lat_secs);
		}
		*/				
	},

	// ====================================================================================
	setLongitude : function(lng)
	{
		if (lng != null && ((typeof(lng) == "string" && lng != "") || typeof(lng) == "number"))
		{
			this._longitude = Math.round(lng*100000)/100000;

			var absLong = Math.abs(this._longitude);
			
			this._long_degs = Math.floor(absLong);
			this._long_mins = Math.floor(60 * (absLong - this._long_degs));
			this._long_secs = Math.round(3600 * (absLong - this._long_degs - this._long_mins/60));
			
			// AFM - may round up to 60
			//
			if (this._long_secs == 60)
			{
				this._long_mins++;
				this._long_secs = 0;
			}	
		}
		else
		{
			this._longitude = null;
			this._long_degs = 0;
			this._long_mins = 0;
			this._long_secs = 0;
		}
		
		/*
		if (this.zone.id == "Africa/Dakar")
		{
			var logService = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
			logService.log("FoxClocks_Location::setLongitude(): deg " + this._long_degs + " min " + this._long_mins +
				" sec " + this._long_secs);
		}
		*/	
	},
	
	// ====================================================================================
	latitudeAsLocaleString : function()
	{
		// AFM - convert e.g. 52.367 to 52{deg. symbol}22' North. Not displaying seconds - ugly
		//
		var latitudeAsString = "";
		if (this._latitude != null)
		{
			var utilsService = CC["@stemhaus.com/firefox/foxclocks/utils;1"]
				.getService(CI.nsISupports).wrappedJSObject;
							
			latitudeAsString = this.latitudeDegrees() + FC_DEGREE_SYMBOL + utilsService.asTwoDigit(this.latitudeMins()) + "'";
			// latitudeAsString += utilsService.asTwoDigit(this.latitudeSecs()) + '"';
			latitudeAsString += " " + (this.latitudeIsNorth() ? FoxClocks_Location.northAsLocaleString : FoxClocks_Location.southAsLocaleString);
		}
		
		return latitudeAsString;
	},

	// ====================================================================================
	longitudeAsLocaleString : function()
	{
		// AFM - convert e.g. -52.367 to 52{deg. symbol}22' West. Not displaying seconds - ugly
		//
		var longitudeAsString = "";
		if (this._longitude != null)
		{
			var utilsService = CC["@stemhaus.com/firefox/foxclocks/utils;1"]
				.getService(CI.nsISupports).wrappedJSObject;
				
			longitudeAsString = this.longitudeDegrees() + FC_DEGREE_SYMBOL + utilsService.asTwoDigit(this.longitudeMins()) + "'";
			// longitudeAsString += utilsService.asTwoDigit(this.longitudeSecs()) + '"';
			longitudeAsString += " " + (this.longitudeIsEast() ? FoxClocks_Location.eastAsLocaleString : FoxClocks_Location.westAsLocaleString);
		}
		
		return longitudeAsString;
	},
	
	// ====================================================================================
	latitudeIsNorth : function() { return this._latitude != null && this._latitude >= 0; },
	latitudeDegrees : function() { return this._lat_degs; },
	latitudeMins : function() { return this._lat_mins; },
	latitudeSecs : function() { return this._lat_secs; },
	longitudeIsEast : function() { return this._longitude != null && this._longitude >= 0; },
	longitudeDegrees : function() { return this._long_degs; },
	longitudeMins : function() { return this._long_mins; },
	longitudeSecs : function() { return this._long_secs; }
}

// ====================================================================================
// FoxClocks_ZoneManager
// ====================================================================================
FoxClocks_ZoneManager.classID = Components.ID("3c184c60-5496-11db-8373-b622a1ef5492");
FoxClocks_ZoneManager.contractID = "@stemhaus.com/firefox/foxclocks/zonemanager;1";
FoxClocks_ZoneManager.classDescription = "FoxClocks Zone Manager Service";

// ====================================================================================
function FoxClocks_ZoneManager()
{
	this.componentStarted = false;

	this.zones = new Array();
	this.zonePickerLocationMap = new Array();
	this.zonePickerXmlDoc = null;
		
	this.dataSource = {id: null, name: null, date: null, version: null};
	this.logger = null;
}

// ====================================================================================
FoxClocks_ZoneManager.prototype =
{	
	// ====================================================================================
	startup: function()
	{
		this.logger = CC["@stemhaus.com/firefox/foxclocks/logger;1"].getService(CI.nsISupports).wrappedJSObject;
		
		// AFM - empty zone picker
		//
		var utils = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;
		this.zonePickerXmlDoc = utils.getDOMImpl().createDocument(utils.FC_URI_ZONEPICKER_NAMESPACE,
			"zonepicker", null);
				
		// AFM - a bit rubbish
		//
 		var stringBundleService = CC["@mozilla.org/intl/stringbundle;1"].getService(CI.nsIStringBundleService);
		var hFoxClocksBundle = stringBundleService.createBundle("chrome://foxclocks/locale/foxclocks.properties");
	
		FoxClocks_Location.northAsLocaleString = hFoxClocksBundle.GetStringFromName("misc.north");
		FoxClocks_Location.southAsLocaleString = hFoxClocksBundle.GetStringFromName("misc.south");
		FoxClocks_Location.eastAsLocaleString = hFoxClocksBundle.GetStringFromName("misc.east");
		FoxClocks_Location.westAsLocaleString = hFoxClocksBundle.GetStringFromName("misc.west");
		
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
	initZoneData: function(initUrl)
	{
		this.logger.log("+FoxClocks_ZoneManager::initZoneData(): initUrl is " + initUrl);
		
		var utilsService = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;
		var doc = utilsService.getXmlFromUrl(initUrl);
		
		if (doc == null)
		{
			this.logger.log("FoxClocks_ZoneManager::initZoneData(): cannot init zone data from <" + initUrl + ">", this.logger.ERROR);
			return false;
		}
		
		var root = doc.documentElement;

		try
		{						
			var sourceNode = utilsService.getFirstEltByTagAsNode(root, "Source");
			var sourceId = sourceNode.getAttribute("id");
			var sourceName = sourceNode.getAttribute("name");
			var sourceVersion = utilsService.getFirstEltByTagAsNode(sourceNode, "Version").firstChild.nodeValue;
			var sourceDate = utilsService.getFirstEltByTagAsNode(sourceNode, "Date").firstChild.nodeValue;
			
			this.dataSource.id = sourceId;
			this.dataSource.name = sourceName;
			this.dataSource.version = sourceVersion;
			this.dataSource.date = sourceDate;
		}
		catch (ex)
		{
			this.logger.log("FoxClocks_ZoneManager::initZoneData(): error reading XML Source data: " +
				ex, this.logger.ERROR);
				
			return false;
		}
		
		this.zones = new Array();
		
		// AFM - commented out for now - see comments below
		//
		// var nonCanonicalZones = new Array(); // map of non-canon to canon
		var zoneNodes = root.getElementsByTagName("Zone");
		
		for (var i=0; i < zoneNodes.length; i++)
		{
			var zoneNode = zoneNodes.item(i);
			zoneNode.QueryInterface(CI.nsIDOMElement);
		
			try
			{
				// AFM - hmmm. tz does a 'Link' for two reasons: to rename zones (eg Africa/Asmera->
				// Africa->Asmara, Europe/Belfast->Europe/London) in 'backward' and to set
				// one zone's rules to match another's (eg Arctic/Longyearbyen-> Europe/Oslo). Alias stuff
				// commented out: lose info for 'rule-mapping' cases and in fact wouldn't want Belfast lat/long
				// to be set to London's
				//
				// var aliasForNode = utilsService.getFirstEltByTagAsNode(zoneNode, "AliasFor");						
				// if (aliasForNode == null)
				// {
					var zone = new FoxClocks_Zone(zoneNode);
					this.zones[zone.id] = zone;
				// }
				// else
				// {
				//	var aliasFor = aliasForNode.firstChild.nodeValue;
				//	nonCanonicalZones[zoneNode.getAttribute("id")] = aliasFor;
				// }
			}
			catch (ex)
			{
				this.logger.log("FoxClocks_ZoneManager::initZoneData(): error creating zone from DOM: " +
					ex, this.logger.ERROR);
			}
		}
		
		// AFM - point non-canonical ids to canonical zones. Commented out for now - see comments above
		//
		// for (var j in nonCanonicalZones)
		// {					
		// 	this.zones[j] = this.zones[nonCanonicalZones[j]]; 
		// }
		
		return true;
	},
	
	// ====================================================================================
	initZonePicker: function(initUrl)
	{
		this.logger.log("+FoxClocks_ZoneManager::initZonePicker(): initUrl is " + initUrl);
	
		var utilsService = CC["@stemhaus.com/firefox/foxclocks/utils;1"].getService(CI.nsISupports).wrappedJSObject;
		var doc = utilsService.getXmlFromUrl(initUrl);
		
		if (doc == null)
		{
			this.logger.log("FoxClocks_ZoneManager::initZoneData(): cannot init zone data from <" + initUrl + ">", this.logger.ERROR);
			return false;
		}
		
		var root = doc.documentElement;
			
		if (root.namespaceURI != utilsService.FC_URI_ZONEPICKER_NAMESPACE || root.localName != "zonepicker")
		{
			this.logger.log("FoxClocks_ZoneManager::initZonePicker(): url <" +
				initUrl + "> is not a valid FoxClocks ZonePicker file", this.logger.ERROR);
			return false;
		}
			
		this.zonePickerXmlDoc = doc;
		this.zonePickerLocationMap = new Array();
				
		var zpLeafNodes = root.getElementsByTagName("Leaf");
		var goodLeafNodeId = 0;
		
		for (var i=0; i < zpLeafNodes.length; i++)
		{
			var zpLeafNode = zpLeafNodes.item(i);
			zpLeafNode.QueryInterface(CI.nsIDOMElement);
			
			zpLeafNode.removeAttribute("leaf_id"); // AFM - shouldn't be there, but one never knows
			var zpZoneId = zpLeafNode.getAttribute("zone_id");
			var zpName = zpLeafNode.getAttribute("name");
			var zpLatitude = null;
			var zpLongitude = null;
			
			var zpCoordsNodes = zpLeafNode.getElementsByTagName("Coordinates");
			if (zpCoordsNodes.length == 1)
			{
				var zpCoordsNode = zpCoordsNodes.item(0);
				zpCoordsNode.QueryInterface(CI.nsIDOMElement);
				
				zpLatitude = zpCoordsNode.getAttribute("latitude");
				zpLongitude = zpCoordsNode.getAttribute("longitude");
			}		
					
			if (zpZoneId == null || zpName == null || zpCoordsNodes.length > 1 ||
				(zpCoordsNodes.length == 1 && (zpLatitude == null || zpLongitude == null)))
			{
				this.logger.log("FoxClocks_ZoneManager::initZonePicker(): cannot generate zone picker item with zone id <" +
					zpZoneId + ">, name <" + zpName + ">: bad locale data - skipping", this.logger.ERROR);

				continue;
			}
								
			var zpZone = this.zones[zpZoneId];
			
			if (zpZone == null)
			{
				this.logger.log("FoxClocks_ZoneManager::initZonePicker(): cannot generate zone picker item with zone id <" +
					zpZoneId + ">: not in database - skipping", this.logger.ERROR);

				continue;
			}
	
			if (zpZone.deprecated == true)
			{
				// AFM - warning, but log at debug to avoid scaring people
				//
				this.logger.log("FoxClocks_ZoneManager::initZonePicker(): WARNING: zone id <" +
					zpZoneId + "> is deprecated (no location data) - use <" + zpZone.alias_for + ">");
			}
			
			zpLeafNode.setAttribute("leaf_id", goodLeafNodeId);
					
			var zpLat = zpLatitude != null ? zpLatitude : zpZone.defaultLocation.getLatitude();
			var zpLong = zpLongitude != null ? zpLongitude : zpZone.defaultLocation.getLongitude();	
		
			// AFM - TODO  if we don't have a lat/long, we shouldn't just copy in the default location's lat/long,
			// since we don't pick up updates to it. Not changing right now b/c this is a house of cards
			//
			var zpLocation = new FoxClocks_Location(zpZone, zpName, zpLat, zpLong);
			this.zonePickerLocationMap.push(zpLocation);
			
			// AFM - we need a localised default location name
			// (we already have def. lat and long). We derive as first location in ZP
			//
			if (zpZone.defaultLocation.name == null)	
				zpZone.defaultLocation.name = zpLocation.name;
				
			goodLeafNodeId++;
		}
		
		this.logger.log("-FoxClocks_ZoneManager::initZonePicker()");
		return true;
	},
	
	// ====================================================================================
	getZones: function() { return this.zones; },
	getZonePickerLocationMap: function() { return this.zonePickerLocationMap; },
	getZonePickerXmlDoc: function() { return this.zonePickerXmlDoc; },
	createLocation: function(zone, locationName, lat, lng) 
		{ return new FoxClocks_Location(zone, locationName, lat, lng); },
				
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
	get contractID() { return FoxClocks_ZoneManager.contractID; },
	get classID() { return FoxClocks_ZoneManager.classID; },
	get classDescription() { return FoxClocks_ZoneManager.classDescription; },
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
var gXpComObjects = [FoxClocks_ZoneManager];
var gCatObserverName = FoxClocks_ZoneManager.classDescription; // can be anything
var gCatContractID = FoxClocks_ZoneManager.contractID;

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