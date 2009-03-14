// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// ====================================================================================
function FoxClocks_Overlay()
{			
	this.clockTimeFormatter = null;
	this.tooltipTimeFormatter = null;
	this.hTimer = null;
	
	this.clocks = new Array();
	this.clockTooltip = null;
	this.clockTooltipUpdate = false;
	this.clockOldContainer = null;
	this.clockContainerType = null;
	this.hCustomizeToolbarWindow = null;
	
	this.observeRecursionDepth = 0;
}
	
// ====================================================================================
FoxClocks_Overlay.prototype =
{
	// ====================================================================================
	onLoad : function()
	{
		fc_gLogger.log("+FoxClocks_Overlay::onLoad()");

		// AFM - apply conditional CSS rules before anything else
		//
		if (fc_gUtils.shouldApplyStatusbarFix)
		{
			for each (var stylesheet in document.styleSheets)
			{
				if (stylesheet.href == "chrome://foxclocks/skin/foxclocks.css")
					stylesheet.insertRule(FC_STATUSBAR_FIX_CSS, stylesheet.cssRules.length);
			}
		}
		
		this.clockTimeFormatter = Components.classes["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
							.createInstance(Components.interfaces.nsISupports).wrappedJSObject;
		this.tooltipTimeFormatter = Components.classes["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
							.createInstance(Components.interfaces.nsISupports).wrappedJSObject;	
	
		this.clockTooltip = document.getElementById("foxclocksoverlay-clock-tooltip");
		 
		this.setClocksContainerType();
		this.setClocksFormat();
		this.setTooltipFormat();
		this.setTimerInterval();
		this.setMenuItemState();
		
		this.createClocks();
		this.updateView();
		
		fc_gPrefManager.addPrefObserver("foxclocks.", this);
				
		fc_gObserverService.addObserver(this, "domwindowopened", false);
		fc_gObserverService.addObserver(this, "domwindowclosed", false);
		fc_gObserverService.addObserver(this, "foxclocks", false);
		
		// AFM - use timeout to avoid app not being fully rendered when welcome/update window opens
		// Should move to engine
		//
		setTimeout(this.checkVersion, 0, this);
		
		fc_gLogger.log("-FoxClocks_Overlay::onLoad()");
	},
		
	// ====================================================================================	
	onUnload : function()
	{
		if (this.hTimer != null)
			window.clearInterval(this.hTimer);
			
		fc_gPrefManager.removePrefObserver("foxclocks.", this);
			
		fc_gObserverService.removeObserver(this, "domwindowopened");
		fc_gObserverService.removeObserver(this, "domwindowclosed");
		fc_gObserverService.removeObserver(this, "foxclocks");
	},
	
	// ====================================================================================
	onClockIconClick : function(event) { if (event.button == 0) FoxClocks_openFoxClocksWindow(); },
	onClockDblClick : function(event) { if (event.button == 0) FoxClocks_openFoxClocksWindow(); },
	onClockTooltipShowing : function(event) { this.clockTooltipUpdate = true; this.updateView(); },
	onClockTooltipHidden : function(event) { this.clockTooltipUpdate = false; },
	
	// ====================================================================================
	// AFM - implementing nsIObserver
	//
	observe : function(subject, topic, data, self)
	{
		var recursing = false;
		
		// AFM - potentially in this method from setTimeout() callback
		//
		if (self == null)
			self = this;
	
		// fc_gLogger.log("FoxClocks_Overlay::observe(): topic: <" + topic + ">, clock location <" +
		//	self.clockContainerType + ">");
		
		if (topic == "foxclocks")
		{
			if (data == "engine:zone-data-update-complete")
			{		
				if (subject.wrappedJSObject.lastUpdateResult.result == "OK_NEW")
				{
					self.createClocks();
				}
			}
			else if (data == "engine:watchlist-changed");
			{
				self.createClocks();
			}		
		}
		else if (topic == "nsPref:changed")
		{
			switch (data) // prefName
			{
				case "foxclocks.clock.containertype": self.setClocksContainerType(); self.createClocks(); break;
				case "foxclocks.clock.style": self.setClocksVisibility(); break;
				case "foxclocks.clock.position.relative": self.createClocks(); break;
				case "foxclocks.format.clock.standard": self.setClocksFormat(); break;
				case "foxclocks.format.clock.custom": self.setClocksFormat(); break;
				case "foxclocks.format.tooltip.standard": self.setTooltipFormat(); break;
				case "foxclocks.format.tooltip.custom": self.setTooltipFormat(); break;
				case "foxclocks.clock.bar.clock.global.showflag": self.createClocks(); break;
				case "foxclocks.clock.tooltip.clock.global.showflag": self.createClocks(); break;
				case "foxclocks.toolbar.menuitem.hidden": self.setMenuItemState(); break;
			}
		}
		else if (topic == "domwindowclosed")
		{
			if (subject.location != null && FC_REGEXP_CUSTOMIZE_TOOLBAR.test(subject.location.href))
			{
				if (self.hCustomizeToolbarWindow == null)
					fc_gLogger.log("FoxClocks_Overlay::observe(): customize toolbar window closed, but open event not received", fc_gLogger.WARN);
				else
					fc_gLogger.log("FoxClocks_Overlay::observe(): customize toolbar window closed");
					
				self.hCustomizeToolbarWindow = null;
				
				// AFM - regenerate dynamic content of toolbar when the customize dialog closed
				// Actually do this whether or not we're in toolbar mode
				//
				self.createClocks();
				self.updateView();
			}
		}
		else if (topic == "domwindowopened")
		{		
			if (subject.location != null && subject.location.href == "about:blank")
			{
				const MAX_RECURSE_DEPTH = 2;
				if (self.observeRecursionDepth < MAX_RECURSE_DEPTH)
				{
					// fc_gLogger.log("FoxClocks_Overlay::observe(): unknown window opened - recursing (depth curr. "
					//	+ self.observeRecursionDepth + ")");
					
					// AFM - try to get the href again. Only recurse MAX_RECURSE_DEPTH times, just in case
					//
					self.observeRecursionDepth++;
					recursing = true;
					setTimeout(self.observe, 0, subject, topic, data, self);
				}
				else
				{
					// AFM - log at debug - seems to happen a fair bit, and we don't want to worry people
					//
					fc_gLogger.log("FoxClocks_Overlay::observe(): reached max recursion depth "
						+ MAX_RECURSE_DEPTH);
				}
				
			}
			else if (subject.location != null && FC_REGEXP_CUSTOMIZE_TOOLBAR.test(subject.location.href))
			{
				fc_gLogger.log("FoxClocks_Overlay::observe(): customize toolbar window opened");
				self.hCustomizeToolbarWindow = subject;

				self.createClocks();
				self.updateView();
			}
			else
			{
				var href = subject.location != null ? subject.location.href : "- subject.location null -";
				fc_gLogger.log("FoxClocks_Overlay::observe(): <" + href + "> opened");
			}
		}
		
		if (recursing == false)
			self.observeRecursionDepth = 0;
			
		self.updateView();
	},
	
	// ====================================================================================
	checkVersion : function(self)
	{			
		var prevRunVersion = fc_gPrefManager.getPref("extensions." +
					fc_gUtils.FC_GUID_FOXCLOCKS + ".prevrun.version");
					
		var currentVersion = fc_gUtils.getFoxClocksVersion();
					
		if (currentVersion)
			fc_gPrefManager.setPref("extensions." + fc_gUtils.FC_GUID_FOXCLOCKS + ".prevrun.version", currentVersion);
		
		// AFM - don't display enable automatic updates checkbox if it's currently enabled
		//
		var hideEnableUpdate = fc_gPrefManager.getPref("foxclocks.data.update.auto.enabled");

		if (prevRunVersion == "") // first run
		{
			var retVals = {openFoxClocks: false, launchHomePage: false, enableAutoUpdate: false};
			window.openDialog(	"chrome://foxclocks/content/welcome.xul", "",
								"chrome,modal,centerscreen,resizable=no", retVals, hideEnableUpdate);

			if (retVals.launchHomePage)
				FoxClocks_openFoxClocksHomeURL(false);
																		
			if (retVals.openFoxClocks)
				FoxClocks_openFoxClocksWindow();

			if (hideEnableUpdate == false)
			{
				// AFM - should be going through a component, not hitting the
				// pref directly
				//
				fc_gPrefManager.setPref("foxclocks.data.update.auto.enabled", retVals.enableAutoUpdate);
				fc_gLogger.log("FoxClocks_Overlay::checkVersion(): auto-update on welcome: " + retVals.enableAutoUpdate);
			}
			else
			{
				// AFM - wouldn't expect to get here on welcome, but theoretically someone
				// could be messing with the prevrun.version param
				//
				fc_gLogger.log("FoxClocks_Overlay::checkVersion(): auto-update on welcome hidden");
			}
			return;
		}
		
		var comparison = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
			.getService(Components.interfaces.nsIVersionComparator).compare(prevRunVersion, currentVersion);
			
		if (comparison < 0)
		{				
			var retVals = {launchChangeLog: false, enableAutoUpdate: false};
			window.openDialog(	"chrome://foxclocks/content/update.xul", "",
								"chrome,modal,centerscreen,resizable=no", retVals, hideEnableUpdate);
								
			if (retVals.launchChangeLog)
				FoxClocks_openFoxClocksHomeURL(true);
				
			if (hideEnableUpdate == false)
			{
				// AFM - should be going through a component, not hitting the
				// pref directly
				//
				fc_gPrefManager.setPref("foxclocks.data.update.auto.enabled", retVals.enableAutoUpdate);
				fc_gLogger.log("FoxClocks_Overlay::checkVersion(): auto-update on upgrade: " + retVals.enableAutoUpdate);
			}
			else
			{
				fc_gLogger.log("FoxClocks_Overlay::checkVersion(): auto-update on upgrade hidden");
			}
		}
		else if (comparison > 0)
		{
			fc_gLogger.log("FoxClocks_Overlay::checkVersion(): FoxClocks downgraded from <" +
				prevRunVersion + "> to <" + currentVersion + ">", fc_gLogger.WARN);
		}
	},
	
	// ====================================================================================
	updateView : function(scope)
	{	
		if (scope == null)
			scope = this;
		
		var nowDate = new Date();
		
		// AFM - update clocks if visible
		//
		for (var i=0; i < scope.clocks.length; i++)
		{
			var watchlistItem = fc_gWatchlistManager.getItem(i);
			var clock = scope.clocks[i];
		
			// AFM - paranoia - we know the clocks array is the same length as the watchlist
			//	
			if (!clock.hidden && watchlistItem != null)
			{
				var sbarFormatter = watchlistItem.getStatusbarTimeFormatter() != null ?
					watchlistItem.getStatusbarTimeFormatter() : scope.clockTimeFormatter;
					
				clock.setAttribute("label", sbarFormatter.getTimeString(watchlistItem.location, nowDate));
				
				var colour = watchlistItem.colour;
				
				if (watchlistItem.altColour_enabled)
				{
					var localDate = watchlistItem.location.zone.currDisplayDate(nowDate);
					var minsPastMidnight = localDate.getUTCHours() * 60 + localDate.getUTCMinutes();
					
					var startTime = watchlistItem.altColour_startTime;
					var endTime = watchlistItem.altColour_endTime;
					
					if (startTime < endTime)
					{
						if (minsPastMidnight >= startTime && minsPastMidnight < endTime)
							colour = watchlistItem.altColour;
					}
					else
					{
						if (!(minsPastMidnight >= endTime && minsPastMidnight < startTime))
							colour = watchlistItem.altColour;
					}			
					
					// fc_gLogger.log(watchlistItem.location.name + " " + startTime + " " + minsPastMidnight + " " + endTime);
				}
					
				if (colour != "")
					clock.setAttribute("style", "color:" + colour + ";");
				else
					clock.removeAttribute("style");
			}
		}
	
		// AFM - update tooltip if visible
		//
		var clockTooltipGrid = scope.clockTooltip.firstChild;
		if (clockTooltipGrid && scope.clockTooltipUpdate)
		{
			var gridRows = clockTooltipGrid.lastChild;
			for (var j=0; j < gridRows.childNodes.length; j++)
			{
				var gridRow = gridRows.childNodes[j];
				var locationIndex = gridRow.getAttribute("value");
				
				if (locationIndex && locationIndex != "fc-nolocs-row")
				{
					var currWatchlistItem = fc_gWatchlistManager.getItem(locationIndex);
					
					var tooltipFormatter = currWatchlistItem.getTooltipTimeFormatter() != null ?
						currWatchlistItem.getTooltipTimeFormatter() : scope.tooltipTimeFormatter;
						
					var timeText = tooltipFormatter.getTimeString(currWatchlistItem.location, nowDate);					
											
					if (FC_USE_ALIGN)
					{
						var pos = timeText.indexOf("\t");
						var label1Value = null;
						var label2Value = null;
						
						if (pos != -1)
						{
							label1Value = timeText.substring(0, pos);
							label2Value = timeText.substring(pos + 1).replace("\t", "", "g");
						}
						else
						{
							label1Value = "";
							label2Value = timeText;
						}
						
						gridRow.childNodes[2].lastChild.setAttribute("value", label1Value);
						gridRow.childNodes[3].lastChild.setAttribute("value", label2Value);
					}
					else
					{
						gridRow.lastChild.setAttribute("value", timeText);
					}
				}
			}
		}
	},
	
	// ====================================================================================
	setClocksContainerType : function()
	{
		this.clockContainerType = fc_gPrefManager.getPref("foxclocks.clock.containertype");
	},
	
	// ====================================================================================
	setClocksFormat : function()
	{
		var standardFormat = fc_gPrefManager.getPref("foxclocks.format.clock.standard");
		var customFormat = fc_gPrefManager.getPref("foxclocks.format.clock.custom");
										
		this.clockTimeFormatter.setTimeFormat(standardFormat == "" ? customFormat : standardFormat);
	},
	
	// ====================================================================================
	setTooltipFormat : function()
	{
		var standardFormat = fc_gPrefManager.getPref("foxclocks.format.tooltip.standard");
		var customFormat = fc_gPrefManager.getPref("foxclocks.format.tooltip.custom");
										
		this.tooltipTimeFormatter.setTimeFormat(standardFormat == "" ? customFormat : standardFormat);
	},
	
	// ====================================================================================
	setTimerInterval : function()
	{
		if (this.hTimer != null)
			window.clearInterval(this.hTimer);
						
		this.hTimer = window.setInterval(this.updateView, fc_gUtils.FC_CLOCK_UPDATE_INTERVAL, this);
	},
	
	// ====================================================================================
	setMenuItemState : function()
	{
		var hideMenuItem = fc_gPrefManager.getPref("foxclocks.toolbar.menuitem.hidden");
								
		document.getElementById("foxclocksoverlay-menuitem").collapsed = hideMenuItem;		
	},
	
	// ====================================================================================
	setClocksVisibility : function()
	{
		var clockStyle = fc_gPrefManager.getPref("foxclocks.clock.style");
		
		var showToolbarButton = (this.clockContainerType == "fc-clock-containertype-toolbar" && (clockStyle == "fc-clock-style-icon" || this.hCustomizeToolbarWindow));
		var showStatusbarIcon = (this.clockContainerType == "fc-clock-containertype-statusbar" && clockStyle == "fc-clock-style-icon");
		
		var hideAllClocks = (showToolbarButton || showStatusbarIcon);
		
		this.showClocksToolbarButton(showToolbarButton);
		
		var statusbarPanelIcon = document.getElementById("foxclocksoverlay-statusbarpanel-icon");
		
		if (statusbarPanelIcon)
			statusbarPanelIcon.setAttribute("hidden", (showStatusbarIcon ? "false" : "true"));
		
		for (var i=0; i < this.clocks.length; i++)
		{
			// AFM - paranoia - watchlist and clocks array should be the same length
			//
			var item = fc_gWatchlistManager.getItem(i);
			var showClock = item != null ? item.showClock_statusbar : false;
			var clock = this.clocks[i];
			
			clock.hidden = hideAllClocks || showClock == false;
		}
		
		// AFM - due to the 'persistent tooltip' Firefox bug, for now, don't show the tooltip if
		// there are no locations in it, rather than showing '(no locations selected)'. Exception is
		// when we're in icon mode (only point of icon mode is to see the tooltip)
		// Note that this bug only applies to the statusbar, but for consistency this workaround
		// isn't statusbar-specific
		//
		var clockTooltipGrid = this.clockTooltip.firstChild;
		if (clockTooltipGrid)
		{
			var gridRows = clockTooltipGrid.lastChild;
			
			if (	gridRows.childNodes.length == 1 && 
					gridRows.childNodes[0].getAttribute("value") == "fc-nolocs-row" && 
					clockStyle != "fc-clock-style-icon")		
			{			
				this.clockTooltip.setAttribute("collapsed", "true");
			}
			else
			{
				this.clockTooltip.removeAttribute("collapsed", "true");
			}
		}
	},

	// ====================================================================================
	createClocks : function()
	{
		fc_gLogger.log("+FoxClocks_Overlay::createClocks()");
			
		var globalClockShowflagPref = fc_gPrefManager.getPref("foxclocks.clock.bar.clock.global.showflag");
		var globalTooltipShowflagPref = fc_gPrefManager.getPref("foxclocks.clock.tooltip.clock.global.showflag");
		
		// AFM - subtle: blow away the clocks and clockTooltipGrid
		//
		
		var statusbarPanelIcon = document.getElementById("foxclocksoverlay-statusbarpanel-icon");

		if (statusbarPanelIcon && this.clockOldContainer)
			this.clockOldContainer.removeChild(statusbarPanelIcon);
			
		var numClocks = this.clocks.length;
		for (var j=0; j < numClocks; j++)
		{
			// AFM - number of child clocks may not sync with this.clocks e.g. when the
			// item's been dragged from the toolbar palette,
			// in which case there are no child clocks
			//
			this.clocks.pop();
			var clock = document.getElementById("foxclocksoverlay-clock-id-" + j);
			
			// fc_gLogger.log("FoxClocks_Overlay::createClocks(): container <" + 
			//	(this.clockOldContainer ? this.clockOldContainer.getAttribute("id") : "null") + 
			//	"> - child with id <" + (clock ? clock.getAttribute("id") : "null") + ">");

			if (clock && this.clockOldContainer)
				this.clockOldContainer.removeChild(clock);
		}
		
		var clockTooltipGrid = this.clockTooltip.firstChild;
		
		if (clockTooltipGrid != null)
			this.clockTooltip.removeChild(clockTooltipGrid);

		var clockContainer = this.getClockContainer();
		var clockType = this.getClockXULType();
		
		this.clockOldContainer = clockContainer;
		
		if (!clockContainer)
		{
			// AFM - container dragged off toolbar, for example
			//
			this.setClocksVisibility();
			fc_gLogger.log("FoxClocks_Overlay::createClocks(): no container");
			return;
		}

		var clocksPosnRelative = fc_gPrefManager.getPref("foxclocks.clock.position.relative");
			
		// AFM - create tool tip grid/columns/column/rows elements
		//
		clockTooltipGrid = document.createElement("grid");
		clockTooltipGrid.setAttribute("flex", "1");
		this.clockTooltip.appendChild(clockTooltipGrid);
	
		var gridColumns = document.createElement("columns");
		gridColumns.appendChild(document.createElement("column"));
		gridColumns.appendChild(document.createElement("column"));
		gridColumns.appendChild(document.createElement("column"));
		clockTooltipGrid.appendChild(gridColumns);
		
		var gridRows = document.createElement("rows");
		clockTooltipGrid.appendChild(gridRows);
		
		var previousClock = null;
		var clockId = 0;
		
		var startIndex = this.clockContainerType == "fc-clock-containertype-statusbar" ? -1 : 0;
		for (var i = startIndex; i < fc_gWatchlistManager.getWatchlist().length; i++)
		{			
			var clock = null;
			
			if (i == -1)
			{
				// AFM - -1 => must be in statusbar
				//
				clock = document.createElement(clockType);
				clock.setAttribute("id", "foxclocksoverlay-statusbarpanel-icon");
				clock.setAttribute("class", "statusbarpanel-iconic");
				clock.setAttribute("onclick", "foxClocksOverlay.onClockIconClick(event)");
			}
			else
			{
				var watchlistItem = fc_gWatchlistManager.getItem(i);
				
				// AFM - don't use i, in case we've 'continued' above
				//
				var clockIdString = "foxclocksoverlay-clock-id-" + clockId++;
				
				clock = document.createElement(clockType);
				clock.setAttribute("id", clockIdString);
				clock.setAttribute("ondblclick", "foxClocksOverlay.onClockDblClick(event)");			
				
				// AFM - for clocks in toolbars other than the menubar, we need to style the
				// label as "toolbarbutton-text" to get the text to align with other elements
				// in the toolbar. There's still an issue with flag image alignment, but its
				// extremely minor (the corresponding class "toolbarbutton-icon" doesn't work
				// when applied to the image).
				// 
				if (this.clockContainerType == "fc-clock-containertype-toolbar")
				{				
					var toolbarItem = document.getElementById("foxclocksoverlay-toolbaritem-clocks");
					var toolbarItemParent = toolbarItem && toolbarItem.parentNode;
					var toolbarItemGrandParent = toolbarItemParent && toolbarItemParent.parentNode;
					
					if (toolbarItemParent && toolbarItemGrandParent) // AFM - should always exist
					{
						var parentId = toolbarItemParent.getAttribute("id");
						var grandParentId = toolbarItemGrandParent.getAttribute("id");
						
						if (	!parentId || !grandParentId ||
								(parentId != "toolbar-menubar" &&
								grandParentId != "toolbar-menubar"))
						{
							clock.setAttribute("labelclass", "toolbarbutton-text foxclocks-toolbar-clock-text");
						}
						// AFM - doesn't do what we want really
						//
						// else
						// {
						//  clock.setAttribute("labelclass", "menubar-text");
						// }
					}
				}
				
				var classString = this.clockContainerType == "fc-clock-containertype-statusbar" ? 
						"foxclocks-statusbar-clock " : "foxclocks-toolbar-clock ";
				
				if (watchlistItem.bold == true) classString += "foxclocks-bold ";
				if (watchlistItem.italic == true) classString += "foxclocks-italic ";
				if (watchlistItem.underline == true) classString += "foxclocks-underline ";
					
				if (	globalClockShowflagPref != "fc-no-clocks" &&
						(	watchlistItem.showClock_statusbarFlag == true ||
							globalClockShowflagPref == "fc-all-clocks")
					)
				{
					var flagUrl = watchlistItem.getFlagUrl();
					if (flagUrl != "")
					{
						clock.setAttribute("src", flagUrl);
											
						if (this.clockContainerType == "fc-clock-containertype-statusbar")
							classString += "statusbarpanel-iconic-text";
					}
				}
				
				clock.setAttribute("class", classString);
					
				this.clocks.push(clock);	

				// AFM - generate the tool tip grid row
				//
				if (watchlistItem.showClock_statusbarTooltip == true)
				{
					var gridRow = document.createElement("row");
					
					// AFM - store index of location corresponding to tooltip row
					// so we can get the location's time when updating the tooltip
					//
					gridRow.setAttribute("value", this.clocks.length - 1);
	
					var imageElement = document.createElement("image");				
					
					if (	globalTooltipShowflagPref != "fc-no-clocks" &&
							(	watchlistItem.showClock_statusbarTooltipFlag == true ||
								globalTooltipShowflagPref == "fc-all-clocks")
						)
					{
						var flagUrl = watchlistItem.getFlagUrl();
						if (flagUrl != "")
						{
							imageElement.setAttribute("src", flagUrl);
							imageElement.setAttribute("class", "foxclocks-tooltip-flag");
						}
					}
					
					gridRow.appendChild(imageElement);
					
					var label = document.createElement("label");
					label.setAttribute("value", watchlistItem.location.name);
				
					gridRow.appendChild(label);
					
					if (FC_USE_ALIGN)
					{
						var hbox = document.createElement("hbox");
						hbox.setAttribute("align", "right");
						hbox.setAttribute("class", "foxclocks-tooltip-location");
						hbox.appendChild(document.createElement("label"));
						gridRow.appendChild(hbox);
						
						hbox = document.createElement("hbox");
						hbox.setAttribute("align", "left");
						hbox.setAttribute("class", "foxclocks-tooltip-time");
						hbox.appendChild(document.createElement("label"));
						gridRow.appendChild(hbox);
					}
					else
					{
						gridRow.appendChild(document.createElement("label"));
					}				
	
					gridRows.appendChild(gridRow);
				}
			}
			
			// AFM - attributes common to the 'icon' clock and normal clocks
			//
			clock.setAttribute("context", "foxclocksoverlay-clock-context");
			clock.setAttribute("tooltip", "foxclocksoverlay-clock-tooltip");
			
			if (previousClock)
			{
				if (previousClock.nextSibling != null)
					clockContainer.insertBefore(clock, previousClock.nextSibling);
				else
					clockContainer.appendChild(clock);
			}
			else
			{				
				// AFM - first clock going in to the clockContainer
				//
				if (this.clockContainerType == "fc-clock-containertype-statusbar")
				{
					var statusbarIndex = null;
					
					if (clocksPosnRelative == "fc-clock-position-left")
						statusbarIndex = 0;
					else if (clocksPosnRelative == "fc-clock-position-right")
						statusbarIndex = clockContainer.childNodes.length;
					else
						statusbarIndex = Number(clocksPosnRelative);

					if (clockContainer.childNodes.length == 0 || statusbarIndex > clockContainer.childNodes.length - 1)
						clockContainer.appendChild(clock);
					else
						clockContainer.insertBefore(clock, clockContainer.childNodes[statusbarIndex]);
				}
				else //  "fc-clock-containertype-toolbar" or anything else
				{
					clockContainer.appendChild(clock);
				}
			}
			
			previousClock = clock;
		}
		
		if (gridRows.childNodes.length == 0)
		{
			// AFM - generate the tool tip grid row when there are no locations to be displayed
			// in the tooltip
			//
			var gridRow = document.createElement("row");
			gridRow.setAttribute("value", "fc-nolocs-row");
			
			var label = document.createElement("label");
			label.setAttribute("value", document.getElementById("foxclocksoverlay-nolocs-label").getAttribute("label"));
			label.setAttribute("disabled", "true");
			
			gridRow.appendChild(label);
			// AFM - don't add second column. Naughty but seems to make it look nicer...
			// gridRow.appendChild(document.createElement("label"));

			gridRows.appendChild(gridRow);
		}
				
		this.setClocksVisibility();
			
		fc_gLogger.log("-FoxClocks_Overlay::createClocks(): clocks.length is " + this.clocks.length);
	},
	
	// ====================================================================================
	getClockContainer : function() { return document.getElementById(this.clockContainerType == "fc-clock-containertype-statusbar" ? "status-bar" : "foxclocksoverlay-toolbaritem-box"); },
	getClockXULType : function() { return this.clockContainerType == "fc-clock-containertype-statusbar" ? "statusbarpanel" : "foxclocks-clockpanel"; },
	
	// ====================================================================================
	showClocksToolbarButton : function (truth)
	{
		// fc_gLogger.log("+FoxClocks_Overlay::showClocksToolbarButton()");

		// AFM - can't make the button a data member - changes when it's added/removed from the palette
		//
		var toolbarButton = document.getElementById("foxclocksoverlay-toolbarbutton-clocks");
		
		if (toolbarButton)
			toolbarButton.setAttribute("hidden", (truth ? "false" : "true"));

		// AFM - show/hide the button on the palette. Don't understand this. I thought the above was sufficient, but doesn't always work. Also, have to use wrapper-...:
		// Even though the DOM Inspector reports that foxclocksoverlay-toolbar[item|button]-clocks exist in the customize window, getElementById() fails...
		//
		var paletteItem = this.hCustomizeToolbarWindow ? this.hCustomizeToolbarWindow.document.getElementById("wrapper-foxclocksoverlay-toolbaritem-clocks") : null;
		
		if (paletteItem)
		{
			paletteItem.setAttribute("hidden", (truth ? "false" : "true"));
			// fc_gLogger.log("FoxClocks_Overlay::showClocksToolbarButton(): paletteItem: hidden: " + paletteItem.getAttribute("hidden"));
		}	
		else
		{
			// fc_gLogger.log("FoxClocks_Overlay::showClocksToolbarButton(): don't have paletteItem: cust window exists: " + (this.hCustomizeToolbarWindow != null));
			
			// if (this.hCustomizeToolbarWindow != null)
			// {
				// var x = this.hCustomizeToolbarWindow.document.getElementById("wrapper-foxclocksoverlay-toolbaritem-clocks");
				// fc_gLogger.log("FoxClocks_Overlay::showClocksToolbarButton(): cust window exists: x: " + (x != null));
			// }
		}
		
		// fc_gLogger.log("-FoxClocks_Overlay::showClocksToolbarButton()");
	},
	
	// ====================================================================================
	// AFM - legacy code to support CuteMenus: http://www.extensionsmirror.nl/index.php?showtopic=4360
	//
	onMenuItemCmd : function(event) { FoxClocks_openFoxClocksWindow(); }
}