/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const { Cc, Ci, Cu } = require("chrome");

var unicodeConverter = null;

exports.md5 = function(data) {
	if(!unicodeConverter) {
		unicodeConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
			.createInstance(Ci.nsIScriptableUnicodeConverter);
		unicodeConverter.charset = "UTF-8";
	}
	var jsonData = JSON.stringify(data);
	var bytes = unicodeConverter.convertToByteArray(jsonData, {});
	var ch = Cc["@mozilla.org/security/hash;1"]
		.createInstance(Ci.nsICryptoHash);
	ch.init(ch.MD5);
	ch.update(bytes,bytes.length);
	return ch.finish(true);
};

exports.saveStringToFile = function(fileName,data,callback) {
	Cu.import("resource://gre/modules/osfile.jsm");
	OS.File.writeAtomic(fileName, data, { encoding: "utf-8" }).then(function() {
		//console.info("File saved as",fileName);
		if(callback)
			callback();
	},function(error) {
		console.info("error",error);
		if(callback)
			callback(error);
	});
}

var installHandlers = [];
var uninstallHandlers = [];
var windowListener = null;

Cu.import("resource://gre/modules/Services.jsm");

exports.browserWindowsTrack = function(install,uninstall) {
	if(install)
		installHandlers.push(install);
	if(uninstall)
		uninstallHandlers.push(uninstall);
	if(!windowListener) {
		windowListener = {
		    onOpenWindow: function(xulWindow) {
		        var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
		        function onWindowLoad() {
		            window.removeEventListener("load",onWindowLoad);
		            if (window.document.documentElement.getAttribute("windowtype") == "navigator:browser") {
		            	window.document.documentElement.setAttribute("vdh-monitored","1");
		            	installHandlers.forEach(function(install) {
		            		install(window);
		            	});
		            }
		        }
		        window.addEventListener("load",onWindowLoad);
		    },
		    onCloseWindow: function (xulWindow) {
		    	var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
		    	var monitored = false;
		    	try {
		    		monitored = window.document.documentElement.getAttribute("vdh-monitored");
		    	} catch($_) {};
		    	if(monitored) {
	            	uninstallHandlers.forEach(function(uninstall) {
	            		uninstall(window);
	            	});
	            	window.document.documentElement.removeAttribute("vdh-monitored");
		    	}
		    },
		}
		Services.wm.addListener(windowListener);
	}

	var en = Services.wm.getEnumerator("navigator:browser");
	while(en.hasMoreElements()) {
		var window = en.getNext().QueryInterface(Ci.nsIDOMWindow);
		window.document.documentElement.setAttribute("vdh-monitored","1");
		if(install)
			install(window);
	}
}

exports.browserWindowsTrackEnd = function(install,uninstall) {
	if(install) {
		var index = installHandlers.indexOf(install);
		if(index>=0)
			installHandlers.splice(index,1);
	}
	if(uninstall) {
		var index = uninstallHandlers.indexOf(uninstall);
		if(index>=0) {
			uninstallHandlers.splice(index,1);
			var en = Services.wm.getEnumerator("navigator:browser");
			while(en.hasMoreElements()) {
				var window = en.getNext().QueryInterface(Ci.nsIDOMWindow);
				uninstall(window);
			}			
		}
	}
}

exports.forEachBrowserWindow = function(callback) {
	var en = Services.wm.getEnumerator("navigator:browser");
	while(en.hasMoreElements()) {
		var window = en.getNext().QueryInterface(Ci.nsIDOMWindow);
		callback(window);
	}			
}

require("sdk/system/unload").when(function() {
	if(windowListener) {
		Services.wm.removeListener(windowListener);
		windowListener = null;
		var en = Services.wm.getEnumerator("navigator:browser");
		while(en.hasMoreElements()) {
			var window = en.getNext().QueryInterface(Ci.nsIDOMWindow);
			window.document.documentElement.removeAttribute("vdh-monitored");
        	uninstallHandlers.forEach(function(uninstall) {
        		uninstall(window);
        	});
        	uninstallHandlers = [];
        	installHandlers = [];
		}
	}
});

