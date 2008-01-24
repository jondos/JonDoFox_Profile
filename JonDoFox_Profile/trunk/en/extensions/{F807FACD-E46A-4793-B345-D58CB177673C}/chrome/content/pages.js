var PFFTempPagesObject = new XML();
var pffDebugTempPagesObject = [];

performancingUtil.prototype.loadPagesXMLFile = function(){
    var pagesFileInfo = gPerformancingUtil.getPagesXMLFileInfo();
    var pagesFile = PerFormancingFileIO.open(pagesFileInfo.path);
    var theXMLString = null;
	
    if(pagesFile.exists()){
        theXMLString = PerFormancingFileIO.read(pagesFileInfo, "UTF-8");
        var theXML = new XML(theXMLString);
        return theXML;
    }
	else {
		// File doesn't exist.
        return false;
    }
}

performancingUtil.prototype.getPagesXMLFileInfo = function(){
    var file = PerFormancingDirIO.get("ProfD");
    file.append("extensions");
    file.append('performancing-pages.xml');
    return file;
}

performancingUtil.prototype.addPageToEditor = function (theElement) {
	var thePostID = theElement.getAttribute("postid");
	var theDateCreated = theElement.getAttribute("date");
	var pagesFile = gPerformancingUtil.loadPagesXMLFile();

	var theBlogXML = new XML(pagesFile);
	pffDebugTempPagesObject = theBlogXML;
	
	try {
		var theEntry = theBlogXML..entry.(postid == thePostID);

		// Now load everything
		// First Focus the Source
		var tabbox = document.getElementById("performancing-editor-tabbox"); 

		//convert back to html
		var theContent = theEntry.content.toString();
		theContent = theContent.replace(/&lt;/gi, "<");
		theContent = theContent.replace(/&gt;/gi, ">");

		// Then Load the contents

		if (tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){
			// Rich or preview
			var winNormal = document.getElementById("performancing-message");
			winNormal.contentWindow.document.body.innerHTML = theContent;
		}
		else if(tabbox.selectedIndex == 1){
			// Source
			document.getElementById("performancing-message-source").value = theContent;
		}
		else{
			alert("Could not load page data.");
		}
		
		var winPreview = document.getElementById("performancing-preview-display");
		document.getElementById("performancing-message-source").value = theContent;
		performancingMidas.syncNormalTab();

		//Then Load the Title
		var theTitle = theEntry.title.toString();
		document.getElementById("performancing-editor-subject").value = theTitle;

		//Show Republish button and set attributes
		var editButtons = document.getElementById("post-edit-buttons");
		var pubButton = document.getElementById("performancing-republish-button");
		pubButton.setAttribute("lastpostid", thePostID);
		pubButton.setAttribute("datecreated", theDateCreated);
		editButtons.hidden = false;
		
		return true;
	} catch(e) {
		return true;
	}
}

performancingUtil.prototype.clearPagesXMLFile = function(){
	var fileInfo = gPerformancingUtil.getPagesXMLFileInfo();
	var file = PerFormancingFileIO.open(fileInfo.path);
	
	var theXMLFile = null;
	var theBlogXML = <pagelist><list></list></pagelist>;;
	PFFTempHistoryObject = theBlogXML;
	
	// Doesn't exist, so let's create it.
	if (!file.exists()){
		PerFormancingFileIO.create(file);
	}
	else {
		PerFormancingFileIO.open(file.path);
	}
	
	var rv = PerFormancingFileIO.write(file, theBlogXML.toString(), "w", "UTF-8");
	
	if(!rv) {
		var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
	}
}

performancingUtil.prototype.setPagesXML = function(thePostID, theContent, theTitle, theCategories, theDateCreated){
	PFFTempHistoryObject.list.entry += <entry><postid>{thePostID}</postid><content>{theContent}</content><title>{theTitle}</title><categories>{theCategories}</categories><datecreated>{theDateCreated}</datecreated></entry>;
}

performancingUtil.prototype.savePagesXMLFile = function(){
	var fileInfo = gPerformancingUtil.getPagesXMLFileInfo();
	var file = PerFormancingFileIO.open(fileInfo.path);
	
	if(file.exists()){
		var theXMLFile = PerFormancingFileIO.open(file.path);
		
		// Write to file (save changes)
		var newWrite = PerFormancingFileIO.write(file, PFFTempHistoryObject.toString(), "w", "UTF-8");
		PFFTempHistoryObject = null;
		
		if(!newWrite) {
			var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
		}
		
		return true;
	}
	else{
		return false;
	}
}
