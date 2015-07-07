/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


var url = window.location.href;

function GetVideoId() {
	var url = document.evaluate("//meta[@name='twitter:player']/@value",document, null, XPathResult.STRING_TYPE, null).stringValue;
	if(url) {
		var m = /([^\/]+)$/.exec(url);
		if(m)
			return m[1];
	}
	return null;
}

var videoId = GetVideoId();

var videoMessage = {
	pageUrl: url,
}

if(videoId) {
	videoMessage.videoId = videoId;
	videoMessage.source = url;
	var m = /^(https?:\/\/(?:[^\/]*\.)?\x64\x61\x69\x6c\x79\x6d\x6f\x74\x69\x6f\x6e(?:\.co)?\.(?:[^\.\/]+))\//.exec(url);
	if(m)
		videoMessage.baseUrl = m[1];
}

videoMessage.hasVideo = !!videoId;

self.port.emit("detected-video",videoMessage);