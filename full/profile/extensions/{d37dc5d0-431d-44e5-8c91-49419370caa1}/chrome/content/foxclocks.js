// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

// ====================================================================================
function FoxClocks()
{		
	this.zonePicker = null;
	this.watchlistTree = null;
	this.searchBox = null;
	this.watchlistDropAtIndex = null; // AFM - null => drop at end
	this.timeFormatter = null;
	this.inOnZonePickerSelect = false;
	this.hTimer = null;
	this.ZP_DST_INDICATOR_STRING = "*";
}
	
// ====================================================================================
FoxClocks.prototype =
{
	// ====================================================================================	
	quickTest : function()
	{
		const TESTING = false;

		if (TESTING == false)
			return;
	
		fc_gLogger.log("+FoxClocks::quickTest()");
				
		try
		{	
			// ====================================================================================
			// ====================================================================================
			
            
			// ====================================================================================
			// ====================================================================================
			fc_gLogger.log("FoxClocks::quickTest(): success");
		}
		catch (ex)
		{
			alert("FoxClocks::quickTest(): failure: exception <" + ex + ">");
		}
		
			
		fc_gLogger.log("-FoxClocks::quickTest()");
	},
		
	// ====================================================================================
	onLoad : function()
	{
		fc_gLogger.log("+FoxClocks::onLoad()");
						
		this.zonePicker = document.getElementById("fc-zonepicker");
		this.watchlistTree = document.getElementById("fc-watchlist");
		this.searchBox = document.getElementById("fc-zonepicker-searchbox");
		this.searchBox.setAttribute("class", "fc-zonepicker-searchbox-inactive");

		// AFM - missing locale strings
		//
		if (this.searchBox.getAttribute("fc_init_value") == "")
			this.searchBox.setAttribute("collapsed", "true");
		
		fc_gPrefManager.addPrefObserver("foxclocks.", this);
		fc_gObserverService.addObserver(this, "foxclocks", false);
			
		this.timeFormatter = Components.classes["@stemhaus.com/firefox/foxclocks/timeformatter;1"]
							.createInstance(Components.interfaces.nsISupports).wrappedJSObject;
							
		this.setTimerInterval();
		this.setTimeFormat();
		
		var versionString = "FoxClocks " + fc_gUtils.getFoxClocksVersion();
		document.getElementById("fc-foxclocks-version-label").setAttribute("value", versionString);
		
		this.populateZonePicker();
		this.populateWatchlist();
		
		setTimeout(this.quickTest, 0, this);
		
		fc_gLogger.log("-FoxClocks::onLoad()");
	},
	
	// ====================================================================================
	onUnload : function()
	{
		if (this.hTimer != null)
			window.clearInterval(this.hTimer);
			
		fc_gPrefManager.removePrefObserver("foxclocks.", this);
		fc_gObserverService.removeObserver(this, "foxclocks");
	},
	
	// AFM - START, EVENTS
	//
	
	// ====================================================================================
	onWatchListKeyPress : function(event)
	{
		if (event.keyCode == KeyEvent.DOM_VK_ENTER || event.keyCode == KeyEvent.DOM_VK_RETURN)
			this.onOpenLocDetailsCmd();
	},

	// ====================================================================================
	onZonePickerSelect : function()
	{
		// AFM - horrible way to disable selecting non-terminal nodes
		//
		
		// AFM - prevent recursion. this.zonePicker.view.selection.selectEventsSuppressed
		// doesn't seem to work inside an event handler - in fact causes recursion.
		// We're called back again when we clear a container's selection, so can't use
		// toggleSelection since we'll reselect the container. Yuk.
		//
		if (this.inOnZonePickerSelect)
			return;
		
		this.inOnZonePickerSelect = true;
	
		fc_gLogger.log("+FoxClocks::onZonePickerSelect()");
		
		var rangeCount = this.zonePicker.view.selection.getRangeCount();
		
		for (var i=0; i < rangeCount; i++)
		{
			var start = {};
			var end = {};
			this.zonePicker.view.selection.getRangeAt(i, start, end);
			for (var c = start.value; c != -1 && c <= end.value; c++)
			{
				var treeItem = this.zonePicker.view.getItemAtIndex(c);

				if (treeItem.getAttribute("container") == "true")
					this.zonePicker.view.selection.clearRange(c, c);
			}
		}
		
		this.setZonePickerStates();
		this.inOnZonePickerSelect = false;
		
		fc_gLogger.log("-FoxClocks::onZonePickerSelect()");
	},
	
	// ====================================================================================
	onOpenZoneDetailsCmd : function()
	{
		var location = this.getSelectedZonePickerLocation();
		if (!location)
			return;
					
		// AFM - ignore return value
		//
		var wathlistItem = fc_gWatchlistManager.createItem(location);
		this.openZoneInfo(wathlistItem, "ZONE");
	},
	
	// ====================================================================================
	onOpenZoneGoogleEarthCmd : function()
	{
		var location = this.getSelectedZonePickerLocation();
		if (!location)
			return;
			
		this.openGoogleEarth(location);
	},
	
	// ====================================================================================
	onImportCmd : function()
	{
		var dialogTitle = document.getElementById("fc-dialog-import-title").getAttribute("label");
		var foxClocksFilter = "*." + FC_FOXCLOCKS_SETTINGS_EXTENSION;
		var filterText = document.getElementById("fc-dialog-importexport-filter-label").getAttribute("label") +
			" (" + foxClocksFilter + ")";

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
			var inStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					.createInstance(Components.interfaces.nsIFileInputStream);
			inStream.init(fp.file, -1, -1, 0);

			var doc = new DOMParser().parseFromStream(inStream, "UTF-8", -1, "text/xml");
			
			inStream.close();
			
			var promptText = document.getElementById("fc-import-confirm-label").getAttribute("label");  	
			if (fc_gPromptService.confirm(window, "FoxClocks", promptText) == false)
				return;
			
			if (fc_gPrefManager.xmlToPrefs("foxclocks.", doc) == false)
				errorMsg = "parsererror"; // bit lame - not localised
		} 
		catch(ex) 
		{
			errorMsg = ex.message;
		}
		
		if (errorMsg != null)
		{
			var promptText = document.getElementById("fc-dialog-import-failure").getAttribute("label") + ": " + errorMsg;
			fc_gPromptService.alert(window, "FoxClocks", promptText);
		}
		else
		{				
			var promptText = document.getElementById("fc-dialog-import-success").getAttribute("label");
			FoxClocks_openSimpleInfo("FoxClocks", promptText);
		}
	},

	// ====================================================================================
	onExportCmd : function()
	{
		fc_gLogger.log("+FoxClocks::onExportCmd()");

		var dialogTitle = document.getElementById("fc-dialog-export-title").getAttribute("label");
		var foxClocksFilter = "*." + FC_FOXCLOCKS_SETTINGS_EXTENSION;
		var filterText = document.getElementById("fc-dialog-importexport-filter-label").getAttribute("label") +
			" (" + foxClocksFilter + ")";								

		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, dialogTitle, nsIFilePicker.modeSave);
		fp.defaultExtension = FC_FOXCLOCKS_SETTINGS_EXTENSION;
		fp.defaultString = "foxclocks." + FC_FOXCLOCKS_SETTINGS_EXTENSION;
		fp.appendFilter(filterText, foxClocksFilter);
		fp.appendFilters(nsIFilePicker.filterAll);
		
		var res = fp.show();
		
		if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace)
		{
			try
			{
				// AFM - well this is quite a mess. https://bugzilla.mozilla.org/show_bug.cgi?id=318086
				// Would like to be able to use nsIDOMSerializer.serializeToStream()
				//
				var doc = fc_gPrefManager.prefsToXml("foxclocks.", fc_gUtils.FC_URL_FOXCLOCKSHOME + "prefs",
									"prefs", fc_gUtils.getFoxClocksVersion());
					
				const CHARSET = "UTF-8";
				var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer);
				var xmlStr = fc_gUtils.FC_XML_DEC + serializer.serializeToString(doc, CHARSET);

				// AFM - write, create, truncate
				//
				var outStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					.createInstance(Components.interfaces.nsIFileOutputStream);
				outStream.init(fp.file, 0x02 | 0x08 | 0x20, 0664, 0);
	
				// AFM - do things in an i18n-safe way
				//		
				var outConvStream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
				                   .createInstance(Components.interfaces.nsIConverterOutputStream);
				
				outConvStream.init(outStream, CHARSET, 0, 0x0000);
				outConvStream.writeString(xmlStr);
				outConvStream.close();
				
				var promptText = document.getElementById("fc-dialog-export-success").getAttribute("label");
				FoxClocks_openSimpleInfo("FoxClocks", promptText);
			} 
			catch(ex) 
			{
				var promptText = document.getElementById("fc-dialog-export-failure").getAttribute("label") + ": " + ex;
				fc_gPromptService.alert(window, "FoxClocks", promptText);
			}
		}
		
		fc_gLogger.log("-FoxClocks::onExportCmd()");
	},
		
	// ====================================================================================
	onAddCmd : function(addAtIndex, reSort)
	{
		fc_gLogger.log("+FoxClocks::onAddCmd()");
												
		var rangeCount = this.zonePicker.view.selection.getRangeCount();
		var addedItems = new Array();
		
		var zonePickerLocMap = fc_gZoneManager.getZonePickerLocationMap();
		
		for (var i=0; i < rangeCount; i++)
		{
			var start = {};
			var end = {};
			this.zonePicker.view.selection.getRangeAt(i, start, end);
			for (var c = start.value; c != -1 && c <= end.value; c++)
			{
				var j = this.zonePicker.view.getItemAtIndex(c).getAttribute("value");
				if (j != null)
				{
					var watchlistItem = fc_gWatchlistManager.createItem(zonePickerLocMap[j]);
					addedItems.push(watchlistItem);
				}
			}
		}
		
		this.addToWatchlist(addedItems, addAtIndex);
		
		if (reSort != null && reSort == false)
		{
			// AFM - currently removes the sort marker even if the order hasn't changed
			//
			this.setWatchlistUnsorted();
		}
		else
		{
			this.sortWatchlist(); // AFM - re-sort
		}
			
		this.updateFoxClocksState(true);
				
		fc_gLogger.log("-FoxClocks::onAddCmd()");
	},
	
	// ====================================================================================
	onAddAsCmd : function()
	{		
		var location = this.getSelectedZonePickerLocation();
		if (!location)
			return;
		
		var watchlistItem = fc_gWatchlistManager.createItem(location);
		var retLocation = this.openZoneInfo(watchlistItem, "ADD_AS");			
			
		if (retLocation)
		{			
			watchlistItem.location = retLocation;
			
			var addedItems = new Array();
			addedItems.push(watchlistItem);
		
			this.addToWatchlist(addedItems);
			this.sortWatchlist(); // AFM - if we're sorting, re-sort
			this.updateFoxClocksState(true);
		}
	},
	
	// ====================================================================================
	onRemoveCmd : function()
	{
		fc_gLogger.log("+FoxClocks::onRemoveCmd()");
		
		var prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		var promptText = document.getElementById("fc-remove-confirm-label").getAttribute("label");  
		         
		var confirmEnabled = fc_gPrefManager.getPref("foxclocks.watchlist.remove.confirm.enabled");
		
		var result = confirmEnabled ? prompt.confirm(window, null, promptText) : true;
		
		if (result == false)
			return;
			
		var indexesToRemove = new Array();
											
		var rangeCount = this.watchlistTree.view.selection.getRangeCount();
		for (var i=0; i < rangeCount; i++)
		{
			var start = {};
			var end = {};
			this.watchlistTree.view.selection.getRangeAt(i, start, end);
			
			for (var c = start.value; c != -1 && c <= end.value; c++)
			{
				indexesToRemove.push(c);
			}
		}
			
		var watchlist = fc_gWatchlistManager.getWatchlist();
		var treeChildrenRoot = document.getElementById("fc-watchlist-treechildren-root");

		// AFM - suppress select events on the watchlistTree until watchlistTree and the watchlist are
		// synchronised - we get called back in updateFoxClocksState() (the onselect handler)
		// immediately after we set the suppressed flag back to false
		//
		this.watchlistTree.view.selection.selectEventsSuppressed = true;
		for (var i=indexesToRemove.length - 1; i >= 0; i--)
		{
			var indexToRemove = indexesToRemove[i];
			var item = this.watchlistTree.view.getItemAtIndex(indexToRemove);
			item.parentNode.removeChild(item); 
			watchlist[indexToRemove] = null;
		}
		
		// AFM - sorry about this
		//
		var j = 0;
				
		while (j < watchlist.length)
		{	
			if (watchlist[j] == null)
				watchlist.splice(j, 1);
			else
				j++;
		}
		
		this.watchlistTree.view.selection.selectEventsSuppressed = false;
					
		// this.updateFoxClocksState(true); - not necessary see above comment, but need to notify, since
		// onselect handler will not do this
		//
		this.notifyWatchlistUpdated();
		
		fc_gLogger.log("-FoxClocks::onRemoveCmd()");
	},
	
	// ====================================================================================
	onMoveUpCmd : function()
	{
		// AFM - we know only one item is selected and moving up is possible, saccess to the event is
		// disabled otherwise
		//
		var selectedItem = this.getSelectedWatchlistItem();
		var prevItem = selectedItem.previousSibling;
		this.swapWatchlistItems(prevItem, selectedItem);
		
		this.setWatchlistUnsorted();

		// AFM - reselect the selected item - the selection is lost moving up. This will trigger
		// this.updateFoxClocksState(false)
		//
		this.watchlistTree.view.selection.select(this.watchlistTree.view.getIndexOfItem(selectedItem));
		
		// AFM - need to notify, since onselect handler will not do this
		//
		this.notifyWatchlistUpdated();
	},
	
	// ====================================================================================
	onMoveDownCmd : function()
	{	
		// AFM - we know only one item is selected and moving down is possible, access to the event is
		// disabled otherwise
		//
		var selectedItem = this.getSelectedWatchlistItem();
		var nextItem = selectedItem.nextSibling;
		this.swapWatchlistItems(selectedItem, nextItem);
		
		this.setWatchlistUnsorted();
		this.updateFoxClocksState(true);
	},
	
	// ====================================================================================
	moveInWatchlist : function(moveToIndex)
	{
		// AFM - move selected items in the watchlist to moveToIndex
		//
		fc_gLogger.log("+FoxClocks::moveInWatchlist(): " + moveToIndex);
							
		var indexesToRemove = new Array();
		var itemsToAdd = new Array();
		var watchlist = fc_gWatchlistManager.getWatchlist();
			
		if (moveToIndex == null)
			moveToIndex = watchlist.length;
		
		var numSelectedAboveMoveToIndex = 0;								
		var rangeCount = this.watchlistTree.view.selection.getRangeCount();
		for (var i=0; i < rangeCount; i++)
		{
			var start = {};
			var end = {};
			this.watchlistTree.view.selection.getRangeAt(i, start, end);
			
			for (var c = start.value; c != -1 && c <= end.value; c++)
			{
				indexesToRemove.push(c);
				itemsToAdd.push(watchlist[c]);
				
				if (c < moveToIndex)
					numSelectedAboveMoveToIndex++;
			}
		}
	
		for (var i=indexesToRemove.length - 1; i >= 0; i--)
		{
			var indexToRemove = indexesToRemove[i];
			watchlist[indexToRemove] = null;
		}
		
		var j = 0;			
		while (j < watchlist.length)
		{	
			if (watchlist[j] == null)
				watchlist.splice(j, 1);
			else
				j++;
		}
		
		// AFM - adjust moveToIndex by the number of selected items above this index
		//
		var adjMoveToIndex = moveToIndex - numSelectedAboveMoveToIndex;
		for (var k=0; k < itemsToAdd.length; k++)
		{
			watchlist.splice(adjMoveToIndex + k, 0, itemsToAdd[k]);				
		}

		this.addToWatchlist(null); // AFM - rebuild
		this.setWatchlistUnsorted();
		this.updateFoxClocksState(true);
		
		fc_gLogger.log("-FoxClocks::moveInWatchlist()");
	},
	
	// ====================================================================================
	onWatchlistSelect : function() { this.updateFoxClocksState(false); },
	onOpenOptionsCmd : function() { FoxClocks_openOptionsWindow(); },
	onOpenAboutCmd : function() { FoxClocks_openAboutWindow(); },
	onSortWatchlist : function(event) { this.sortWatchlist(event); this.updateFoxClocksState(true); },
	
	// ====================================================================================
	onOpenLocDetailsCmd : function()
	{
		var locationItem = this.getSelectedWatchlistItem();
		if (locationItem == null)
			return;
			
		var locationIndex = this.watchlistTree.view.getIndexOfItem(locationItem);
		var watchlistItem = fc_gWatchlistManager.getItem(locationIndex);
		
		var retLocation = this.openZoneInfo(watchlistItem, "LOCATION");
		
		if (retLocation)
		{
			var oldName = watchlistItem.location.name;
					
			watchlistItem.location = retLocation;
			var newName = watchlistItem.location.name;
			
			// AFM - shortcut - don't need to regenerate whole watchlistTree
			//
			locationItem.firstChild.firstChild.setAttribute("label", newName);
						
			var sortResource = this.watchlistTree.getAttribute("sortResource");
			if (sortResource != null && sortResource == "fc_watchlist_col_location" && oldName != newName)
				this.sortWatchlist(); // AFM - re-sort
				
			this.updateFoxClocksState(true);
		}
	},
	
	// ====================================================================================
	onOpenLocGoogleEarthCmd : function()
	{
		var locationItem = this.getSelectedWatchlistItem();
		
		if (locationItem == null)
			return;
			
		var locationIndex = this.watchlistTree.view.getIndexOfItem(locationItem);
		this.openGoogleEarth(fc_gWatchlistManager.getItem(locationIndex).location);
	},
	
	// ====================================================================================
	onToggleBarClocksCmd : function()
	{
		fc_gLogger.log("+FoxClocks::onToggleBarClocksCmd()");
		
		var rangeCount = this.watchlistTree.view.selection.getRangeCount();
		for (var i=0; i < rangeCount; i++)
		{
			var start = {};
			var end = {};
			this.watchlistTree.view.selection.getRangeAt(i, start, end);
			
			for (var c = start.value; c != -1 && c <= end.value; c++)
			{
				var watchlistItem = fc_gWatchlistManager.getItem(c);
				watchlistItem.showClock_statusbar = !watchlistItem.showClock_statusbar;
			}
		}
		
		this.updateFoxClocksState(true);
		
		fc_gLogger.log("+FoxClocks::onToggleBarClocksCmd()");
	},
	
	// ====================================================================================
	onToggleBarFlagCmd : function()
	{
		fc_gLogger.log("+FoxClocks::onToggleBarFlagCmd()");
		
		var rangeCount = this.watchlistTree.view.selection.getRangeCount();
		for (var i=0; i < rangeCount; i++)
		{
			var start = {};
			var end = {};
			this.watchlistTree.view.selection.getRangeAt(i, start, end);
			
			for (var c = start.value; c != -1 && c <= end.value; c++)
			{
				var watchlistItem = fc_gWatchlistManager.getItem(c);
				watchlistItem.showClock_statusbarFlag = !watchlistItem.showClock_statusbarFlag;
			}
		}
		
		this.updateFoxClocksState(true);
		
		fc_gLogger.log("+FoxClocks::onToggleBarFlagCmd()");
	},
	
	// ====================================================================================
	onTimer : function(scope)
	{
		// fc_gLogger.log("+FoxClocks::onTimer()");
					
		if (scope == null)
			scope = this;
		
		var nowDate = new Date();		
		for (var j=0; j < scope.watchlistTree.view.rowCount; j++)
		{			
			var treeItem = scope.watchlistTree.view.getItemAtIndex(j);
			
			// AFM - historical - keeping around
			//
			if (treeItem.getAttribute("id") == "fc-watchlist-noitems-item")
				continue;
			
			var location = fc_gWatchlistManager.getItem(j).location;
			var timeText = scope.timeFormatter.getTimeString(location, nowDate);
			
			var timeCell = treeItem.firstChild.childNodes[1];
			timeCell.setAttribute("label", timeText);
		}
		
		// fc_gLogger.log("-FoxClocks::onTimer()");
	},
	
	// ====================================================================================
	// AFM - implementing nsIObserver
	//	
	observe : function(subject, topic, data)
	{
		if (topic == "foxclocks")
		{
			if (data == "engine:zone-data-update-complete")
			{
				if (subject.wrappedJSObject.lastUpdateResult.result == "OK_NEW")
				{
					this.populateZonePicker();
					this.populateWatchlist();
				}
			}
			else if (data == "engine:zone-picker-changed")
			{
				this.populateZonePicker();
			}
			else if (data == "engine:watchlist-changed");
			{
				this.populateWatchlist();
			}
		}
		else if (topic == "nsPref:changed")
		{
			switch (data)
			{
				case "foxclocks.format.foxclocks.standard": this.setTimeFormat(); break;
				case "foxclocks.format.foxclocks.custom": this.setTimeFormat(); break;
				case "foxclocks.clock.style": this.updateFoxClocksState(false); break;
			}
		}
		
		this.onTimer();
	},
	
	//
	// AFM - END, EVENTS
	
	// ====================================================================================
	populateWatchlist : function()
	{
		// AFM - completely regenerate watchlist, when driven by external notification
		// (eg importing settings), or on load
		// Sort state is not persisted as a preference, so to be safe we remove the sort marker
		//
		this.addToWatchlist(null);
		this.setWatchlistUnsorted();
		this.updateFoxClocksState(false);
	},
	
	// ====================================================================================
	populateZonePicker : function()
	{
		fc_gLogger.log("+FoxClocks::populateZonePicker()");
		
		var treeChildrenRoot = document.getElementById("fc-zonepicker-treechildren-root");
		
		while(treeChildrenRoot.hasChildNodes())
			treeChildrenRoot.removeChild(treeChildrenRoot.firstChild);
			
		var zpDoc = fc_gZoneManager.getZonePickerXmlDoc();
		var zpRoot = zpDoc.documentElement;
		
		for (var i=0; i < zpRoot.childNodes.length; i++)
		{
			this.populateZonePickerFromNode(treeChildrenRoot, zpRoot.childNodes[i]);
		}
			
		this.setZonePickerStates();
		
		fc_gLogger.log("-FoxClocks::populateZonePicker()");
	},
		
	// ====================================================================================
	populateZonePickerFromNode : function(parentTreeChildren, zpNode)
	{
		var zonePickerLocMap = fc_gZoneManager.getZonePickerLocationMap();	
		var nowDate = new Date();
	
		// fc_gLogger.log("FoxClocks::populateZonePickerFromNode(): " + zpNode.nodeName);		

		if (zpNode.nodeType != Node.ELEMENT_NODE)
			return;
			
		var zpNodeNameAtt = zpNode.getAttribute("name");
		
		if (zpNode.nodeName == "Leaf")
		{
			var leafId = zpNode.getAttribute("leaf_id");
		
			// AFM - this is a bad node, with no corresponding entry in zonePickerLocMap
			//	
			if (leafId == null)
				return; 
		
			var currLocation = zonePickerLocMap[leafId];
		
			var treeItem2 = document.createElement("treeitem");
			treeItem2.setAttribute("value", leafId); // AFM - to allow lookup of location from treeitem
			
			parentTreeChildren.appendChild(treeItem2);
			
			var cellCurrZoneLabel = currLocation.zone.currOffsetString(nowDate) +
				" (" + currLocation.zone.currName(nowDate) + ")";

			if (currLocation.zone.isDST(nowDate))
				cellCurrZoneLabel += this.ZP_DST_INDICATOR_STRING;
			
			var treeCellRegion = document.createElement("treecell");
			treeCellRegion.setAttribute("label", zpNodeNameAtt);

			var treeCellCurrZone = document.createElement("treecell");
			treeCellCurrZone.setAttribute("label", cellCurrZoneLabel);

			var treeRow2 = document.createElement("treerow");					
			treeRow2.appendChild(treeCellRegion);
			treeRow2.appendChild(treeCellCurrZone);
			
			treeItem2.appendChild(treeRow2);
				
			// AFM - set search text
			//
			var leafNodeSearchText = treeCellRegion.getAttribute("label");
			var currentUpperTreeItem = treeItem2.parentNode.parentNode;
			
			while (currentUpperTreeItem.nodeName == "treeitem")
			{
				leafNodeSearchText = leafNodeSearchText + ' ' + currentUpperTreeItem.firstChild.firstChild.getAttribute("label");
				currentUpperTreeItem = currentUpperTreeItem.parentNode.parentNode;
			}
			
			treeCellRegion.setAttribute("fc_searchtext", leafNodeSearchText.toLowerCase());
			// treeCellRegion.setAttribute("label", treeCellRegion.getAttribute("fc_searchtext"));
		}
		else if (zpNode.nodeName == "Branch")
		{
			var childTreeChildren = document.createElement("treechildren");
			
			var treeItem1 = document.createElement("treeitem");
			treeItem1.setAttribute("container", "true");
			
			parentTreeChildren.appendChild(treeItem1);
			
			var treeCell1 = document.createElement("treecell");
			treeCell1.setAttribute("label", zpNodeNameAtt);
			
			var treeRow1 = document.createElement("treerow");
			
			treeRow1.appendChild(treeCell1);
			treeItem1.appendChild(treeRow1);
			treeItem1.appendChild(childTreeChildren);
			
			for (var j=0; j < zpNode.childNodes.length; j++)
			{
				this.populateZonePickerFromNode(childTreeChildren, zpNode.childNodes[j]);
			}
		}
	},

	// ====================================================================================
	onZonePickerSearchFocus : function()
	{
		// AFM - just a nasty have to keep the 'no-match' class around
		//
		this.searchBox.setAttribute("class", "fc-zonepicker-searchbox-active " +
			this.searchBox.getAttribute("class"));
		
		if (this.searchBox.value == this.searchBox.getAttribute("fc_init_value"))
			this.searchBox.value = "";
	},
	
	// ====================================================================================
	onZonePickerSearchBlur : function()
	{		
		if (this.searchBox.value == "")
		{
			this.searchBox.value = this.searchBox.getAttribute("fc_init_value");
			this.searchBox.setAttribute("class", "fc-zonepicker-searchbox-inactive");
		}
	},
	
	// ====================================================================================
	onZonePickerSearchInput : function()
	{
		// fc_gLogger.log("+FoxClocks::onZonePickerSearchInput()");
		
		var inputSearchText = this.searchBox.value.replace(/(^\s+|\s+$)/g, '').toLowerCase();
		var zpTreeItems = document.getElementById("fc-zonepicker-treechildren-root").childNodes;
		var containerStack = new Array();
		var containerStacksToOpen = new Array();
		
		for (var i = 0; i < zpTreeItems.length; i++)
		{
			this.searchZonePickerNode(zpTreeItems[i], inputSearchText, containerStack, containerStacksToOpen);
		}
	
		if (containerStacksToOpen.length <= FC_FOXCLOCKS_SEARCH_MAX_OPEN_NODES)
		{
			for (var k = 0; k < containerStacksToOpen.length; k++)
			{	
				var containerStack = containerStacksToOpen[k];
				for (var j = 0; j < containerStack.length; j++)
				{
					var containerItem = containerStack[j];
					var containerItemIndex = this.zonePicker.view.getIndexOfItem(containerItem);
					
					if (containerItemIndex != -1 && this.zonePicker.view.isContainer(containerItemIndex) &&
							this.zonePicker.view.isContainerOpen(containerItemIndex) == false)
					{
		         		this.zonePicker.view.toggleOpenState(containerItemIndex);
		         		// fc_gLogger.log("FoxClocks::onZonePickerSearchInput(): opened <" + containerItem.firstChild.firstChild.getAttribute("label") + ">");
		         	}
				}
			}
		}
		else
		{
			fc_gLogger.log("FoxClocks::onZonePickerSearchInput(): containerStacksToOpen.length is <" + containerStacksToOpen.length + ">");
		}
	
		var allNodesHidden = true;
		for (var l = 0; allNodesHidden == true && l < zpTreeItems.length; l++)
		{
			if (this.zonePicker.view.getIndexOfItem(zpTreeItems[l]) != -1)
				allNodesHidden = false;
		}
		
		if (allNodesHidden)
		{
			this.searchBox.setAttribute("class", "fc-zonepicker-searchbox-no-match");
		}
		else
		{
			this.searchBox.setAttribute("class", "fc-zonepicker-searchbox-active");
		}
			   	
		// fc_gLogger.log("-FoxClocks::onZonePickerSearchInput(): inputSearchText <" + inputSearchText + ">");
	},
	
	// ====================================================================================
	searchZonePickerNode : function(treeItem, inputSearchText, containerStack, containerStacksToOpen)
	{
		// fc_gLogger.log("+FoxClocks::searchZonePickerNode()");	
	
		var shouldShow = false;
		
		if (treeItem.getAttribute("container") == "true")
		{	
			containerStack.push(treeItem);
			
			var childTreeItems = treeItem.lastChild.childNodes;
			for (var i = 0; i < childTreeItems.length; i++)
			{
				if (this.searchZonePickerNode(childTreeItems[i], inputSearchText, containerStack, containerStacksToOpen) == true)
					shouldShow = true;
			}
		}
		else
		{	
			var cellSearchText = treeItem.firstChild.firstChild.getAttribute("fc_searchtext");
		
			if (inputSearchText == '' || cellSearchText.indexOf(inputSearchText) != -1)
			{ 	         	
				shouldShow = true;
				containerStacksToOpen.push(containerStack);
         		
				// if (inputSearchText.length > 3)
				//	fc_gLogger.log("FoxClocks::searchZonePickerNode(): inputSearchText <" + inputSearchText + "> matches <" + cellSearchText + ">");
			}
		}
												
		if (shouldShow)
			treeItem.removeAttribute("hidden");
		else
			treeItem.setAttribute("hidden", "true");
		
		// fc_gLogger.log("-FoxClocks::searchZonePickerNode()");
		
		return shouldShow;
	},
	
	// ====================================================================================
	addToWatchlist : function(addedItems, addAtIndex)
	{
		// AFM - addedItems == null => rebuild from fc_gWatchlistManager.getWatchlist()
		// addAtIndex == null => add to end of list
		//
		fc_gLogger.log("+FoxClocks::addToWatchlist()");
		
		// AFM - to prevent modifying the tree triggering multiple select events; we get one
		// onselect event just after we unsuppress
		//
		this.watchlistTree.view.selection.selectEventsSuppressed = true;
	
		var watchlist = fc_gWatchlistManager.getWatchlist();	
		var treeChildrenRoot = document.getElementById("fc-watchlist-treechildren-root");
		var itemsToAdd = addedItems;
		var rebuild = addedItems == null;
		
		if (rebuild)
		{
			while (treeChildrenRoot.hasChildNodes())
				treeChildrenRoot.removeChild(treeChildrenRoot.firstChild);
				
			itemsToAdd = watchlist;
		}
		
		var insertBeforeNode = addAtIndex != null ? treeChildrenRoot.childNodes[addAtIndex] : null;

		for (var i=0; itemsToAdd != "" && i < itemsToAdd.length; i++)
		{
			var currItemToAdd = itemsToAdd[i];
			
			var locationCell = document.createElement("treecell");
			locationCell.setAttribute("label", currItemToAdd.location.name);													
															
			var treeRow = document.createElement("treerow");
			treeRow.appendChild(locationCell);
			treeRow.appendChild(document.createElement("treecell"));
					
			var treeItem = document.createElement("treeitem");
			treeItem.setAttribute("value", currItemToAdd.location.zone.id);
			treeItem.appendChild(treeRow);

			if (insertBeforeNode != null)
			{
				treeChildrenRoot.insertBefore(treeItem, insertBeforeNode);
				
				if (!rebuild) // AFM - genuinely inefficient
					watchlist.splice(addAtIndex + i, 0, currItemToAdd);
			}
			else
			{
				treeChildrenRoot.appendChild(treeItem);	

				if (!rebuild)
					watchlist.push(currItemToAdd);
			}				
		}
		
		this.watchlistTree.view.selection.selectEventsSuppressed = false;
		fc_gLogger.log("-FoxClocks::addToWatchlist()");
	},

	// ====================================================================================
	getSupportedFlavours : function()
	{
		// AFM - we could be observing drags from the Watchlist or ZonePicker, so we
		// can't rule out any flavours yet - this is done in onDragOver()
		//
		var flavours = new FlavourSet();
		flavours.appendFlavour("foxclocks/watchlist");
		flavours.appendFlavour("foxclocks/zonepicker");
		return flavours;
	},

	// ====================================================================================
	onDragStart: function(event, transferData, action)
	{
		fc_gLogger.log("+FoxClocks::onDragStart()");

		var evtTargetId = event.target.getAttribute("id");		
		var flavour = "unknown";

		if (evtTargetId == "fc-watchlist-treechildren-root")
			flavour = "foxclocks/watchlist";
		else if (evtTargetId == "fc-zonepicker-treechildren-root")
			flavour = "foxclocks/zonepicker";
			
		transferData.data = new TransferData();
		transferData.data.addDataForFlavour(flavour, flavour); // AFM drop data is just the flavour again
	
		fc_gLogger.log("-FoxClocks::onDragStart(): " + flavour);
	},
	
	// ====================================================================================
	onDragOver: function(event, flavour, session)
	{
		// fc_gLogger.log("+FoxClocks::onDragOver(): " + event.target.getAttribute("id"));
		
		this.removeDropIndicator();
		this.watchlistDropAtIndex = null;
		
		session.canDrop = false; // AFM - unless we can show otherwise
		
		// AFM - Watchlist row we're currently over
		//
		var row = {}, col = {}, childElt = {};

		// AFM - handle weird Firefox 3.1 beta bug
		//
		if (this.watchlistTree.boxObject == null || this.watchlistTree.boxObject.getCellAt == null)
		{
			fc_gLogger.log("FoxClocks::onDragOver(): getCellAt() not available");
			session.canDrop = true;
			return;
		}
		
		this.watchlistTree.boxObject.getCellAt(event.clientX, event.clientY, row, col, childElt);
			    					
		var fromWatchlist = flavour.contentType == "foxclocks/watchlist";
		var toWatchlist = event.target.getAttribute("id") == "fc-watchlist-treechildren-root";
	
		// AFM - can't drag from ZonePicker to ZonePicker. Need to look at the selection count
		// if dragging from the ZonePicker, since a drag can start by dragging a ZP branch
		//
		if (!fromWatchlist && toWatchlist && this.zonePicker.view.selection.count > 0)
		{
			session.canDrop = true;
		}
		else if (fromWatchlist && toWatchlist && this.watchlistTree.view.selection.count > 0)
		{
			const disallowDropOnSelectedRow = true; // AFM - configuration
			if (disallowDropOnSelectedRow)
			{
				// AFM - disallow drop on any selected row
				//
				var mouseOverRowIsSelected = false;
				
				var rangeCount = this.watchlistTree.view.selection.getRangeCount();
				for (var i=0; i < rangeCount && mouseOverRowIsSelected == false; i++)
				{
					var start = {};
					var end = {};
					this.watchlistTree.view.selection.getRangeAt(i, start, end);
					
					for (var c = start.value; c != -1 && c <= end.value && mouseOverRowIsSelected == false; c++)
					{
					    if (row.value == c)
							mouseOverRowIsSelected = true;
					}
				}
		
				if (mouseOverRowIsSelected == false)
					session.canDrop = true;
			}
			else
			{
				session.canDrop = true;
			}			
		}
		else if (fromWatchlist && !toWatchlist && this.watchlistTree.view.selection.count > 0)
		{
			session.canDrop = true;
		}
		
		// AFM - we're dragging over Watchlist - figure out which rows to drop between
		//
		if (toWatchlist && session.canDrop)
		{			
			var locationItem = null;
			var locationItemDropBelow = null;
			var treeChildrenRoot = document.getElementById("fc-watchlist-treechildren-root");
			
			if (row.value == -1)
			{
				// AFM - we're not over any row, so we're dropping at the end
				//
				this.watchlistDropAtIndex = null;
				
				if (treeChildrenRoot.childNodes.length > 0)
				{
					locationItem = treeChildrenRoot.lastChild;
					locationItemDropBelow = true;
				}				
			}
			else
			{
				// AFM - get treecell of row we're currently over
				//
				var x_unused = {}, rowY = {}, width_unused = {}, rowHeight = {};
				this.watchlistTree.boxObject.getCoordsForCellItem(row.value, col.value, "text", x_unused, rowY, width_unused, rowHeight);
				
				locationItem = this.watchlistTree.view.getItemAtIndex(row.value);
			
				// AFM - y coord of mouse relative to the treechildren root
				//
				var relaClientY = event.clientY - treeChildrenRoot.boxObject.y;
	
				if (relaClientY >= rowY.value + rowHeight.value/2)
				{
					locationItemDropBelow = true;
					
					if (row.value < treeChildrenRoot.childNodes.length - 1)
						this.watchlistDropAtIndex = row.value + 1;
					else
						this.watchlistDropAtIndex = null;
				}
				else
				{
					locationItemDropBelow = false;
					this.watchlistDropAtIndex = row.value;
				}
			}
			
			if (locationItem != null && locationItemDropBelow != null)
			{
				// AFM - style the row to indicate where we would drop - try to use 'above' style if possible,
				// to avoid possible transition effects going from eg bottom half of one item to the top
				// half of the next. Should have read http://www.xulplanet.com/tutorials/xultu/treestyle.html
				// before I did this, but in fact dropBefore and dropAfter don't seem to work automatically...
				//
				if (locationItemDropBelow == true)
				{
					if (locationItem.nextSibling != null)
						locationItem.nextSibling.firstChild.setAttribute("properties", "foxclocks-drop-above");
					else
						locationItem.firstChild.setAttribute("properties", "foxclocks-drop-below");
				}
				else
				{
					locationItem.firstChild.setAttribute("properties", "foxclocks-drop-above");
				}
			}
		}
		
		// fc_gLogger.log("-FoxClocks::onDragOver(): " +
		// this.watchlistTree.view.selection.count + " " +
		// flavour.contentType + " " + event.target.getAttribute("id"));	
	},
	
	// ====================================================================================
	onDragExit: function(event, session)
	{
		fc_gLogger.log("+FoxClocks::onDragExit()");
		
		this.removeDropIndicator();
		
		fc_gLogger.log("-FoxClocks::onDragExit()");	
	},
	
	// ====================================================================================
	onDrop: function(event, dropdata, session)
	{
		fc_gLogger.log("+FoxClocks::onDrop()");

		this.removeDropIndicator(); // AFM - before we modify the Watchlist
		
		var fromWatchlist = dropdata.data == "foxclocks/watchlist";
		var toWatchlist = event.target.getAttribute("id") == "fc-watchlist-treechildren-root";
			
		if (!fromWatchlist && toWatchlist)
			this.onAddCmd(this.watchlistDropAtIndex, false);
		else if (fromWatchlist && !toWatchlist)
			this.onRemoveCmd();
		else if (fromWatchlist && toWatchlist)
			this.moveInWatchlist(this.watchlistDropAtIndex);

		this.watchlistDropAtIndex = null;
		
		fc_gLogger.log("-FoxClocks::onDrop()");
	},

	
	// ====================================================================================
	removeDropIndicator: function()
	{
		// fc_gLogger.log("+FoxClocks::removeDropIndicator()");
			
		// AFM - subtle, clever stuff - blow away all possible 'where we would drop' styles
		//
		if (this.watchlistDropAtIndex != null)
		{			
			var locationItem = this.watchlistTree.view.getItemAtIndex(this.watchlistDropAtIndex);
			locationItem.firstChild.removeAttribute("properties");
			
			if (locationItem.nextSibling != null)
				locationItem.nextSibling.firstChild.removeAttribute("properties");
		}
		else
		{
			var treeChildrenRoot = document.getElementById("fc-watchlist-treechildren-root");

			if (treeChildrenRoot.childNodes.length > 0)
				treeChildrenRoot.lastChild.firstChild.removeAttribute("properties");
		}
		
		// fc_gLogger.log("-FoxClocks::removeDropIndicator()");	
	},
	
	// ====================================================================================
	sortWatchlist : function(event)
	{
		// AFM - return code currently meaningless
		//	
		fc_gLogger.log("+FoxClocks::sortWatchlist()");

		var reSort = event == null;
		var sortResource = this.watchlistTree.getAttribute("sortResource");

		if (reSort && sortResource == "") // AFM - re-sorting, but nothing to sort by
			return false;
			
		var column = reSort ? document.getElementById(sortResource) : event.target;
		var colId = column.getAttribute("id");
		var colSortDir = column.getAttribute("sortDirection");
		
		if (reSort)
		{
			newSortDir = colSortDir;
		}
		else
		{
			// AFM - (no sort -> ascending -> descending)
			//
	
			if (colSortDir == "descending")
			{
				this.setWatchlistUnsorted();
				return false;
			}
	
			var newSortDir = colSortDir == "ascending" ? "descending" : "ascending";
		}
		
		var currDate = new Date();
									
		function columnSort(aa, bb)
		{	
			function nameSort(a, b) {
				var aLower = a.location.name.toLowerCase();
				var bLower = b.location.name.toLowerCase();
				
				return	aLower > bLower ? 1 : (aLower == bLower ? 0 : -1); }
					
			function timeSort(a, b) {
				return	a.location.zone.currDisplayDate(currDate) -
						b.location.zone.currDisplayDate(currDate); }
					
			var a = newSortDir == "ascending" ? aa : bb;
			var b = newSortDir == "ascending" ? bb : aa;
			
			var primarySort = colId == "fc_watchlist_col_location" ? nameSort : timeSort;
			var secondarySort = colId == "fc_watchlist_col_location" ? timeSort : nameSort;
			
			var retVal = primarySort(a, b);
			if (retVal == 0)
				retVal = secondarySort(aa, bb); // always ascending
				
			return retVal;
		}	
		
		var cols = this.watchlistTree.getElementsByTagName("treecol");
		for (var i = 0; i < cols.length; i++)
		{
			cols[i].removeAttribute("sortDirection");
		}
		
		column.setAttribute("sortDirection", newSortDir);
		this.watchlistTree.setAttribute("sortResource", colId);
		
		fc_gWatchlistManager.getWatchlist().sort(columnSort);
		this.addToWatchlist(null); // AFM - rebuild watchlistTree - no notifications

		fc_gLogger.log("-FoxClocks::sortWatchlist(): " + newSortDir);
		
		return false;
	},		
	
	// ====================================================================================
	setWatchlistUnsorted : function()
	{
		var cols = this.watchlistTree.getElementsByTagName("treecol");
		for (var i = 0; i < cols.length; i++)
		{
			cols[i].removeAttribute("sortDirection");
		}
		
		this.watchlistTree.removeAttribute("sortResource");
	},
	
	// ====================================================================================
	setTimerInterval : function()
	{
		if (this.hTimer != null)
			window.clearInterval(this.hTimer);
			
		this.hTimer = window.setInterval(this.onTimer, fc_gUtils.FC_CLOCK_UPDATE_INTERVAL, this);
	},
	
	// ====================================================================================
	setTimeFormat : function()
	{
		var standardFormat = fc_gPrefManager.getPref("foxclocks.format.foxclocks.standard");
		var customFormat = fc_gPrefManager.getPref("foxclocks.format.foxclocks.custom");
										
		this.timeFormatter.setTimeFormat(standardFormat == "" ? customFormat : standardFormat);
	},
	
	// ====================================================================================
	notifyWatchlistUpdated : function()
	{		
		// AFM - we don't want to respond to our own update
		//
		fc_gObserverService.removeObserver(this, "foxclocks");
		fc_gWatchlistManager.setUpdated();
		fc_gObserverService.addObserver(this, "foxclocks", false);
	},
	
	// ====================================================================================
	getTreeChildrenId : function(index, array) { return "fc-zonepicker-treechildren:" + array.slice(0, index + 1).join(""); },
	
	// ====================================================================================
	getSelectedZonePickerLocation: function()
	{
		if (this.zonePicker.view.selection.count != 1)
			return null;
			
		var start = {};
		var end = {};
		this.zonePicker.view.selection.getRangeAt(0, start, end);

		var zoneItem = this.zonePicker.view.getItemAtIndex(start.value);
		
		if (zoneItem.getAttribute("container") == "true")
			return null;

		return fc_gZoneManager.getZonePickerLocationMap()[zoneItem.getAttribute("value")];
	},
	
	// ====================================================================================
	getSelectedWatchlistItem : function()
	{
		if (this.watchlistTree.view.selection.count == 1)
		{
			var start = {};
			var end = {};
			this.watchlistTree.view.selection.getRangeAt(0, start, end);

			return this.watchlistTree.view.getItemAtIndex(start.value);
		}
		
		return null;
	},
	
	// ====================================================================================
	openZoneInfo : function(watchlistItem, mode)
	{
		var retVals = {location: null};
		
		window.openDialog(	"chrome://foxclocks/content/zoneinfo.xul", "",
							"chrome,modal,centerscreen,resizable=yes",
							this.timeFormatter, mode, watchlistItem, retVals);
							
		return retVals.location;
	},
	
	// ====================================================================================
	openGoogleEarth : function(location)
	{					
		try
		{
			fc_gUtils.openGoogleEarth(location);
		}
		catch (ex)
		{
			var errorMsg = document.getElementById("foxclocks-bundle").getString("misc.msg.googleeartherror");
			fc_gPromptService.alert(window, "FoxClocks", errorMsg + ": " + ex);
		}
	},

	// ====================================================================================
	setZonePickerStates : function()
	{
		// AFM - enable/disable things that depend on what's selected in the zone picker
		//
		
		fc_gLogger.log("+FoxClocks::setZonePickerStates()");
		
		var location = this.getSelectedZonePickerLocation();
		
		FoxClocks_DisableId("cmd_fc_add", this.zonePicker.view.selection.getRangeCount() == 0);
		FoxClocks_DisableId("cmd_fc_addas", location == null);
		FoxClocks_DisableId("cmd_fc_zonedetails", location == null);
		
		FoxClocks_DisableId("cmd_fc_zonegoogleearth",
				location == null || location.getLatitude() == null || location.getLongitude() == null);
		
		fc_gLogger.log("-FoxClocks::setZonePickerStates()");
	},
	
	// ====================================================================================
	updateFoxClocksState : function(notifyWatchlistChanged)
	{
		// AFM - not an intuitive name. GUI changes dependent on changes to the watchlist
		// (cf setZonePickerStates()
		//
		fc_gLogger.log("+FoxClocks::updateFoxClocksState()");
				
		var selectedCount = this.watchlistTree.view.selection.count;
		var selectedItem = this.getSelectedWatchlistItem();
		var selectedIndex = selectedItem ? this.watchlistTree.view.getIndexOfItem(selectedItem) : null;
		var prevItem = selectedItem ? selectedItem.previousSibling : null;
		var nextItem = selectedItem ? selectedItem.nextSibling : null;
			
		FoxClocks_DisableId("cmd_fc_moveup", (prevItem == null));
		FoxClocks_DisableId("cmd_fc_movedown", (nextItem == null));
		FoxClocks_DisableId("cmd_fc_remove", (selectedCount == 0));	
		FoxClocks_DisableId("cmd_fc_locdetails", (selectedItem == null));
		FoxClocks_DisableId("cmd_fc_toggle_bar_clocks", (selectedCount == 0));
		
		var location = selectedItem ? fc_gWatchlistManager.getItem(selectedIndex).location : null;
		FoxClocks_DisableId("cmd_fc_locgoogleearth",
				location == null || location.getLatitude() == null || location.getLongitude() == null);
		
		if (notifyWatchlistChanged) // AFM - typically want to do this
			this.notifyWatchlistUpdated();
			
		this.onTimer();
		
		fc_gLogger.log("-FoxClocks::updateFoxClocksState()");
	},		
	
	// ====================================================================================
	swapWatchlistItems : function(firstItem, secondItem)
	{
		var firstLocationIndex = this.watchlistTree.view.getIndexOfItem(firstItem);
		var secondLocationIndex = this.watchlistTree.view.getIndexOfItem(secondItem);

		fc_gLogger.log("FoxClocks::swapWatchlistItems(): " + firstLocationIndex + " " + secondLocationIndex);
		
		var firstWatchlistItem = fc_gWatchlistManager.getItem(firstLocationIndex);
		var secondWatchlistItem = fc_gWatchlistManager.getItem(secondLocationIndex);
		
		fc_gWatchlistManager.setItem(firstLocationIndex, secondWatchlistItem);
		fc_gWatchlistManager.setItem(secondLocationIndex, firstWatchlistItem);
		
		// AFM - swap items in watchlistTree
		//
		document.getElementById("fc-watchlist-treechildren-root").insertBefore(secondItem, firstItem);
	}
}