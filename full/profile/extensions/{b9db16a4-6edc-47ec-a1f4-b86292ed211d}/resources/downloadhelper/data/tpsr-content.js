/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


const PTV_PATTERN = new RegExp("^https://www\\.periscope\\.tv/.*");

var lastSeenHash = null;

function FetchURLs() {
	var psLinks = [];
	var breakNow = false;
	var firstLink = null;
	$("#timeline li.stream-item .content .tweet-text a.twitter-timeline-link[data-expanded-url]").each(function() {
		if(breakNow)
			return;
		var url = $(this).attr("data-expanded-url");
		if(url && PTV_PATTERN.test(url)) {
			var urlHash = HashCode(url);
			if(urlHash==lastSeenHash) {
				breakNow = true;
				return;
			}
			if(firstLink==null)
				firstLink = urlHash;
			psLinks.push(url);
		}
	});
	if(firstLink)
		lastSeenHash = firstLink;
	if(psLinks.length>0)
		window.postMessage({
		    fromContent: true,
		    type: 'detected-links',
		    links: psLinks,
		},'*');
}

function NewTweets() {
	
	var newTweetsBar = $(".new-tweets-bar");
	if(newTweetsBar.length==0)
		return;
	var newTweetsCount = parseInt(newTweetsBar.attr("data-item-count"));
	newTweetsBar.trigger('click');
	FetchURLs();
}

FetchURLs();

function HashCode(str) {
	var hash=0, i, chr, len;
	if(str.length==0) 
		return hash;
	for(i=0, len = str.length; i < len; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return ""+Math.abs(hash);
};

setInterval(function() {
	NewTweets();
},1000);
