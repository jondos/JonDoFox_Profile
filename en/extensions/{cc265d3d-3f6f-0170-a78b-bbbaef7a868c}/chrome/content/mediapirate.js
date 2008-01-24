var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

window.addEventListener("load",mediapirate_onload,false);


function add_contextmenu_entry(){

	if(prefManager.getBoolPref("mediapirate.hideContextMenu") == false && document.getElementById("tb-mediapirate").getAttribute("state") == "1"){
		document.getElementById("cm-mediapirate").setAttribute("hidden",false);

	}else{
		document.getElementById("cm-mediapirate").setAttribute("hidden",true);

	}	
}

function add_toolbar_item(){

	var tbid="tb-mediapirate";
	var afterId="urlbar-container";
	var afterElem=document.getElementById(afterId);
	if(afterElem) {
		var navBar=afterElem.parentNode;
		if(document.getElementById(tbid)==null) {
			navBar.insertItem(tbid,afterElem.nextSibling);
			navBar.setAttribute("currentset", navBar.currentSet );
			document.persist("nav-bar", "currentset");
		}
	}

}

function gotomediapirate() {
	if(document.getElementById("tb-mediapirate").getAttribute("state") == "1"){
		var newTab = getBrowser().addTab("about:blank");
		var newBrowser = getBrowser().getBrowserForTab(newTab);
		newBrowser.loadURI("http://www.mediapirate.org/grabit.php?url=" + window.content.document.location.href); 	
		getBrowser().selectedTab = newTab; 	
	}

}

function mediapirate_active()
{
	document.getElementById("tb-mediapirate").setAttribute("state", "1");
	document.getElementById("tb-mediapirate").image = "chrome://mediapirate/content/logo-big-active.png";
}

function mediapirate_inactive()
{
	document.getElementById("tb-mediapirate").setAttribute("state", "0");
	document.getElementById("tb-mediapirate").image = "chrome://mediapirate/content/logo-big-inactive.png";
}


function mediapirate_onload(e) 
{
	setInterval(mediapirate_check, 1000);

	
	var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                        .getService(Components.interfaces.nsIXULAppInfo);
	var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                               .getService(Components.interfaces.nsIVersionComparator);
	if(versionChecker.compare(appInfo.version, "2.0") >= 0) {
		var container = gBrowser.tabContainer;
		container.addEventListener("TabSelect", mediapirate_check, false);  	
	}else{
		var container = gBrowser.mPanelContainer;
		container.addEventListener("TabSelect", mediapirate_check, false);
	}

	if(prefManager.getBoolPref("mediapirate.firstTime") == true){
		
		add_toolbar_item();
		prefManager.setBoolPref("mediapirate.firstTime", false);
	}
	
}

function mediapirate_check()
{
	var website = window.content.location.href;
      var baseurl = website.replace(/(http:\/\/)?(https:\/\/)?(www\.)?/,"");
	var baseurl_array = baseurl.split("/");
	tld = baseurl_array[0];
	tld = tld.replace(/video\.google\..*/,'video.google.com');
	
	if(tld.match(/youtube\.com|metacafe\.com|video\.google\.com|break\.com|dailymotion\.com|ifilm\.com|media\.putfile\.com|myvideo\.de|vidilife\.com|blip\.tv|zippyvideos\.com|vids\.myspace\.com|livevideo\.com/ig)){

		mediapirate_active();
	}else{
		mediapirate_inactive();
	};



}

