/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Temporary Inbox.
 *
 * The Initial Developer of the Original Code is
 * Christian Frank & Pascal Beyeler.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */

window.addEventListener("load", temporaryinbox_init, false); 


function temporaryinbox_init() {
	var menu = document.getElementById("contentAreaContextMenu");
	menu.addEventListener("popupshowing",temporaryinbox_setDisplay,false);
}

function temporaryinbox_setDisplay() {

	if(gContextMenu) {
		var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

		var menuitem = document.getElementById('ContextMenu_TemporaryInbox');
		var insert = document.getElementById('ContextMenu_TemporaryInbox_Insert');
		var page = document.getElementById('ContextMenu_TemporaryInbox_Page');	
		
		if(insert)
			insert.hidden = !gContextMenu.onTextInput;
	
		if(prefManager.getBoolPref('temporaryinbox.hideContextMenu1') == true){
			insert.hidden = true;
		}else{
			insert.hidden = false;
		}

		if(prefManager.getBoolPref('temporaryinbox.hideContextMenu2') == true){
			page.hidden = true;
		}else{
			page.hidden = false;
		}
		
	}
}
