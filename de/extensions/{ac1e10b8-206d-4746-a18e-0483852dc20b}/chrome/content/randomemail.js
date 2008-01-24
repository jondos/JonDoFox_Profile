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


function getRandomNum(lbound, ubound) {
	return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
}

function getRandomChar() {
	var numberChars = "0123456789";
	var lowerChars = "abcdefghijklmnopqrstuvwxyz";
	var charSet = "";
	charSet += numberChars;
	charSet += lowerChars;
	return charSet.charAt(getRandomNum(0, charSet.length));
}
function getAccount(length) {
	var rc = "";
	if (length > 0)
		rc = rc + getRandomChar();
	for (var idx = 1; idx < length; ++idx) {
		rc = rc + getRandomChar();
	}
	return rc;
}

function createRandomEmail() {
	var account = getAccount(15);
	document.getElementById('temporaryinbox_textbox2').value = account+ '@' + domains_array[getRandomNum(0,domains_array.length)];
	document.getElementById('temporaryinbox_textbox').value = account;
}
