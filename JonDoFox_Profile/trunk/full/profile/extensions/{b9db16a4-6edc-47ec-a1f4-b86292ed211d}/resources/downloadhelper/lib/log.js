/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const { merge } = require('sdk/util/object');

const panels = require("panels"); 

var logs = [];
var toolbarIcon = null;

exports.error = function(errSpec) {
	if(errSpec.message)
		exports.add(errSpec.message,'error');
	else
		exports.add(errSpec,'error');
}

exports.log = function(errSpec) {
	exports.add(errSpec,'log');
}

exports.add = function(errSpec,type) {
	if(typeof errSpec=='string')
		errSpec = {
			text: errSpec,
		}
	var log = merge({
		type: type,
		text: '',
	},errSpec);
	logs.push(log);
	NotifyLogs();
}

exports.reset = function() {
	logs.splice(0,logs.length);
	NotifyLogs();
}

exports.get = function() {
	return logs;
}

exports.getErrors = function() {
	var errors = [];
	logs.forEach(function(log) {
		if(log.type=='error')
			errors.push(log);
	});
	return errors;
}

exports.updateBadge = function() {
	if(toolbarIcon)	{
		var errorsCount = exports.getErrors().length;
		if(errorsCount>0) {
			toolbarIcon.badge = errorsCount;
			toolbarIcon.badgeColor = "#f00";			
		}
	}	
}

exports.setToolbarIcon = function(tbi) {
	toolbarIcon = tbi;
}

exports.showDetails = function(log) {
	panels.togglePanel('logdetails',{
		contentURL: "logdetailsPanel.html",
		top: 10,
		closeTimeout: 0,
		jsFiles: "logdetailsPanel.js",
		onShow: function(panel) {
			panel.port.emit("contentMessage",{
				type: "set",
				name: "log",
				value: log,
			});
		},
	});
}

function NotifyLogs() {
	panels.panelData('main','logs',logs);
	exports.updateBadge();
}