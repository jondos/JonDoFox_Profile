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
 * Christian Frank.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */



function goToTemporaryInbox(e) {
	var protocol;
	
	if(Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('temporaryinbox.usessl') == true){
	
		protocol = "https";
	}else{
		protocol = "http";
	}
	//go to Temporary Inbox Page
	var key = -1;
	var shift;
	key = e.keyCode;
	shift = e.shiftKey;
	var eingabe = document.getElementById('temporaryinbox_textbox');
	var inbox = eingabe.value;
	var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
	
	if (!shift && (key == 13)) {
		window.content.document.location.href = protocol + "://www.temporaryinbox.com/inbox.php?inbox=" + inbox +  "&l=" + prefManager.getCharPref('temporaryinbox.language');

	}
}

function goToTemporaryInbox2() {
	var protocol;
	
	if(Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('temporaryinbox.usessl') == true){
	
		protocol = "https";
	}else{
		protocol = "http";
	}
	//go to Temporary Inbox Page

	var eingabe = document.getElementById('temporaryinbox_textbox');
	var inbox = eingabe.value;
	var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

	window.content.document.location.href = protocol + "://www.temporaryinbox.com/inbox.php?inbox=" + inbox +  "&l=" +  prefManager.getCharPref('temporaryinbox.language');


}

function goToTemporaryInbox3() {
	var protocol;
	
	if(Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('temporaryinbox.usessl') == true){
	
		protocol = "https";
	}else{
		protocol = "http";
	}
	var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

	window.content.document.location.href = protocol + "://www.temporaryinbox.com/?l=" +  prefManager.getCharPref('temporaryinbox.language');


}


function goToForward() {
	var protocol;
	var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
	if(Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('temporaryinbox.usessl') == true){
	
		protocol = "https";
	}else{
		protocol = "http";
	}

	window.content.document.location.href = protocol + "://www.temporaryinbox.com/forward.php?l=" + prefManager.getCharPref('temporaryinbox.language');


}

function goToHistory() {
	var protocol;
	var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
	if(Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('temporaryinbox.usessl') == true){
	
		protocol = "https";
	}else{
		protocol = "http";
	}

	window.content.document.location.href = protocol + "://www.temporaryinbox.com/history.php?l=" + prefManager.getCharPref('temporaryinbox.language');


}

function goToHelp() {
	var protocol;
	var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
	if(Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('temporaryinbox.usessl') == true){
	
		protocol = "https";
	}else{
		protocol = "http";
	}

	window.content.document.location.href = protocol + "://www.temporaryinbox.com/wiki/";


}
