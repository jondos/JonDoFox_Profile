/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const $chrome = require("chrome");
const Cc = $chrome.Cc;
const Ci = $chrome.Ci;
const Cu = $chrome.Cu;
const Class = require('sdk/core/heritage').Class;
const merge = require('sdk/util/object').merge;
const _ = require("sdk/l10n").get;
const timers = require("sdk/timers");
const simplePrefs = require("sdk/simple-prefs");

const hits = require("hits");
const utils = require("utils");
const actions = require("actions");
const panels = require("panels");
const tpsr = require("tpsr");

var chunkSets = {}

function DownloadChunk(chunkSet,index) {
	Cu.import("resource://gre/modules/FileUtils.jsm");
	var file =  new FileUtils.File(chunkSet.dir);
	file.append("c.ts");
	file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
	
	Cu.import("resource://gre/modules/Downloads.jsm");

	chunkSet.chunks[index] = {
		status: "queued",
		path: file.path,
	}
	function SetStatus(status) {
		chunkSet.chunks[index].status = status;
		if(chunkSet.callback)
			chunkSet.callback();
	}
	Downloads.createDownload({
		source: {
			url: chunkSet.hit.chunkUrls[index],
			isPrivate: chunkSet.hit.isPrivate,
		},
		target: file.path,
	}).then(function(download) {
		download.start().then(function() {
			if(file.fileSize>0)
				SetStatus("downloaded");
			else
				SetStatus("failed");
		},function(error) {
			SetStatus("failed");
		});		
	},function() {
		SetStatus("failed");
	});

}

function ExpiredTimer(chunkSet) {
	chunkSet.timer = null;
	if(chunkSet.recording)
		hits.action('stoprecord',chunkSet.hit.id);
}

exports.newChunk = function(hitData) {
	var id = "chunked:"+utils.md5(hitData.pageUrl);
	
	var now = Date.now();
	var chunkSet = chunkSets[id]; 
	if(!chunkSet) {
		chunkSet = chunkSets[id] = {
			chunks: {},	
			recording: false,
			done: false,
			timeRef: now-simplePrefs.prefs['chunk.initial-period']*1000,
		}
		chunkSet.hit = merge({},hitData,{
			id: id,
			chunkUrls: [],
			length: 0,
			url: undefined,
			_priorityCat: 'chunked',
			_priority: now,
			extension: "mpeg",
		},tpsr.hit(hitData,id));
	}
	var index = chunkSet.hit.chunkUrls.length;
	
	if(chunkSet.timer)
		timers.clearTimeout(chunkSet.timer);
	var timeout = Math.round((simplePrefs.prefs['chunk.period-factor']/100)*(now-chunkSet.timeRef)/(index+1));
	chunkSet.timer = timers.setTimeout(function() {
		ExpiredTimer(chunkSet);
	},timeout);
	
	chunkSet.hit.chunkUrls.push(hitData.url);
	chunkSet.chunks[index] = {
		status: "initial",
	}
	if(hitData.length)
		chunkSet.hit.length += hitData.length;
	if(chunkSet.recording)
		DownloadChunk(chunkSet,index);
	hits.newData(chunkSet.hit);
}

var ChunkRecordAction = merge(Class({
	
	"extends": actions.Action,
	
	start: function() {
		var chunkSet = chunkSets[this.hit.data.id];
		if(!chunkSet)
			return;

		Cu.import("resource://gre/modules/FileUtils.jsm");
		var file = FileUtils.getFile("TmpD", ["chunks"]);
		file.createUnique(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);

		chunkSet.dir = file.path;
		
		chunkSet.recording = true;
		this.hit.updateActions();
		
		for(var i=0; i<chunkSet.hit.chunkUrls.length; i++)
			DownloadChunk(chunkSet,i);
	},
	
}),{
	actionName: "record",
	canPerform: function(hit) {
		if(hit.data.chunkUrls===undefined)
			return false;
		var chunkSet = chunkSets[hit.data.id];
		if(!chunkSet)
			return false;
		return !chunkSet.recording && !chunkSet.done;
	},
	priority: 90,
	title: _("action.record.title"),
	description: _("action.record.description"),
	icon: "images/icon-action-record-64.png",
});

actions.registerAction("record",ChunkRecordAction);

var ChunkStopRecordAction = merge(Class({
	
	"extends": actions.actionClasses['downloadconvert'],

	start: function() {
		var chunkSet = chunkSets[this.hit.data.id];
		if(!chunkSet)
			return;
		chunkSet.recording = false;
		chunkSet.done = true;
		this.hit.updateActions();
		
		if(chunkSet.timer) {
			timers.clearTimeout(chunkSet.timer);
			chunkSet.timer = null;
		}
		delete chunkSets[this.hit.data.id];
		hits.remove(this.hit.data.id);
		chunkSet.hit.id = chunkSet.hit.id + "-" + Date.now();
		hits.newData(chunkSet.hit);
		this.hit = hits.getHit(chunkSet.hit.id);
		
		var $this = this;
		function CheckChunks() {
			var counters = {
				total: 0,
				initial: 0,
				queued: 0,
				downloaded: 0,
				failed: 0,
			}
			for(var index in chunkSet.chunks) {
				var chunk = chunkSet.chunks[index];
				counters[chunk.status]++;
				counters.total++;
			}
			if(counters.queued>0 || counters.initial>0)
				return false;
			
			$this.saveChunkSet(chunkSet,counters);
			
			return true;
		}
		
		if(!CheckChunks())
			chunkSet.callback = CheckChunks;
		
	},

	saveChunkSet: function(chunkSet,counters) {
		
		if(counters.downloaded==0)
			return;
		
		var $this = this;
		
		function TogglePanel() {
			var converter = require("converter");
			panels.togglePanel('dlconv',{
				contentURL: "dlconvPanel.html",
				top: 10,
				closeTimeout: 0,
				jsFiles: [
				    "lib/jquery.min.js",
				    "lib/bootstrap/bootstrap.min.js",
				    "dlconvPanel.js",
				],
				onShow: function(panel) {
					var converterConfig = converter.config();
					panel.port.emit("contentMessage",{
						type: "set",
						name: "formats",
						value: converterConfig.formats,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "codecs",
						value: converterConfig.codecs,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "targets",
						value: converterConfig.targets,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "configs",
						value: converterConfig.configs,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "transientStorageDirectory",
						value: require("actions").transientStorageDirectory(),
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "renameCheckbox",
						value: true,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "panelTitle",
						value: _("chunk.save"),
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "chunkedTitle",
						value: chunkSet.hit.title,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "hasAssembleButton",
						value: true,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "hasAssembleConvertButton",
						value: true,
					});
					panel.port.emit("contentMessage",{
						type: "set",
						name: "assembleCheckbox",
						value: true,
					});
				},
				onHide: function() {
					if(!chunkSet.doNotRemove)
						$this.removeChunkSet(chunkSet,true);
				},
				onMessage: function(message,panel) {
					switch(message.type) {
					case "setConfigs":
						converter.setConfigs(message.configs);
						break;
					case "resetConfigs":
						converter.resetConfigs(message.configs);
						panel.port.emit("contentMessage",{
							type: "set",
							name: "converter",
							value: exports.config(),
						});
						break;
					case "showConfigs":
						converter.showConfigs(message.configs);
						break;
					case "changeStorageDirectory":
						require("actions").changeStorageDirectory(require("sdk/private-browsing").isPrivate(window),TogglePanel);
						break;
					case "conversionHelp":
						panel.hide();
						require("sdk/tabs").open({
							url: "http://www.downloadhelper.net/conversion-manual3.php",
						});
						break;
					case "assemble":
						chunkSet.doNotRemove = true;
						panel.hide();
						$this.processChunkSet(chunkSet,message.config);
						break;
					}
				},
			});			
		}
		if(chunkSet.hit._tpsr) {
			tpsr.recordingFinished(chunkSet.hit);
			this.processChunkSet(chunkSet,chunkSet.hit._convertId);
		} else
			TogglePanel();
	},
	
	processChunkSet: function(chunkSet,config) {
		var converter = require("converter");
		var assembleNative = simplePrefs.prefs['chunk.assemble-native'];
		var converterRequired = !assembleNative || config;
		if(converterRequired) {
			var $this = this;
			converter.check(function() {
				if(converter.config().status=='ready')
					$this.processChunkSet2(chunkSet,config,assembleNative);
				else {
					$this.missingConverter = [!assembleNative,!!config];
					$this.processChunkSet2(chunkSet,null,true);
				}
			});
		} else
			this.processChunkSet2(chunkSet,null,true);
	},

	processChunkSet2: function(chunkSet,configId,assembleNative) {
		var $this = this;

		if(!assembleNative)
			this.hit.data.extension = 'mp4';

		if(configId || !assembleNative) {
			var converter = require("converter");
			var config = converter.config().configs[configId];
			if(config) {
				if(this.hit.data.extension)
					this.hit.data.originalExt = this.hit.data.extension;
				this.hit.data.extension = config.ext || config.params.f || this.hit.data.extension;
			} else
				configId = null;
			this.hit.data._convert = config || null;
		}
		
		var filename = this.getFilename()
		this.getDownloadTargetFilePath(filename,function(target) {
			Cu.import("resource://gre/modules/FileUtils.jsm");
			if(!target) {
				RemoveChunkSet(chunkSet,true);
				return;
			}
			$this.hit.data._downloadTarget = target;
			if(configId) {
				var file = FileUtils.getFile("TmpD", ["chunked-media.mpeg"]);
				file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0644);
				$this.hit.data._downloadTarget = file.path;
			}
			$this.hit.data._finalTarget = target;
			
			var chunks = [];
			for(var i=0;chunkSet.chunks[i];i++) {
				var chunk = chunkSet.chunks[i];
				if(chunk.status=="downloaded")
					chunks.push(chunk.path);
			}
			
			function Success() {
				var file = new FileUtils.File($this.hit.data._finalTarget);
				$this.hit.data.localFilePath = file.path,
				$this.hit.data.localContainerPath = file.parent.path;							
				$this.hit.updateActions();
			}
			
			function Assembled() {
				if($this.hit.data._convert) {
					$this.convertMedia();
				} else
					Success();
				if($this.missingConverter) {
					var text = "";
					if($this.missingConverter[0] && $this.missingConverter[1])
						text = _('chunk.converter-assemble-convert');
					else if($this.missingConverter[0])
						text = _('chunk.converter-assemble');
					else
						text = _('chunk.converter-convert');
					require("alerts").alert({
						title: _('converter-missing'),
						text: [text,_('chunk.missing-conv-native-assemble-only')],
						action: {
							text: _('install-converter'),
							click: "post('installConverter')",
						},
						onMessage: function(message,panel) {
							switch(message.type) {
							case "installConverter":
								panel.hide();
								require("sdk/tabs").open({
									url: "http://www.downloadhelper.net/install-converter3.php",
								});
								break;
							}
						},
					});
				}
			}
			
			if(assembleNative)
				$this.assembleNative(chunkSet,chunks,Assembled);
			else {
				require("converter").assemble({
					chunks: chunks,
					target: $this.hit.data._downloadTarget,
					directory: chunkSet.dir,
				},Assembled,function() {
					$this.assembleError(chunkSet);
				});
			}
			
		});
	},

	removeChunkSet: function(chunkSet,removeHit) {
		Cu.import("resource://gre/modules/FileUtils.jsm");
		var file =  new FileUtils.File(chunkSet.dir);
		if(file.exists)
			file.remove(true);
		if(removeHit)
			hits.remove(chunkSet.hit.id);
	},

	assembleSuccess: function(chunkSet) {
		this.removeChunkSet(chunkSet,false);
	},

	assembleError: function(chunkSet) {
		this.removeChunkSet(chunkSet,true);
	},

	assembleNative: function(chunkSet,chunks,callback) {
		const {OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
		var $this = this;
		OS.File.open(this.hit.data._downloadTarget, {write: true, append: true})
			.then(function(file) {
				var index=0;
				function Next() {
					if(index>=chunks.length) {
						file.close();
						$this.assembleSuccess(chunkSet);
						callback();
					} else  {
						OS.File.read(chunks[index++]).then(function(data) {
							file.write(data).then(Next,function(ex) {
								console.error("I/O error:",ex);
								file.close();
								$this.assembleError(chunkSet);													
							});
						},function(ex) {
							console.error("I/O error:",ex);
							file.close();
							$this.assembleError(chunkSet);						
						});
					}
				}
				Next();
			},function(ex) {
				console.error("I/O error:",ex);
				$this.assembleError(chunkSet);
			});
	},
	

}),{
	actionName: "stoprecord",
	canPerform: function(hit) {
		if(hit.data.chunkUrls===undefined)
			return false;
		var chunkSet = chunkSets[hit.data.id];
		if(!chunkSet)
			return false;
		return chunkSet.recording;
	},
	priority: 100,
	title: _("action.stoprecord.title"),
	description: _("action.stoprecord.description"),
	icon: "images/icon-action-stoprecord-64.png",
});

actions.registerAction("stoprecord",ChunkStopRecordAction);
