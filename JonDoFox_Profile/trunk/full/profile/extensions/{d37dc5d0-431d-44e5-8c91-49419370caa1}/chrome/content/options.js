// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// ====================================================================================
function FoxClocks_OptionsManager()
{
	this.exampleDate = new Date();
	
	this.standardMenuList = null;
	this.customFormatBox = null;
	this.whichBarRadioGroup = null;
	this.statusbarPosnRadioGroup = null;
	this.statusbarSpecPosnTextbox = null;
	this.hTimer = null;
}

// ====================================================================================
FoxClocks_OptionsManager.prototype =
{
	// ====================================================================================
	onLoad : function()
	{
		fc_gLogger.log("+FoxClocks_OptionsManager::onLoad()");
	
		// AFM - missing locale strings
		//
		if (document.getElementById("fc-advanced-newloc-caption").getAttribute("label") == "")
			document.getElementById("fc-advanced-tab").setAttribute("collapsed", "true");
		
		// AFM - start, populate dropdowns based on translations we may not have
		//
		var dstMenuitem = document.getElementById("fc-format-custom-other-dstindic-menuitem");
		try
		{
			var dstIndicLabel = document.getElementById("foxclocks-bundle").getString("options.format.custom.other.dstindic.label");
			dstMenuitem.setAttribute("label", dstIndicLabel);
			dstMenuitem.hidden = false;
		}
		catch (ex) { fc_gLogger.log("FoxClocks_OptionsManager::onLoad(): DST indicator menuitem hidden - no locale string"); }
		
		var alignPosMenuitem = document.getElementById("fc-format-custom-other-alignpos-menuitem");
		try
		{
			var alignPosLabel = document.getElementById("foxclocks-bundle").getString("options.format.custom.other.alignpos.label");
			alignPosMenuitem.setAttribute("label", alignPosLabel);
			alignPosMenuitem.hidden = false;
		}
		catch (ex)
		{
			// AFM - don't respond to hiding/unhiding this item when configuring the tooltip
			//
			alignPosMenuitem.removeAttribute("observes");
			fc_gLogger.log("FoxClocks_OptionsManager::onLoad(): Tooltip alignment menuitem hidden - no locale string");
		}
		
		var dayOfYear3MenuItem = document.getElementById("fc-format-custom-day-ofyear-3-menuitem");
		try
		{
			var dayOfYear3Label = document.getElementById("foxclocks-bundle").getString("options.format.custom.day.ofyear.3.label");
			dayOfYear3MenuItem.setAttribute("label", dayOfYear3Label);
			dayOfYear3MenuItem.hidden = false;
		}
		catch (ex) { fc_gLogger.log("FoxClocks_OptionsManager::onLoad(): Day of year, 3-digit menuitem hidden - no locale string"); }
		//
		// AFM - end
		
		// AFM - data members
		//		
		this.standardMenuList = document.getElementById("fc-format-standard-list");
		this.customFormatBox = document.getElementById("fc-format-custom-textbox-input");
		this.whichBarRadioGroup = document.getElementById("fc-clock-position-radiogroup");
		this.statusbarPosnRadioGroup = document.getElementById("fc-clock-position-statusbar-radiogroup");
		this.whichFormatRadioGroup = document.getElementById("fc-format-radiogroup");
		this.statusbarSpecPosnTextbox = document.getElementById("fc-clock-position-statusbar-specific-textbox");						

		fc_gPrefManager.addPrefObserver("foxclocks.", this);
		fc_gObserverService.addObserver(this, "foxclocks", false);

		// AFM - workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=256024
		//
		var tabBox = document.getElementById("fc-options-tabbox");
		tabBox.selectedIndex = tabBox.getAttribute("selectedtabworkaround");
		
		// AFM - so we don't need another param just to keep the textbox value around, whether or not it's in use
		//
		this.statusbarSpecPosnTextbox.value = this.statusbarSpecPosnTextbox.getAttribute("storedvalue");
		
		this.setupGUIfromPrefs();
		this.setZoneDataDetails();
		
		// AFM - top dropdown is focused otherwise - doesn't look nice
		//
		document.documentElement.getButton("accept").focus();
			
		this.onTimer();
		this.hTimer = window.setInterval(this.onTimer, fc_gUtils.FC_CLOCK_UPDATE_INTERVAL, this);
		
		fc_gLogger.log("-FoxClocks_OptionsManager::onLoad()");
	},	
	
	// ====================================================================================
	onUnload : function()
	{
		// AFM - workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=256024
		//
		var tabBox = document.getElementById("fc-options-tabbox");
		tabBox.setAttribute("selectedtabworkaround", tabBox.selectedIndex);
		
		fc_gPrefManager.removePrefObserver("foxclocks.", this);
		fc_gObserverService.removeObserver(this, "foxclocks");
		window.clearInterval(this.hTimer);
	},
	
	// ====================================================================================
	onTimer : function()
	{
		var timeFormatter = Components.classes["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
					.getService(Components.interfaces.nsISupports).wrappedJSObject;

		var formatString = document.getElementById("foxclocks-bundle").getString("options.data.gmt.format");
		var currentTimeString = timeFormatter.getUTCTimeStringFromFormat(new Date(), formatString);	
		
		document.getElementById("fc-data-gmt-label").setAttribute("value", currentTimeString);
	},
		
	// ====================================================================================
	setupGUIfromPrefs : function()
	{
		// AFM - note that this will only be called from external pref changes; we disable
		// pref notifications in onAccept()
		//
		fc_gLogger.log("+FoxClocks_OptionsManager::setupGUIfromPrefs()");
														
		var specificHidden = fc_gPrefManager.getPref("foxclocks.clock.position.specific.hidden") == true ? "true" : "false";
		document.getElementById("fc-clock-position-statusbar-radio-specific-hbox").setAttribute("hidden", specificHidden);
					
		// AFM - position and style stuff
		//
		var clockContainerType = fc_gPrefManager.getPref("foxclocks.clock.containertype");
		this.whichBarRadioGroup.selectedIndex = (clockContainerType == "fc-clock-containertype-toolbar" ? 1 : 0);	
				
		var statusbarPosnRelative = fc_gPrefManager.getPref("foxclocks.clock.position.relative");
		var statusbarPosnRadioGroupIndex = null;
		
		if (statusbarPosnRelative == "fc-clock-position-left")
			statusbarPosnRadioGroupIndex = 0;
		else if (statusbarPosnRelative == "fc-clock-position-right")
			statusbarPosnRadioGroupIndex = 1;
		else
		{
			statusbarPosnRadioGroupIndex = 2;
			this.statusbarSpecPosnTextbox.value = statusbarPosnRelative;
		}
		
		this.statusbarPosnRadioGroup.selectedIndex = statusbarPosnRadioGroupIndex;

		var clockStyle = fc_gPrefManager.getPref("foxclocks.clock.style");
		document.getElementById("fc-clock-style-radiogroup").selectedIndex = (clockStyle == "fc-clock-style-icon" ? 1 : 0);
		
		// AFM - not triggered by the above
		//
		this.onClockChoiceSelect();

		// AFM - data tab
		//
		var autoUpdateEnabled = fc_gPrefManager.getPref("foxclocks.data.update.auto.enabled");
		document.getElementById("fc-data-update-auto-enable-checkbox").checked = autoUpdateEnabled;
		
		// AFM - not triggered by the above
		//
		this.onDataUpdateAutoCheckbox()	

		// AFM - advanced tab
		//	
		var advCheckboxes = document.getElementById("fc-advanced-tabpanel").getElementsByTagName("checkbox");
		for (var i = 0; i < advCheckboxes.length; i++)
		{
			var currCheckbox = advCheckboxes[i];
			var currCheckboxId = currCheckbox.getAttribute("id");
			var currCheckboxPref = currCheckbox.getAttribute("pref");
			
			if (currCheckboxId == null || currCheckboxId == '')
				currCheckbox.checked = fc_gPrefManager.getPref(currCheckboxPref);
			else if (currCheckboxId == "fc-advanced-toolbar-menuitem-hidden-checkbox")
				currCheckbox.checked = !fc_gPrefManager.getPref(currCheckboxPref);
			else if	(currCheckboxId == "fc-advanced-tooltip-flagvisible-checkbox")
				currCheckbox.checked = fc_gPrefManager.getPref(currCheckboxPref) == "fc-all-clocks";
		}
	
		fc_gLogger.log("-FoxClocks_OptionsManager::setupGUIfromPrefs()");
	},
	
	// ====================================================================================
	setZoneDataDetails : function()
	{
		// fc_gLogger.log("+FoxClocks_OptionsManager::setZoneDataDetails()");

		document.getElementById("fc-data-info-source-value").setAttribute("value", fc_gZoneManager.dataSource.name);
		document.getElementById("fc-data-info-version-value").setAttribute("value", fc_gZoneManager.dataSource.version);
		document.getElementById("fc-data-info-date-value").setAttribute("value", fc_gZoneManager.dataSource.date);
		
		var timeFormatter = Components.classes["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
				.getService(Components.interfaces.nsISupports).wrappedJSObject;
		var formatString = document.getElementById("foxclocks-bundle").getString("options.data.gmt.format");
		var lastUpdateElement = document.getElementById("fc-data-update-last-date-value");
		var lastUpdateResult = fc_gUpdateManager.lastUpdateResult;

		// AFM - last update date (getTime() is zero when no update checks have been run)
		//
		var hasLastUpdate = fc_gUpdateManager.lastUpdateDate != null && fc_gUpdateManager.lastUpdateDate.getTime() != 0;
		
		var lastUpdateDateText = hasLastUpdate ? 
			timeFormatter.getLocalTimeStringFromFormat(fc_gUpdateManager.lastUpdateDate, formatString) :
			lastUpdateElement.getAttribute("novalue");

		var lastUpdateServerTimeText = lastUpdateResult.server_time != null ?
			timeFormatter.getUTCTimeStringFromFormat(lastUpdateResult.server_time, formatString) : "";	

		var nextUpdateDateText = (fc_gUpdateManager.nextUpdateDate != null && fc_gUpdateManager.nextUpdateDate.getTime() != 0) ?
			timeFormatter.getLocalTimeStringFromFormat(fc_gUpdateManager.nextUpdateDate, formatString) : "";
			
		lastUpdateElement.setAttribute("value", lastUpdateDateText);
		lastUpdateElement.setAttribute("tooltiptext", lastUpdateServerTimeText);
		document.getElementById("fc-data-update-next-value").setAttribute("value", nextUpdateDateText);
		
		// AFM - last update status. Since we don't store the result of the last update check
		// as a param, lastUpdateResult.result will be OK_NONE on restart, so we persist the value of this label
		// If the lastUpdateDate param is reset, we go back to N/A. Actually, no we don't since we're not
		// observing that param...
		//
		if (lastUpdateResult != null && lastUpdateResult.result != null &&
			(lastUpdateResult.result == "OK_NO" || lastUpdateResult.result == "OK_NEW" || lastUpdateResult.result == "ERROR"))
		{
			var lastUpdateStatusText = document.getElementById("foxclocks-bundle").
				getString("options.data.update.last.status." + lastUpdateResult.result.toLowerCase() + ".label");
					
			document.getElementById("fc-data-update-last-status-value").setAttribute("value", lastUpdateStatusText);
		}
		else if (hasLastUpdate == false)
		{
			var noValue = document.getElementById("fc-data-update-last-status-value").getAttribute("novalue");
			document.getElementById("fc-data-update-last-status-value").setAttribute("value", noValue);
		}
		
		// AFM - (re-)enable checknow button, which may have been disabled during update
		//
		document.getElementById("fc-data-update-checknow-button").setAttribute("disabled", "false");
		
		// fc_gLogger.log("-FoxClocks_OptionsManager::setZoneDataDetails()");
	},

	// ====================================================================================
	onDataUpdateAutoCheckbox : function()
	{
		// AFM - show/hide the next update on toggling the 'enable auto updates' checkbox,
		// even before 'apply'. Need to call this in onLoad() toom so set the init hidden state
		//
		var autoUpdateEnabled = document.getElementById("fc-data-update-auto-enable-checkbox").checked;
		document.getElementById("fc-data-update-next-grid").hidden = !autoUpdateEnabled;
	},
	
	// ====================================================================================
	onDataUpdateCheckNow : function()
	{
		document.getElementById("fc-data-update-checknow-button").setAttribute("disabled", "true");
		fc_gUpdateManager.updateNow();
	},
	
	// ====================================================================================	
	onAccept : function()
	{
		fc_gLogger.log("+FoxClocks_OptionsManager::onAccept()");
		
		// AFM - disable pref observer for the duration of the accept - since the observer's
		// function is to setup the GUI based on pref changes elsewhere, and here we're setting prefs based on the GUI
		//
		fc_gPrefManager.removePrefObserver("foxclocks.", this);

		var standardFormat = this.whichFormatRadioGroup.selectedIndex == 0 ? this.standardMenuList.selectedItem.getAttribute("value") : "";
		var customFormat = this.customFormatBox.value;

		var clockChoiceList = document.getElementById("fc-format-clockchoice-list");
		var id = clockChoiceList.selectedItem.getAttribute("value");
		var formatParamRoot = "foxclocks.format." + id;	
		
		fc_gPrefManager.setPref(formatParamRoot + ".standard", standardFormat);
		fc_gPrefManager.setPref(formatParamRoot + ".custom", customFormat);
		
		var clockContainerType = this.whichBarRadioGroup.selectedIndex == 1 ? "fc-clock-containertype-toolbar" : "fc-clock-containertype-statusbar";	
		fc_gPrefManager.setPref("foxclocks.clock.containertype", clockContainerType);

		// AFM - so we don't need another param just to keep the value of the textbox value around, whether or not it's in use
		//
		this.statusbarSpecPosnTextbox.setAttribute("storedvalue", this.statusbarSpecPosnTextbox.value);
		
		var statusbarPosnRadioIndex = this.statusbarPosnRadioGroup.selectedIndex;
		var statusbarPosnRelativePref = null;
		
		if (statusbarPosnRadioIndex == 0)
			statusbarPosnRelativePref = "fc-clock-position-left";
		else if (statusbarPosnRadioIndex == 1)
			statusbarPosnRelativePref = "fc-clock-position-right";
		else
			statusbarPosnRelativePref = this.statusbarSpecPosnTextbox.value;
			
		fc_gPrefManager.setPref("foxclocks.clock.position.relative", statusbarPosnRelativePref);			
		
		var clockStyle = document.getElementById("fc-clock-style-radiogroup").selectedIndex == 1 ? "fc-clock-style-icon" : "fc-clock-style-clocks";	
		fc_gPrefManager.setPref("foxclocks.clock.style", clockStyle);
		
		var autoUpdateEnabled = document.getElementById("fc-data-update-auto-enable-checkbox").checked == true;
		fc_gPrefManager.setPref("foxclocks.data.update.auto.enabled", autoUpdateEnabled);
				
		// AFM - update zone data details on pref change driven by this window
		// This method is also called in observing an external pref change
		//
		this.setZoneDataDetails();

		// AFM - advanced tab. Don't touch the tooltip flagvisible pref if it's fc-per-clock for some reason
		//
		var advCheckboxes = document.getElementById("fc-advanced-tabpanel").getElementsByTagName("checkbox");
		for (var i = 0; i < advCheckboxes.length; i++)
		{
			var currCheckbox = advCheckboxes[i];
			var currCheckboxId = currCheckbox.getAttribute("id");
			var currCheckboxPref = currCheckbox.getAttribute("pref");
			
			if (currCheckboxId == null || currCheckboxId == '')
				fc_gPrefManager.setPref(currCheckboxPref, currCheckbox.checked);
			else if (currCheckboxId == "fc-advanced-toolbar-menuitem-hidden-checkbox")
				fc_gPrefManager.setPref(currCheckboxPref, !currCheckbox.checked);
			else if	(currCheckboxId == "fc-advanced-tooltip-flagvisible-checkbox" &&
						fc_gPrefManager.getPref(currCheckboxPref) != "fc-per-clock")
				fc_gPrefManager.setPref(currCheckboxPref, currCheckbox.checked ? "fc-all-clocks" : "fc-no-clocks");
		}
		
		fc_gPrefManager.addPrefObserver("foxclocks.", this);
		fc_gLogger.log("-FoxClocks_OptionsManager::onAccept()");
		return true;
	},
	
	// ====================================================================================
	onClockChoiceSelect : function()
	{
		fc_gLogger.log("+FoxClocks_OptionsManager::onClockChoiceSelect()");
		
		var clockChoiceList = document.getElementById("fc-format-clockchoice-list");
		var id = clockChoiceList.selectedItem.getAttribute("value");
		
		// AFM - hide things only relevant to the tooltip when not configuring the tooltip
		//
		document.getElementById("fc-format-tooltip-config").setAttribute("hidden",
		 id == "tooltip" ? "false" : "true");
		
		if (id != "tooltip")
		{
			// AFM - need to clear the alignment selection, even though the menuitem is hidden
			//
			var othersList = document.getElementById("fc-format-custom-other-list");
			if (othersList.selectedItem.getAttribute("id") == "fc-format-custom-other-alignpos-menuitem")
				othersList.selectedIndex = 0;
		}

		var formatParamRoot = "foxclocks.format." + id;	
		
		var standardFormat = fc_gPrefManager.getPref(formatParamRoot + ".standard");
		var customFormat = fc_gPrefManager.getPref(formatParamRoot + ".custom");
		
		// AFM - populate standard format dropdown. Ludicrous hoop-jumping to do this rightish, rather than just
		// trap and ignore getString() exceptions
		//
		var standardFormatsArray = new Array();
		var bundleEnum = document.getElementById("foxclocks-bundle").stringBundle.getSimpleEnumeration();
		while (bundleEnum.hasMoreElements())
		{
			var bundlePropElt = bundleEnum.getNext().QueryInterface(Components.interfaces.nsIPropertyElement);
			
			var matchDataArray = FC_REGEXP_OPTIONSFORMATSTANDARD.exec(bundlePropElt.key);
			if (matchDataArray != null) // i.e. if we have a match
			{
				var standardFormatIndex = matchDataArray[1]; // from capturing paren
				standardFormatsArray[standardFormatIndex] = bundlePropElt.value;
			}
		}

		var timeFormatter = Components.classes["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
						.getService(Components.interfaces.nsISupports).wrappedJSObject;	
							
		var locationPrefix = document.getElementById("foxclocks-bundle")
						.getString("options.format.custom.other.location.value") + ": ";
		
		// AFM - regenerate the dropdown, leaving ---select---
		//
		var standardMenuPopup = document.getElementById("fc-format-standard-popup");		
		for (var m=standardMenuPopup.childNodes.length - 1; m > 0; m--)
		{
			standardMenuPopup.removeChild(standardMenuPopup.childNodes[m]);
		}
		
		this.standardMenuList.selectedIndex = 0; // ---select---								
		for (var k=0; /* no limit */; k++)
		{
			var formatString = standardFormatsArray[k];
			if (formatString == null)
				break;
				
			// AFM - bit of a hack for now, but if the dropdown is for standard formats for the
			// statusbar/toolbar clocks, prepend locationPrefix to the format string, if necessary
			//
			if (id == "clock" && formatString.substr(0, locationPrefix.length) != locationPrefix)
				formatString = locationPrefix + formatString;
							
			// AFM - 'command' attribute doesn't work. No idea why
			//
			var menuItem = document.createElement("menuitem");
			
			menuItem.setAttribute("label", timeFormatter.getUTCTimeStringFromFormat(this.exampleDate, formatString));
			menuItem.setAttribute("value", formatString);
			menuItem.setAttribute("oncommand", "document.getElementById('cmd_fcop_stdformsel').doCommand()");
			
			standardMenuPopup.appendChild(menuItem);
			
			if (standardFormat == menuItem.getAttribute("value"))
				this.standardMenuList.selectedItem = menuItem;
		}
			
		this.customFormatBox.value = customFormat;
		
		// AFM - triggers this.onFormatRadioSelect() and so this.setStates()
		//
		this.whichFormatRadioGroup.selectedIndex = standardFormat == "" ? 1 : 0;

		fc_gLogger.log("-FoxClocks_OptionsManager::onClockChoiceSelect()");		
	},
	
	// ====================================================================================
	onFormatRadioSelect : function()
	{
		fc_gLogger.log("+FoxClocks_OptionsManager::onFormatRadioSelect()");

		// AFM - onselect handlers seem to run before onload, which is disastrous; use this.standardMenuList to test for onLoad() having run
		//
		if (this.standardMenuList == null)
		{
			fc_gLogger.log("-FoxClocks_OptionsManager::onFormatRadioSelect(): onLoad() not called");
			return;
		}
	
		var customSelected = this.whichFormatRadioGroup.selectedIndex == 1;
		
		this.standardMenuList.setAttribute("disabled", (customSelected ? "true" : "false"));
		document.getElementById("fc-format-custom-disabled").setAttribute("disabled", (!customSelected ? "true" : "false"));
		
		// AFM - have to set the property 'disabled', not the attribute, so can't use the broadcast/observes mechanism
		//
		this.customFormatBox.disabled = !customSelected;
		this.setStates();
		
		if (customSelected)
			this.customFormatBox.focus();
			
		fc_gLogger.log("-FoxClocks_OptionsManager::onFormatRadioSelect()");
	},

	// ====================================================================================
	onCustomFormatAddButton : function(event)
	{
		fc_gLogger.log("+FoxClocks_OptionsManager::onCustomFormatAddButton()");
		
		var targetId = event.explicitOriginalTarget.id;
		var element = null;
		
		// AFM - stringLiteral true => element's value is used directly, rather than to look-up data in the locale bundle
		//
		var stringLiteral = false;
		
		if (targetId == "fc-format-custom-hours-button")
			element = document.getElementById("fc-format-custom-hours-list").selectedItem;
		else if (targetId == "fc-format-custom-mins-button")
			element = document.getElementById("fc-format-custom-mins");
		else if (targetId == "fc-format-custom-secs-button")
			element = document.getElementById("fc-format-custom-secs");
		else if (targetId == "fc-format-custom-am-button")
			element = document.getElementById("fc-format-custom-am-list").selectedItem;
		else if (targetId == "fc-format-custom-day-button")
			element = document.getElementById("fc-format-custom-day-list").selectedItem;
		else if (targetId == "fc-format-custom-month-button")
			element = document.getElementById("fc-format-custom-month-list").selectedItem;
		else if (targetId == "fc-format-custom-year-button")
			element = document.getElementById("fc-format-custom-year-list").selectedItem;
		else if (targetId == "fc-format-custom-other-button")
		{
			var othersList = document.getElementById("fc-format-custom-other-list");
			element = othersList.selectedItem;
			var literalAtt = element.getAttribute("literal");
			
			if (literalAtt != null && literalAtt == "true")
				stringLiteral = true;
		}
		
		if (element != null)
		{
			var elAtt = element.getAttribute("value");
			var customFormatString = stringLiteral ? elAtt : document.getElementById("foxclocks-bundle").getString(elAtt);
			
			var preSelectText = this.customFormatBox.value.substr(0, this.customFormatBox.selectionStart);
			var postSelectText = this.customFormatBox.value.substr(this.customFormatBox.selectionEnd);
			
			this.customFormatBox.value = preSelectText + customFormatString + postSelectText;
			
			var cursorIndex = preSelectText.length + customFormatString.length;
			this.customFormatBox.setSelectionRange(cursorIndex, cursorIndex);
			
			this.setStates();
			this.customFormatBox.focus();
		}
		
		fc_gLogger.log("-FoxClocks_OptionsManager::onCustomFormatAddButton()");
	},
	
	// ====================================================================================
	onZonePickerDelete : function()
	{
		alert('todo');
	},
	
	// ====================================================================================
	onZonePickerImport : function()
	{
		var dialogTitle = document.getElementById("fc-zonepicker-import-dialog-title").getAttribute("label");
		var foxClocksFilter = "*." + FC_FOXCLOCKS_ZONEPICKER_EXTENSION;
		var filterText = document.getElementById("fc-zonepicker-import-dialog-filter-label").
			getAttribute("label") + " (" + foxClocksFilter + ")";

		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, dialogTitle, nsIFilePicker.modeOpen);
		fp.appendFilter(filterText, foxClocksFilter);
		fp.appendFilters(nsIFilePicker.filterAll);
		
		var res = fp.show();
		
		var errorMsg = null;
		if (res != nsIFilePicker.returnOK)
			return;
							
		try
		{
			var ios = Components.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService);
			var fileHandler = ios.getProtocolHandler("file").
					QueryInterface(Components.interfaces.nsIFileProtocolHandler);
					
			var urlSpec = fileHandler.getURLSpecFromFile(fp.file);
  			fc_gPrefManager.setPref("foxclocks.zonepicker.dataurl", urlSpec);
		} 
		catch(ex) 
		{
			errorMsg = ex.message;
		}
		
		if (errorMsg != null)
		{
			var promptText = document.getElementById("fc-zonepicker-import-dialog-failure").getAttribute("label") + ": " + errorMsg;
			fc_gPromptService.alert(window, "FoxClocks", promptText);
		}
		else
		{				
			var promptText = document.getElementById("fc-zonepicker-import-dialog-success").getAttribute("label");
			FoxClocks_openSimpleInfo("FoxClocks", promptText);
		}	
	},
	
	// ====================================================================================
	// AFM - onselect handlers seem to run before onload, which is disastrous; use this.standardMenuList to test for onLoad() having run
	//
	onPositionRadioSelect : function() { if (this.standardMenuList == null) return; this.setStates(); },
	onStatusbarRadioSelect : function(){ if (this.standardMenuList == null) return; this.setStates(); },
	onCustomInput : function() { this.setStates(); },
	onStatusbarTextboxInput : function() { this.setStates(); },
	
	// ====================================================================================
	// AFM - implementing nsIObserver
	//	
	observe : function(subject, topic, data)
	{
		if (topic == "foxclocks")
		{
			if (data == "engine:zone-data-update-complete")
			{
				this.setZoneDataDetails();
			}
		}
		else if (topic == "nsPref:changed")
		{
			switch (data)
			{
				default: this.setupGUIfromPrefs();
			}
		}
	},	
	
	// ====================================================================================
	setStates : function()
	{
		// AFM - again, thowing all state stuff in here, so some unnecessary checking, depending on caller
		//
		var standardFormatError = this.whichFormatRadioGroup.selectedIndex == 0 && this.standardMenuList.selectedIndex == 0;
		var customFormatFormatError = this.whichFormatRadioGroup.selectedIndex == 1 && this.customFormatBox.value == "";	
		var statusbarSpecPosnError = this.whichBarRadioGroup.selectedIndex == 0 && this.statusbarPosnRadioGroup.selectedIndex == 2 &&
										!FC_REGEXP_VALID_STATBARPOSN_INDEX.test(this.statusbarSpecPosnTextbox.value);
										
		document.getElementById("fc-format-tab").setAttribute("class", standardFormatError || customFormatFormatError ? "foxclocks-errorstate" : "");

		document.getElementById("fc-format-radio-standard").setAttribute("class", standardFormatError ? "foxclocks-errorstate" : "");
		document.getElementById("fc-format-radio-custom").setAttribute("class", customFormatFormatError ? "foxclocks-errorstate" : "");
		document.getElementById("fc-clock-tab").setAttribute("class", statusbarSpecPosnError ? "foxclocks-errorstate" : "");
		document.getElementById("fc-clock-position-statusbar-radio-specific-radio").setAttribute("class", statusbarSpecPosnError ? "foxclocks-errorstate" : "");
					
		document.documentElement.getButton("extra1").disabled = standardFormatError || customFormatFormatError || statusbarSpecPosnError;
		document.documentElement.getButton("accept").disabled = standardFormatError || customFormatFormatError || statusbarSpecPosnError;
		
		this.statusbarSpecPosnTextbox.disabled =	this.whichBarRadioGroup.selectedIndex == 1 ||
													this.statusbarPosnRadioGroup.selectedIndex != 2;
													
		this.statusbarPosnRadioGroup.disabled = this.whichBarRadioGroup.selectedIndex == 1;
		
		var timeFormatter = Components.classes["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
						.getService(Components.interfaces.nsISupports).wrappedJSObject;
							
		var customPreview = document.getElementById("fc-format-custom-textbox-preview");
		customPreview.setAttribute("value", timeFormatter.getUTCTimeStringFromFormat(this.exampleDate, this.customFormatBox.value));
	}
}