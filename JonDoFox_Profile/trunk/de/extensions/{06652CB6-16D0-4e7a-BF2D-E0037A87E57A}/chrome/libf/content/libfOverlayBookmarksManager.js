/**
 * Locate In Bookmarks Folders.
 * Methods pertaining to BookmarksManager.
 *
 * @author Alex Muntean [http://alex.muntean.name/]
 * @see chrome://browser/content/bookmarks/bookmarks.js
 */

var libfOverlayBM = {
	core: null,
	btnLocate: null,
	bookmarksView: null,
	treeView: null,
	selection: null,

	/**
	 * Listener for the "load" event of "bookmark-window" and "main-window".
	 */
	onload: function(aEvent) {
		setTimeout("window.removeEventListener('load', libfOverlayBM.onload, false)", 0);

		var mainWin = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
		libfOverlayBM.core = mainWin.libf;

		libfOverlayBM.btnLocate = document.getElementById("libf-button");

		libfOverlayBM.bookmarksView = document.getElementById("bookmarks-view");
		libfOverlayBM.bookmarksView.addEventListener("select", libfOverlayBM.onBMSelected, false);

		libfOverlayBM.treeView = document.getElementById("bookmark-folders-view");

		BookmarksCommand.libfOrgCreateContextMenu = BookmarksCommand.createContextMenu;
		BookmarksCommand.createContextMenu = libfOverlayBM.createContextMenu;

		// simulate the "select" event of the "bookmarks-view" tree in order to proper set the state
		// of "btnLocate" when the BookmarksManager loads
		libfOverlayBM.onBMSelected({target:libfOverlayBM.bookmarksView});
	},

	/**
	 * Listener for the "select" event of the "bookmarks-view" tree.
	 */
	onBMSelected: function(aEvent) {
		libfOverlayBM.selection = aEvent.target.getTreeSelection();
		libfOverlayBM.btnLocate.disabled = !libfOverlayBM.core.isValidBookmark(libfOverlayBM.selection);
	},

	/**
	 * Handler for the "oncommand" event of "libf-button".
	 */
	libfButtonClicked: function() {
		libfOverlayBM.locateInFolders(libfOverlayBM.selection.item[0].Value);
	},

	/**
	 * Replacement for BookmarksCommand.createContextMenu().
	 * It calls the original method and then adds our menu items.
	 */
	createContextMenu: function(aEvent, aSelection, aDS) {
		try {
			BookmarksCommand.libfOrgCreateContextMenu(aEvent, aSelection, aDS);

			if (!libfOverlayBM.core.isValidBookmark(aSelection))
				return;

			var popup = aEvent.target;
			var locateMenuItem = libfOverlayBM.core.createMenuItem(window,
				"libf_MenuItem_label",
				"libf_MenuItem_accesskey",
				"libfLocateMenuItem",
				"libfOverlayBM.locateInFolders('" + aSelection.item[0].Value + "')");
			var menuSeparators = popup.getElementsByTagName("menuseparator");
			var lastMenuSeparator = menuSeparators[menuSeparators.length-1];
			popup.insertBefore(locateMenuItem, lastMenuSeparator);
		}
		catch (e) {
			libfOverlayBM.core.log(e.message, e.fileName, null, e.lineNumber, null, 2, e.name);
		}
	},

	/**
	 * Locates a resource in the BookmarksManager's "bookmark-folders-view" tree.
	 *
	 * @param aResource		a nsIRDFResource
	 */
	locateInFolders: function(aResource) {
		var rsrc = RDF.GetResource(aResource);

		libfOverlayBM.core.selectFolder(libfOverlayBM.core.getParent(rsrc), libfOverlayBM.treeView);
		libfOverlayBM.bookmarksView.selectResource(rsrc);
	}
};

window.addEventListener("load", libfOverlayBM.onload, false);
