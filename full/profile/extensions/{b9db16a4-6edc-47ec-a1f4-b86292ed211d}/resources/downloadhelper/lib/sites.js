/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const simpleStorage = require("sdk/simple-storage");
const Request = require("sdk/request").Request;
const tabs = require("sdk/tabs");

const vdhPanels = require("panels");

function GetSites(callback) {
	if(Date.now()-simpleStorage.storage.sites.lastChecked < 1000*60*60*24) {
		callback(simpleStorage.storage.sites.list);
		return;
	}
	Request({
		url: "http://www.downloadhelper.net/sites.json",
		onComplete: function(response) {
			if(response.json) {
				simpleStorage.storage.sites.list = response.json;
				simpleStorage.storage.sites.lastChecked = Date.now();
				callback(simpleStorage.storage.sites.list);
			} else
				callback([]);
		},
	}).get();
}

exports.show = function() {
	
	vdhPanels.togglePanel('sites',{
		contentURL: "sitesPanel.html",
		top: 10,
		jsFiles: [
		    "lib/jquery.min.js",
			"lib/bootstrap/bootstrap.min.js",
		    "sitesPanel.js"
		],
		onShow: function(panel) {
			GetSites(function(sites) {
				console.log("sites",sites.length);
				panel.port.emit("contentMessage",{
					type: "set",
					name: "sites",
					value: sites,
				});				
			});
		},
		onMessage: function(message,panel) {
			switch(message.type) {
			case "visit":
				panel.hide();
				tabs.open({
					url: "http://www.downloadhelper.net/site.php?site="+message.site,
				});
				break;
			}
		},
	});

}

if(!simpleStorage.storage.sites)
	simpleStorage.storage.sites = {
		list: [],
		lastChecked: 0,
	}
