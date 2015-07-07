/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const { Cc, Ci, Cu } = require("chrome");
const timers = require("sdk/timers");
const _ = require("sdk/l10n").get;
const simplePrefs = require('sdk/simple-prefs');

const PROGRESS_TIMEOUT = 100;

var globalId = 0;
var queue = [];
var runningCount = 0;
var running = {};
var preparing = {};
var progressTimer = null;

function Failed(specs,reason) {
	runningCount--;
	EnsuresProgressTimer();
	specs.failure(reason);
	TryDownload();	
}

function DoTryDownload() {
	var maxDownloads = simplePrefs.prefs['download.controlled.max'];
	while(queue.length>0 && (maxDownloads==0 || runningCount<maxDownloads)) {
		(function() {
			var specs = queue.shift();
			runningCount++;
			EnsuresProgressTimer();
			specs.lastProgress = -1;
			Cu.import("resource://gre/modules/Downloads.jsm");
			preparing[specs.id] = 1;
			
			Downloads.createDownload(specs.data).then(function(download) {
				Downloads.getList(specs.data.source.isPrivate?Downloads.PRIVATE:Downloads.PUBLIC).then(function(list) {
					if(!preparing[specs.id]) {
						Failed(specs,_("aborted"));
						return;
					}
					delete preparing[specs.id];
					list.add(download);
					specs.download = download;
					running[specs.id] = specs;
					download.start().then(function() {
						delete running[specs.id];
						runningCount--;
						EnsuresProgressTimer();
						TryDownload();
						if(specs.download.succeeded)
							specs.success();
						else
							specs.failure(specs.download.error);
					},function(error) {
						Failed(specs,error);
					});
				},function(error) {
					Failed(specs,error);				
				});
			},function(reason) {
				delete preparing[specs.id];
				Failed(specs,reason);
			});			
		})();
	}
}

simplePrefs.on("download.controlled.max",DoTryDownload);

function TryDownload() {
	timers.setTimeout(DoTryDownload,0);
}

function EnsuresProgressTimer() {
	if(progressTimer && runningCount == 0) {
		timers.clearInterval(progressTimer);
		progressTimer = null;
	} else if(!progressTimer && runningCount>0)
		progressTimer = timers.setInterval(UpdateProgress,PROGRESS_TIMEOUT);
}

function UpdateProgress() {
	for(var id in running) {
		var spec = running[id];
		if(!spec.download.stopped && spec.download.hasProgress) {
			var progress = spec.download.progress;
			if(progress!=spec.lastProgress) {
				spec.lastProgress = progress;
				spec.progress(progress);
			}
		}
	}
}

function DoNothing() {};

exports.download = function(data,success,failure,progress) {
	var id = ++globalId;
	queue.push({
		id: id,
		data: data,
		success: success || DoNothing,
		failure: failure || DoNothing,
		progress: progress || DoNothing,
	});
	TryDownload();
	return id;
}

exports.abort = function(id) {
	queue.forEach(function(entry,index) {
		if(entry.id == id) {
			entry.failure({
				message: _('download-canceled'),
				result:2147500037,
			});
			queue.splice(index,1);
		}
	});
	if(preparing[id])
		delete preparing[id];
	if(running[id]) {
		running[id].download.finalize(true);
	}
}
