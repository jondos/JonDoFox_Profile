/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const self = require("sdk/self");
const tabs = require("sdk/tabs");

const vdhPanels = require("panels");

function ToggleAboutPanel() {
	vdhPanels.togglePanel('about',{
		contentURL: "aboutPanel.html",
		top: 10,
		jsFiles: "aboutPanel.js",
		onShow: function(panel) {
			panel.port.emit("contentMessage",{
				type: "set",
				name: "addon",
				value: self,
			});			
		},
		onMessage: function(message,panel) {
			switch(message.type) {
			case "goto":
				panel.hide();
				var url = "http://www.downloadhelper.net/";
				switch(message.where) {
				case 'support': 
					url = "http://www.downloadhelper.net/goto-support.php?version="+self.version;
					break;
				case 'howto': 
					url = "http://www.downloadhelper.net/howto.php?version="+self.version;
					break;
				case 'alpha-support': 
					url = "http://www.downloadhelper.net/goto-support.php?alpha=1";
					break;
				case 'jocly': 
					url = "https://addons.mozilla.org/firefox/addon/jocly/";
					break;
				case 'url': 
					url = message.url;
					break;
				}
				tabs.open({
					url: url,
				});
				break;
			}
		},
	});
}

exports.toggle = ToggleAboutPanel;
