/**
 * Locate In Bookmarks Folders.
 * General-purpose methods.
 *
 * @author Alex Muntean [http://alex.muntean.name/]
 * @see chrome://browser/content/bookmarks/bookmarks.js
 */

var libf = {
	consoleService: null,
	scriptError: null,
	stringBundle: null,

	/**
	 * Listener for the "load" event of "bookmark-window" and "main-window".
	 */
	onload: function(aEvent) {
		setTimeout("window.removeEventListener('load', libf.onload, false)", 0);

		libf.consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		libf.scriptError = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
		libf.stringBundle = document.getElementById("libfStringBundle");
	},

	/**
	 * Checks if aSelection is a valid Bookmark.
	 */
	isValidBookmark: function(aSelection) {
		return	aSelection &&
				(aSelection.length == 1) &&
				(aSelection.item[0] instanceof Components.interfaces.nsIRDFResource) &&
				(aSelection.type == 'Bookmark');
	},

	/**
	 * Returns the parent of aResource.
	 *
	 * @param aResource		a nsIRDFResource
	 * @return				a nsIRDFResource that is the parent of (points to) aResource
	 */
	getParent: function(aResource) {
		var parent = null;

		var arcsIn = BMDS.ArcLabelsIn(aResource);
		while (arcsIn.hasMoreElements()) {
			var arc = arcsIn.getNext();
			if (arc instanceof Components.interfaces.nsIRDFResource) {
				if (RDFCU.IsOrdinalProperty(arc)) {
					parent = BMDS.GetSource(arc, aResource, true);
					break;
				}
			}
		}

		return parent;
	},

	/**
	 * Selects and brings-into-view a folder from aTree.
	 *
	 * @param aFolder		a nsIDFResource
	 * @param aTree			a XUL tree
	 */
	selectFolder: function(aFolder, aTree) {
		var selObj = aTree.treeBoxObject.view.selection;
		selObj.selectEventsSuppressed = true;
		selObj.clearSelection();
		aTree.selectResource(aFolder);
		aTree.treeBoxObject.ensureRowIsVisible(aTree.currentIndex);
		selObj.selectEventsSuppressed = false;
	},

	/**
	 * Creates and returns a menu item with the attributes passed as arguments.
	 */
	createMenuItem: function(aWindow, aLabelId, aAccessKeyId, aId, aCommand) {
		var menuItem = aWindow.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
		menuItem.setAttribute("label", libf.stringBundle.getString(aLabelId));
		menuItem.setAttribute("accesskey", libf.stringBundle.getString(aAccessKeyId));
		menuItem.setAttribute("id", aId);
		menuItem.setAttribute("oncommand", aCommand);
		return menuItem;
	},

	/**
	 * Traces the internal structure of an object to the console.
	 */
	trace: function(msg, aObj) {
		var s = msg;
		for (var p in aObj) {
			try {
				s += p + ": " + aObj[p] + "\n";
			}
			catch (e) {
				s += p + ": <Unimplemented>\n";
			}
		}
		dump(s);
	},

	/**
	 * Logs an exception to the JavaScript Console.
	 * @param aMessage		the string to be logged. You must provide this.
	 * @param aSourceName	the URL of file with error. This will be a hyperlink in the JS Console, so you'd better use a real URL.
	 * @param aSourceLine	the line aLineNumber from aSourceName file.
	 * @param aLineNumber	together with aColumnNumber, specify the exact location of error.
	 * @param aColumnNumber	used to draw the arrow pointing to the problem character.
	 * @param aFlags		one of flags declared in nsIScriptError. Possible values: nsIScriptError.errorFlag = 0,
	 *						nsIScriptError.warningFlag = 1, nsIScriptError.exceptionFlag = 2 and nsIScriptError.strictFlag = 4.
	 * @param aCategory		a string indicating what kind of code caused the message.
	 */
	log: function (aMessage, aSourceName, aSourceLine, aLineNumber, aColumnNumber, aFlags, aCategory) {
		libf.scriptError.init(aMessage, aSourceName, aSourceLine, aLineNumber, aColumnNumber, aFlags, aCategory);
		libf.consoleService.logMessage(libf.scriptError);
	}
};

window.addEventListener("load", libf.onload, false);
