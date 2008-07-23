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


var http_request = false;

function sendRequest(file) {

    http_request = false;

    if (window.XMLHttpRequest) { // Mozilla, Safari,...
        http_request = new XMLHttpRequest();
        if (http_request.overrideMimeType) {
            http_request.overrideMimeType('text/plain');
        }
    } else if (window.ActiveXObject) { // IE
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
    }

    if (!http_request) {
        
        return false;
    }
    
    
    
    http_request.open('GET', file, true);
    http_request.send(null);
    
http_request.onreadystatechange = printDomains;
}

function printDomains() {

    if (http_request.readyState == 4) {
        if (http_request.status == 200) {
		var availabledomains = new String(http_request.responseText);
		
        	domains_array = availabledomains.split('\r\n');
		
            
        } else {
       		
        }
    }

}

sendRequest('http://www.temporaryinbox.com/availabledomains.php');
