/**
 * Locate In Bookmarks Folders.
 * Methods pertaining to BookmarksPanel.
 *
 * @author Alex Muntean [http://alex.muntean.name/]
 * @see chrome://browser/content/bookmarks/bookmarks.js
 */

var libfOverlayBP = {
	core: null,
	bookmarksView: null,
	searchBox: null,

	/**
	 * Listener for the "load" event of "main-window".
	 */
	onload: function(aEvent) {
		setTimeout("window.removeEventListener('load', libfOverlayBP.onload, false)", 0);

		var mainWin = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
		libfOverlayBP.core = mainWin.libf;

		libfOverlayBP.bookmarksView = document.getElementById("bookmarks-view");
		libfOverlayBP.searchBox = document.getElementById("search-box");

		BookmarksCommand.libfOrgCreateContextMenu = BookmarksCommand.createContextMenu;
		BookmarksCommand.createContextMenu = libfOverlayBP.createContextMenu;
	},

	/**
	 * Replacement for BookmarksCommand.createContextMenu().
	 * It calls the original method and then adds our menu items.
	 */
	createContextMenu: function(aEvent, aSelection, aDS) {
		try {
			BookmarksCommand.libfOrgCreateContextMenu(aEvent, aSelection, aDS);

			if (!libfOverlayBP.core.isValidBookmark(aSelection))
				return;

			var popup = aEvent.target;
			var locateMenuItem = libfOverlayBP.core.createMenuItem(window,
				"libf_MenuItem_label",
				"libf_MenuItem_accesskey",
				"libfLocateMenuItem",
				"libfOverlayBP.locateInFolders('" + aSelection.item[0].Value + "')");
			var menuSeparators = popup.getElementsByTagName("menuseparator");
			var lastMenuSeparator = menuSeparators[menuSeparators.length-1];
			popup.insertBefore(locateMenuItem, lastMenuSeparator);
		}
		catch (e) {
			libfOverlayBP.core.log(e.message, e.fileName, null, e.lineNumber, null, 2, e.name);
		}
	},

	/**
	 * Locates a resource in the BookmarksPanel's "bookmarks-view" tree.
	 *
	 * @param aResource		a nsIRDFResource
	 */
	locateInFolders: function(aResource) {
		var rsrc = RDF.GetResource(aResource);

		// reset the data source of bookmarksView to its original "ref"
		libfOverlayBP.bookmarksView.tree.setAttribute("ref", "NC:BookmarksRoot");

		// locate the selected resource in the bookmarksView tree
		libfOverlayBP.bookmarksView.selectResource(rsrc);
		libfOverlayBP.bookmarksView.tree.treeBoxObject.ensureRowIsVisible(libfOverlayBP.bookmarksView.tree.currentIndex);

		// clear the value of the searchBox - this will NOT trigger bookmarksView.searchBookmarks(searchBox.value)
		libfOverlayBP.searchBox.value = "";
	}
};

window.addEventListener("load", libfOverlayBP.onload, false);
