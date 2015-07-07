/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const self = require("sdk/self");
const pageMod = require("sdk/page-mod");
const timers = require("sdk/timers");
const tabs = require("sdk/tabs");
const simplePrefs = require("sdk/simple-prefs");

const panels = require("panels");
const hits = require("hits");

const TPSR_PATTERN = new RegExp("^https?://([^/]*\.)?\x74\x77\x69\x74\x74\x65\x72(\.co)?\.([^\./]+)/search\\?.*f=realtime.*");

var processingCount = 0;
var backLogQueue = [];
var processedURLs = {};
var running = false;
var searchTab = null;
var searchPageMod = null;
var runningTabs = {};

exports.isRunning = function() {
	return running;
}

exports.action = function(action) {
	switch(action) {
	case "start":
		exports.start();
		break;
	case "stop":
		exports.stop();
		break;
	}
}

function Start(search) {
	if(simplePrefs.prefs['tpsr.state'] != "stopped")
		return;
	simplePrefs.prefs['tpsr.state'] = "started";
	
	searchPageMod = pageMod.PageMod({
		include: TPSR_PATTERN,
		contentScriptFile: [
		    self.data.url("lib/jquery.min.js"),
		    self.data.url("relay-content.js"),
		    self.data.url("tpsr-content.js"),
		],
		contentScriptWhen: 'end',
		onAttach: function(worker) {
		    worker.port.on("vdh-message",function(message) {
		    	switch(message.type) {
		    	case 'detected-links':
		    		NewLinks(message.links);
		    		break;
		    	}
		    });
		    worker.on('detach', function () {
		    	var data = processedURLs[worker.url];
		    	if(data && data.hitId) {
					hits.action("stoprecord",data.hitId);
		    		delete data.hitId;
		    	}
		    });
		},
	});
	running = true;
	tabs.open({
		url: "https://twitter.com/search?f=realtime&q="+encodeURIComponent(/^(.*?)\s*$/.exec("live #periscope "+search)[1]),
		inBackground: true,
		onOpen: function(tab) {
			searchTab = tab;
		},
		onClose: function(tab) {
			exports.stop();
		},
	});	
}

exports.start = function() {
	if(simplePrefs.prefs['tpsr.state'] != "stopped")
		return;
	for(var url in processedURLs) {
		var data = processedURLs[url];
		if(data.timer) {
			timers.clearTimeout(data.timer);
			data.timer = null;			
		}
		if(data.durationTimer) {
			timers.clearTimeout(data.durationTimer);
			data.durationTimer = null;						
		}
	}
	processedURLs = {};
	panels.togglePanel('tpsr',{
		contentURL: "tpsrPanel.html",
		top: 10,
		closeTimeout: 0,
		jsFiles: [
		    "tpsrPanel.js",
		],
		onShow: function(panel) {
			var converter = require("converter")
			converter.check(function() {
				panel.port.emit("contentMessage",{
					type: "set",
					name: "converter",
					value: converter.config(),
				});					
			});
		},
		onMessage: function(message,panel) {
			switch(message.type) {
			case "start":
				panel.hide();
				Start(message.search);
				break;
			case "goto":
				panel.hide();
				switch(message.where) {
				case 'converter':
					require("sdk/tabs").open({
						url: "http://www.downloadhelper.net/install-converter3.php",
					});
					break;
				}
				break;
			}
		},
	});
}

exports.stop = function() {
	simplePrefs.prefs['tpsr.state'] = "stopped";
	running = false;
	if(searchPageMod) {
		searchPageMod.destroy();
		searchPageMod = null;
	}
	if(searchTab) {
		searchTab.close();
		searchTab = null;
	}
	for(var url in runningTabs) {
		var tab = runningTabs[url];
		tab.close();
		delete runningTabs[url]; 
	}
}

exports.hit = function(hitData,id) {
	var hitExtend = {};
	var url = hitData.topUrl;
	var data = processedURLs[url];
	if(data) {
		hitExtend.autoExec = "record";
		timers.clearTimeout(data.timer);
		data.timer = null;
		data.hitId = id;
		hitExtend._tpsr = true;
		data.durationTimer = timers.setTimeout(function() {
			data.durationTimer = null;
			delete data.id;
			hits.action("stoprecord",id);
		},simplePrefs.prefs["tpsr.duration-timeout"]*1000);
	}
	return hitExtend;
}

exports.recordingFinished = function(hitData) {
	var url = hitData.topUrl;
	var data = processedURLs[url];
	if(data) {
		if(data.durationTimer) {
			timers.clearTimeout(data.durationTimer);
			data.durationTimer = null;			
		}
		if(data.hitId)
			delete data.hitId;
		if(simplePrefs.prefs['tpsr.convert']) {
			var converter = require("converter");
			var convertId = simplePrefs.prefs['tpsr.convert'];
			if(converter.config().configs[convertId])
				hitData._convertId = convertId;
		}
		var tab = runningTabs[url];
		if(tab) {
			delete runningTabs[url]; 
			tab.close();
		}
	}
}

function PollQueue() {
	if(simplePrefs.prefs['tpsr.state'] != "started")
		return;
	while(processingCount<simplePrefs.prefs['tpsr.concurrent-captures'] && backLogQueue.length>0) {
		var url = backLogQueue.shift();
		if(processedURLs[url])
			continue;
		ProcessURL(url);
	}	
}

function NewLinks(links) {
	backLogQueue = links.concat(backLogQueue);
	PollQueue();
}

function Expired(url) {
	var tab = runningTabs[url];
	if(tab)
		tab.close();
}

function ProcessURL(url) {
	processedURLs[url] = {
		timer: timers.setTimeout(function() {
			processedURLs[url].timer = null;
			Expired(url);
		},simplePrefs.prefs['tpsr.start-timeout']*1000),
	};
	processingCount++;
	tabs.open({
		url: url,
		inBackground: true,
		onOpen: function(tab) {
			runningTabs[url] = tab;
		},
		onClose: function(tab) {
			if(processedURLs[url].timer) {
				timers.clearTimeout(processedURLs[url].timer);
				processedURLs[url].timer = null;
			}
			delete runningTabs[url]; 
			processingCount--;
			PollQueue();
		},
	});
}

require("sdk/system/unload").when(function() {
	if(simplePrefs.prefs['tpsr.state'] == "started")
		exports.stop();
});
