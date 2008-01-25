/* 
--------------------------------
Editor UI and Overlay javascript
--------------------------------
*/

/*
Todo: remove global variables and place equivalents in a performancing object
*/
var gPerformancingVersion = "1.4.2";
var gPerformancingVersionUA = "1.4.2";
var gSelectedBlog = null;
var gLastXMLBlogObject = null;
var gPerformanceDidGetRSS = false;
var gPerformanceLastURL = null;
var gPffDeliciosTagArray = [];
var gPffDeliciousTimeOut = null;
var gPffTechnoratiTimeOut = null;
var gPffOnPublishTimeOut = null;
var gPffTrackBackTemp = null;
var gPFFLastTags = null;
var gPFFLastTrackbacks = "";
var gPFFFirstWindow = null;

var gPerFormancingColorPick = false; //Keep color picker from triggering twice (bad hack)

var performancingUI = new Object();

performancingUI.init = function() {
    performancingMidas.setUpMidas();
    gSelectedBlog = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
    performancingUI.uiINIT();
    performancingUI.onTextBoxLoad2();
    
    gPFFFirstWindow = performancingUI.getLastWindow();
    if(gSelectedBlog != null && gSelectedBlog != 'null'){
        window.setTimeout('performancingUI.getAboutRSS()', 3500, true);
    }
    var richTextBox = document.getElementById("performancing-message");
    richTextBox.contentWindow.focus();
    //performancingUI.init();
    //performancingMidas.placeCaretLite(richTextBox);
    
    performancingUI.setCSS();
    performancingUI.initTechnorati();
    performancingUI.doUpgrade();
    this.sourceSpellCheck = new pffSpellCheck();
    this.richSpellCheck = new pffSpellCheck();
    
    this.sourceSpellCheck.setupTextBoxSpellCheck();
    this.richSpellCheck.setupEditorSpellCheck();
    
    this.theSpellcheck = this.richSpellCheck;
    gPerformancingUtil.loadXMLFIle();
    //Open Last viewed window
    var lastOpenedEditTab = null;
    try{
        lastOpenedEditTab = gPerformancingUtil.prefs.getCharPref('display.state.lastviewopened');
    }catch(e){
        lastOpenedEditTab = "tab-normal-edit";
    }
    var lastOpenedEditTabObj = document.getElementById(lastOpenedEditTab);
    performancingMidas.viewTab(lastOpenedEditTabObj);
    //window.setTimeout('performancingUI.setUpSpellCheck();', 1500, true);
}

performancingUI.setUpSpellCheck = function() {
    
}

performancingUI.doUpgrade = function() {
    var isFirstRun = gPerformancingUtil.prefs.getBoolPref("onfirstrun");
    if(isFirstRun){
        //Start All Upgrades
        //For all upgrades
        var fromPFFVersion = null;
        try{
            fromPFFVersion = gPerformancingUtil.prefs.getCharPref('extra.version.lastinstalled');
        }catch(e){}
        if(fromPFFVersion != null){
            gPerformancingUtil.prefs.setCharPref('extra.version.lastinstalled', gPerformancingVersion);
            gPerformancingUtil.prefs.setCharPref('extra.version.previous', fromPFFVersion);
        }else{
            gPerformancingUtil.prefs.setCharPref('extra.version.lastinstalled', gPerformancingVersion);
            gPerformancingUtil.prefs.setCharPref('extra.version.previous', "");
        }
        // End for All
        
        //Start 1.2 -> 1.3 upgrade 
        // Let's set insert pff by default respecting 1.2 upgraders
        var hasBlog = gPerformancingUtil.prefs.prefHasUserValue("settings.lastselected.blog");
        var insertPFFValue = true;
        try{
            insertPFFValue = gPerformancingUtil.prefs.getBoolPref('extra.insertpfftext');
        }catch(e){}
        //Insert Powered by Performancing
        if( hasBlog ){
            gPerformancingUtil.prefs.setBoolPref('extra.insertpfftext2', insertPFFValue);
        }//else default is already true
        // End from 1.2 upgrade
        
        
        // END first run
        gPerformancingUtil.prefs.setBoolPref("onfirstrun", false);
    }
}
performancingUI.setCSS = function() {
    //performancingUI.setCSS
    var winPreview = document.getElementById("performancing-preview-display");
    var previewCSS = winPreview.contentDocument.getElementById("performancing-preview-css");
    previewCSS.href = gPerformancingUtil.prefs.getCharPref("content.preview.cssurl");
}

performancingUI.initTechnorati = function() {
    var isAuto = gPerformancingUtil.prefs.getBoolPref("extra.inserttechnorati");
    document.getElementById("performancing-technorati-tags-button").hidden = isAuto;
    document.getElementById("performancing-technorati-extrainfo").hidden = !isAuto;
}

performancingUI.launchWindow = function(xulDoc) {
    window.open(xulDoc, '_blank', 'chrome,centerscreen,resizable=yes,titlebar=yes,dependent=yes')
}

performancingUI.reLoadBlogs = function() {
    gPerformancingUtil.loadXMLFIle();
    //alert('Refreshed xml');
}

performancingUI.onBlogSelect = function(theListElement) {
    var theSelectedBlogUID = theListElement.getAttribute('blogGUID');
    var theSelectedBlogURL = theListElement.getAttribute('tooltiptext');
    
    performancingUI.setBlogAsSelected(theSelectedBlogUID, theSelectedBlogURL);
}

performancingUI.setBlogAsSelected = function(theSelectedBlogUID, theSelectedBlogURL) {
    gSelectedBlog = theSelectedBlogUID;
    gPerformancingUtil.prefs.setCharPref("settings.lastselected.blog", gSelectedBlog);
    
    performancingUI.showCurrentBlog(theSelectedBlogUID, theSelectedBlogURL);
}

performancingUI.toggleNavbar = function() {
    var theNavBar = document.getElementById('performancing-navbar');
    var toggltBtn = document.getElementById('performancing-navbar-toggle');
    var isCollapsed = theNavBar.collapsed;
    theNavBar.collapsed = !isCollapsed;
    if(isCollapsed){
        toggltBtn.setAttribute("state", "open");
        var localeString = performancingUI.getLocaleString('closesidebar', []);
        toggltBtn.setAttribute('tooltiptext', localeString);
    }else{
        toggltBtn.setAttribute("state", "closed");
        var localeString = performancingUI.getLocaleString('opensidebar', []);
        toggltBtn.setAttribute('tooltiptext', localeString);
    }
}

performancingUI.onSidebarTabSelect = function(theSBTabElement, hideEditButtons) {
    var theDeckIndex = theSBTabElement.getAttribute('deck');
    var theNavBoxInfo = document.getElementById('performancing-sidebar-vbox');
    theNavBoxInfo.setAttribute('selectedIndex', theDeckIndex);
	
    var numberOfNavs = document.getElementById('performancing-sidebarnav-hbox-0').getElementsByTagName("label").length;
    var theGoodOne = 0;
	
    // Close all the other boxes
    for (var i = 0; i < numberOfNavs; i++){
        if (i == theDeckIndex){
            theGoodOne = i;
        } else {
            document.getElementById('blog-sidebar-listing-'+i).setAttribute('collapsed', true);
        }
        document.getElementById('performancing-sb-tab'+i).setAttribute('selected', false); //currentlySelectedTab
    }
	
    document.getElementById('blog-sidebar-listing-'+theGoodOne).setAttribute('collapsed', false);
    theSBTabElement.setAttribute('selected', true);
    
    if (hideEditButtons) {
    	document.getElementById("post-edit-buttons").hidden = true;
    }
}

performancingUI.onLeftSidebarTabSelect = function(theTab) {
    var theNavBox = document.getElementById('performancing-navbar-tabs');
    var theAddonNavBox = document.getElementById('performancing-navbar-tabs-addons');
    var numberOfTabs = theNavBox.childNodes.length;
    var doCollapse = true;
    //Close all the other boxes
    for(var i=0; i < numberOfTabs; i++){
        theNavBox.childNodes[i].setAttribute('selected', false);
    }
    
    numberOfTabs = theAddonNavBox.childNodes.length;
    for(var i=0; i < numberOfTabs; i++){
        theAddonNavBox.childNodes[i].setAttribute('selected', false);
    }
    
    var theName = "";
    try{
        theName = theTab.getAttribute("name");
    }catch(e){
        theName = theTab.toString();
    }
    //Set the selected tab
    document.getElementById('performancing-' + theName + '-tab').setAttribute('selected', true);
    
    var theMainDeck = document.getElementById('performancing-main-content-deck');
    
    var theSwitchVar = theName;
    var theAddon = "";
    
    try{
        theAddon = theTab.getAttribute("addon");
    }catch(e){}
    
    if(theAddon == "custom"){
        theSwitchVar = theAddon;
    }
    //First uncollapse the one we selected collapsed="true"
    if(theName != 'notes' && theName != 'addons'){
        document.getElementById('performancing-'+ theName +'-content').setAttribute('collapsed', false);
    }
    
    switch(theSwitchVar){																  
        case 'editor':
            theMainDeck.setAttribute('selectedIndex','0');
            var theEditorEl = document.getElementById('performancing-sb-tab0');
            performancingUI.onSidebarTabSelect(theEditorEl);
            performancingMidas.toggleSidebar(true);
            //performancingMidas.makeBlank();
            break;
            
        case 'notes':
            theMainDeck.setAttribute('selectedIndex','0');
            var theEditorEl = document.getElementById('performancing-sb-tab3');
            performancingUI.onSidebarTabSelect(theEditorEl);
            performancingMidas.toggleSidebar(true);
            //performancingMidas.makeBlank();
            break;
            
        case 'settings':
            theMainDeck.setAttribute('selectedIndex','1');
            this.loadSettings();//performancingUI.loadSettings
            break;
            
        case 'technorati':
            theMainDeck.setAttribute('selectedIndex','2');
            performancingUI.getPageInfo('technorati');
            break;
            
        case 'delicious':
            theMainDeck.setAttribute('selectedIndex','3');
            performancingUI.deliciousOnLoad();
            performancingUI.getPageInfo('delicious');
            break;
            
        case 'about':
            theMainDeck.setAttribute('selectedIndex','4');
            if(!gPerformanceDidGetRSS){
                performancingUI.getAboutRSS();
            }
            break;
            
        case 'addons':
            pffAddonSkin.loadAddonTabs(theTab);
            doCollapse = false;
            break;
            
        case 'custom':
            pffAddonSkin.onAddonTabClick(theTab);
            break;
            
    }
    //Collapse all other
    if(doCollapse){
        this.collapseContent(theName);
    }
}

//We collapse the elements to keep resizing space
performancingUI.collapseContent = function(notThisOne) {
    //var theEditorEl = document.getElementById('performancing-settings-content');
    
    //Now collapse all the others
    //var contentArray = ['delicious', 'editor', 'settings', 'about', 'technorati'];
    //Only collapse elements that need to be (those that don't overdlow)
    var contentArray = ['editor', 'settings', 'about'];
    for(var i = 0; i < contentArray.length ; i++){
        var theContent = document.getElementById('performancing-'+ contentArray[i] +'-content');
        if(notThisOne == contentArray[i]){
            //theContent.setAttribute('collapsed', false);
        }else{
            theContent.setAttribute('collapsed', true);
        }
    }
}

performancingUI.checkSubjectEmpty = function() {
    var theSubjectEntry = document.getElementById("performancing-editor-subject").value;
    if(theSubjectEntry.length < 2 ){
        var localeString = performancingUI.getLocaleString('subjectisblank', []);
        return confirm(localeString);
    }else{
        return true;
    }
}

performancingUI.postSuccessful = function() {
    var thePublishDeck = document.getElementById('performancing-feedback-deck');;
    thePublishDeck.setAttribute('selectedIndex','0');
    window.clearTimeout(gPffOnPublishTimeOut);
}

performancingUI.okClearPost = function(isClear) {
    gPFFLastTags = document.getElementById("performancing-technorati-tags").value;
    gPFFLastTrackbacks = document.getElementById("performancing-trackback-textbox").value;
    if(isClear){
        performancingUI.clearTechnoratiTags();
        gPerformancingUtil.checkCategories(false);
        performancingUI.clearTrackbacks();
        performancingMidas.makeBlank();
        performancingUI.toggleExtraOptDeck(true);
    }
    var thePublishDeck = document.getElementById('performancing-feedback-deck');;
    thePublishDeck.setAttribute('selectedIndex','1');
    performancingUI.onProgressOff();
}

performancingUI.onServerSend = function() {
    var thePublishDeck = document.getElementById('performancing-publish-deck');;
    thePublishDeck.setAttribute('selectedIndex','1');
    gPffOnPublishTimeOut = window.setTimeout('performancingUI.onProgressOff()', 20000, true);
}

performancingUI.onProgressOff = function() {
    var thePublishDeck = document.getElementById('performancing-publish-deck');
    thePublishDeck.setAttribute('selectedIndex','0');
}

performancingUI.showCurrentBlog = function(aUID, aURL) {
    var theBlogXML = gLastXMLBlogObject.blogs.blog.(GUID == aUID );
	
    var theBlogStatus = document.getElementById("performancing-blogstatus");
   
    if( theBlogXML.blogname.toString() == "" ){
        var localeString = performancingUI.getLocaleString('noblogselected', []);
        theBlogStatus.value = localeString;
    }else{
        theBlogStatus.value = theBlogXML.blogname.toString();
		
        gPerformancingUtil.serviceObjectXML = theBlogXML;
        gPerformancingUtil.serviceObject = bfXMLRPC.setUpBlogObject(theBlogXML);
        
        window.setTimeout('gPerformancingUtil.getBlogHistory("'+aUID+'")', 1000, true);
		window.setTimeout('gPerformancingUtil.getCategoryList("'+aUID+'")', 2000, true);
		        
        gPerformancingUtil.setUpAPISpecificFunctions(aUID);
    }
    
    //Now show it selected
	var blogGroup = document.getElementById("blog-group");
	var blogItems = blogGroup.getElementsByTagName("radio");
	var numberOfBlogs = blogItems.length;

	for (var i = 0; i < numberOfBlogs; i++){
		var theGUID = blogItems[i].getAttribute("blogGUID");
		if(theGUID == gSelectedBlog ){
			blogGroup.selectedItem = blogItems[i];
			break;
		}
	}
	
	var publishButtonLabel = performancingUI.getLocaleString("publishToBlog", [  theBlogXML.blogname.toString() ]);
	document.getElementById("performancing-publish-button").setAttribute("label", publishButtonLabel);
	
	var editButtons = document.getElementById("post-edit-buttons");
	editButtons.hidden = true;
}

performancingUI.toggleEnableOnPost = function() {
    /* var richTextBox = document.getElementById("performancing-message");
    var SourceTextBox = document.getElementById("performancing-message-source");
    richTextBox.disabled = !richTextBox.disabled;
    SourceTextBox.disabled = !SourceTextBox.disabled; */
    
    var editButtons = document.getElementById("post-edit-buttons");
    editButtons.hidden = true;
    
    var noteButton = document.getElementById("performancing-resavenote-button");
    noteButton.hidden = true;
    
}

performancingUI.clearAll = function() {
    performancingMidas.makeBlank();
    performancingUI.toggleExtraOptDeck(true);
    this.toggleEnableOnPost();
    performancingUI.clearTechnoratiTags();
}

performancingUI.openInTab = function(aURL) {
    var myLastWin = performancingUI.getLastWindow();
    var editorInTab = myLastWin.gBrowser.addTab(aURL);
    myLastWin.getBrowser().selectedTab = editorInTab;
}

performancingUI.getLastWindow = function() {
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface( Components.interfaces.nsIWindowMediator);
    var topWindowOfType = windowManagerInterface.getMostRecentWindow( "navigator:browser" );
    
    if (topWindowOfType) {
        return topWindowOfType;
    }else{
        return null;
    }
}

performancingUI.blogThis = function() {
    var thePageProps = this.getLastPageURInTitle();
    var theURL = thePageProps[0];
    var theTitle = thePageProps[1];
    
    var selectedContent = null;
    try{
        var focusedWindow = document.commandDispatcher.focusedWindow;  
        if (focusedWindow == window){
              focusedWindow = _content;
              }
            var docCharset = null;
            if (focusedWindow){
              docCharset = "charset=" + focusedWindow.document.characterSet;
        }
        //selectedContent = focusedWindow.__proto__.getSelection.call(focusedWindow).toString();
        selectedContent = focusedWindow.getSelection().toString();
    }catch(e){
        //foo
    }
    //alert("Title: "+theTitle+ " URL: " + theURL);
    performancingUI.doBlogThisInsert(theTitle, theURL, selectedContent);
}

performancingUI.openAboutFromEM = function() {
    gperformancing.openBottomBar(true, true);
    var myIframeWindow = document.getElementById('perFormancingMidasFrame').contentWindow;
    myIframeWindow.setTimeout("performancingUI.onLeftSidebarTabSelect('about')", 1000, true);
}

performancingUI.openTechnorati = function() {
    gperformancing.openBottomBar(true, true);
    var myIframeWindow = document.getElementById('perFormancingMidasFrame').contentWindow;
    myIframeWindow.setTimeout("performancingUI.onLeftSidebarTabSelect('technorati')", 1000, true);
}

performancingUI.openDelicious = function() {
    gperformancing.openBottomBar(true, true);
    var myIframeWindow = document.getElementById('perFormancingMidasFrame').contentWindow;
    myIframeWindow.setTimeout("performancingUI.onLeftSidebarTabSelect('delicious')", 1000, true);
}

performancingUI.doBlogThisInsert = function(theTitle, theURL, selectedContent) {
    var textToAppend = null;
    selectedContent = selectedContent.toString();
    if(selectedContent != null && selectedContent != "" ){
        textToAppend = "<a href=\"" +theURL+ "\" >" + theTitle + "</a> <br/> <blockquote>" + selectedContent + "</blockquote";
    }else{
        textToAppend = "<a href=\"" +theURL+ "\" >" + theTitle + "</a>";
    }
    //gPFFBlogThisText
    //Open up the inline bar if it's not open
    if(!gperformancing.isOpen()){
        gPFFBlogThisText = [];
        gPFFBlogThisText.push(true);
        gPFFBlogThisText.push(textToAppend);
        gperformancing.openBottomBar(true);
    }else{
        this.doInsert(textToAppend);
        gperformancing.openBottomBar(true);
    }
}
performancingUI.onLoadInsert = function() {
    var theWindow = performancingUI.getLastWindow();
    if(theWindow.gPFFBlogThisText[0] == true){
        this.doInsert(theWindow.gPFFBlogThisText[1]);
        //alert("It's true");
        theWindow.gPFFBlogThisText = [];//No clear the memory
    }
    //alert("It's FALSE");
}

performancingUI.doInsert = function(textToAppend) {
    var myDoc = performancingUI.getPffDoc();
    var tabbox = myDoc.getElementById("performancing-editor-tabbox");
    //var theTitle = myDoc.getElementById("performancing-editor-subject").value;
    if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
            var winNormal = myDoc.getElementById("performancing-message");
            winNormal.contentWindow.document.body.innerHTML = winNormal.contentWindow.document.body.innerHTML + "<br/>" + textToAppend;
        }else if(tabbox.selectedIndex == 1){ //Source
            var theSourceBox = myDoc.getElementById("performancing-message-source");
            theSourceBox.value = theSourceBox.value + "<br/>" + textToAppend;
        }else{
        //alert('PerFormancing Error: Could not find Note content, please contact the author');
    }
}

performancingUI.getPffDoc = function() {
    var myIframeDocument = null;
    try{
        myIframeDocument = document.getElementById('perFormancingMidasFrame').contentDocument;
    }catch(e){
        myIframeDocument = document;
    }
    return myIframeDocument;
}

performancingUI.getRichEditor = function() {
    var myDoc = performancingUI.getPffDoc();
    var theEditor = myDoc.getElementById("performancing-message");
    return theEditor;
}

performancingUI.getRichEditorWindow = function() {
    var theEditor = performancingUI.getRichEditor();
    return theEditor.contentWindow;//.document.body.innerHTML
}

performancingUI.getPreviewWindow = function() {
    var myDoc = performancingUI.getPffDoc();
    var thePreview = myDoc.getElementById("performancing-preview-display");
    
    return thePreview.contentWindow;
}

performancingUI.onEditFocus = function() {
}
performancingUI.onSubjectKeyPress = function(theInput, event) {
    //dump("\n\n SUBJECT KEYPRESS: " + event.keyCode + "\n\n");
    if (theInput.value == "") return 0;
    
    if (event.keyCode == 8){
        //dontGetArray = "0";
        return 0;
    }else if(event.keyCode == 13){
        theInput.selectionStart = theInput.selectionEnd;
    }
    this.populateArray(theInput,event);
    return 1;
}

performancingUI.onBoolSettingsSet = function(theInput) {
    var theWindow = performancingUI.getLastWindow();
    var theCheckBoxPref = theInput.getAttribute('pref');
    var theCheckBoxChecked = theInput.checked;
    gPerformancingUtil.prefs.setBoolPref(theCheckBoxPref, theCheckBoxChecked);
    
    switch(theCheckBoxPref){
        case 'display.onbottom':
            alert("This settings requires a browser restart.");
            break;
            
        case 'settings.usecss':
            var midas = document.getElementById("performancing-message");
            midas.contentDocument.execCommand("styleWithCSS", false, theCheckBoxChecked);
            break;
            
        case 'settings.saveonexit':
            //foo
            break;
            
        case 'display.hideContextMenu':
            theWindow.gperformancing.showHideCM();
            break;
            
        case 'settings.showextrapuboptions':
            performancingUI.uiINIT();
            break;
            
        case 'extra.inserttechnorati':
            performancingUI.initTechnorati();
            break;
            
        case 'extra.insertpfftext2':
            //nothing
            break;
            
        case 'display.hidetechnorati':
            performancingUI.uiINIT();
            break;
            
        case 'display.hidedelicious':
            performancingUI.uiINIT();
            break;
            
        case 'publish.checkdraft':
            performancingUI.uiINIT();
            break;
            
        case 'display.enablertl':
            performancingUI.onTextBoxLoad2();
            break;
            
        case 'display.sortcats':
            //nothing
            break;
    }
}

performancingUI.loadSettings = function() {
  //var boolSettingsArray = [,,];
  try{
      document.getElementById("performancing-settings-remember-editor").checked = gPerformancingUtil.prefs.getBoolPref('settings.saveonexit');
  }catch (e){
      document.getElementById("performancing-settings-remember-editor").checked = false;
  }
  
  try{
      document.getElementById("performancing-settings-display-usecss").checked = gPerformancingUtil.prefs.getBoolPref('settings.usecss');
  }catch (e){
      document.getElementById("performancing-settings-display-usecss").checked = false;
  }
  
  try{
      document.getElementById("performancing-settings-display-onbottom-check").checked = gPerformancingUtil.prefs.getBoolPref('display.onbottom');
  }catch (e){
      document.getElementById("performancing-settings-display-onbottom-check").checked = false;
  }
  
  try{
      document.getElementById("performancing-settings-display-cm-check").checked = gPerformancingUtil.prefs.getBoolPref('display.hideContextMenu');
  }catch (e){
      document.getElementById("performancing-settings-display-cm-check").checked = false;
  }
  try{
      document.getElementById("performancing-settings-show-extra-pub").checked = gPerformancingUtil.prefs.getBoolPref('settings.showextrapuboptions');
  }catch (e){
      document.getElementById("performancing-settings-show-extra-pub").checked = false;
  }
  try{
      document.getElementById("performancing-settings-auto-technorati").checked = gPerformancingUtil.prefs.getBoolPref('extra.inserttechnorati');
  }catch (e){
      document.getElementById("performancing-settings-auto-technorati").checked = false;
  }
  
  try{
      document.getElementById("performancing-settings-cssurl").value = gPerformancingUtil.prefs.getCharPref('content.preview.cssurl');
  }catch (e){
  }
  
  try{
      document.getElementById("performancing-settings-display-technorati").checked = gPerformancingUtil.prefs.getBoolPref('display.hidetechnorati');
  }catch (e){
      document.getElementById("performancing-settings-display-technorati").checked = false;
  }
  try{
      document.getElementById("performancing-settings-display-delicious").checked = gPerformancingUtil.prefs.getBoolPref('display.hidedelicious');
  }catch (e){
      document.getElementById("performancing-settings-display-delicious").checked = false;
  }
  try{
      document.getElementById("performancing-settings-auto-draft").checked =  gPerformancingUtil.prefs.getBoolPref('publish.checkdraft');
  }catch (e){
      document.getElementById("performancing-settings-auto-draft").checked = false;
  }
  try{
      document.getElementById("performancing-settings-display-sortcats").checked =	gPerformancingUtil.prefs.getBoolPref('display.sortcats');
  }catch (e){
      document.getElementById("performancing-settings-display-sortcats").checked = false;
  }	 
  try{
      document.getElementById("performancing-settings-auto-pffpowered").checked = gPerformancingUtil.prefs.getBoolPref('extra.insertpfftext2');
  }catch (e){
      document.getElementById("performancing-settings-auto-pffpowered").checked = false;
  }
  
  try{
      document.getElementById("performancing-settings-display-rtl").checked = gPerformancingUtil.prefs.getBoolPref('display.enablertl');
  }catch (e){
      document.getElementById("performancing-settings-display-rtl").checked = false;
  }
  
}

performancingUI.getAboutRSS = function() {
    var RSSurl = 'http://www.scribefire.com/feed/';
    //PffXmlHttpReq( aUrl, aType, aContent, aDoAuthBool, aUser, aPass)
    var theCall = new PffXmlHttpReq(RSSurl, "POST", '', false, null, null);
    
    theCall.onResult = function( aText, aXML ){
        performancingUI.setAboutRSS( aText );
    }
    theCall.onError = function (aStatusMsg, Msg) {
        //foo
    }
    theCall.prepCall(); //Set up The call (open connection, etc.)
    theCall.request.setRequestHeader("Content-Type", "text/xml");
    theCall.request.setRequestHeader("User-Agent", "ScribeFire " + gPerformancingVersionUA);
    theCall.makeCall(); //Make the call
    theCall.request.overrideMimeType ('text/xml');
}

performancingUI.setAboutRSS = function(theData) {
    try{
        gPerformanceDidGetRSS = true;
        var titlesArray = theData.match(/(?:\<title\>)(.*\w*)(?=<\/title>)/mgi)
        var linksArray = theData.match(/(?:\<link\>)(.*\w*)(?=<\/link>)/mgi)
        var rssLength = titlesArray.length;
        gPerformancingUtil.clearCheckListOut("performancing-about-rss");
        //performancingUI.addItemToRSSList("Loading feeds...", "");
        
        for(i=1; i< rssLength && i < 6; i++){
            var aTitle = titlesArray[i].replace("<title>", "");
            var aLink  = linksArray[i].replace("<link>", "");
            performancingUI.addItemToRSSList(aTitle, aLink);
        }
    }catch(e){
        gPerformancingUtil.clearCheckListOut("performancing-about-rss");
        var localeString = performancingUI.getLocaleString('errorcontactingserver', []);
        performancingUI.addItemToRSSList(localeString, '');
    }
}

performancingUI.addItemToRSSList = function(aTitle, aURL) {
/*
  <label value="Some title here" class="url performancerssitem" onclick="performancingUI.openInTab('http://someurl.com');" crop="right" />
*/
    var theVbox = document.getElementById('performancing-about-rss');
    var theLabel = document.createElement('label');
    theLabel.setAttribute('value', aTitle);
    theLabel.setAttribute('class', 'url performancerssitem');
    theLabel.setAttribute('crop', 'right');
    theLabel.setAttribute('width', '200px');
    theLabel.setAttribute('onclick', "performancingUI.openInTab('" + aURL + "');");
    theVbox.appendChild(theLabel);
}

performancingUI.uiINIT = function() {
    //pffAddonSkin.loadLastSkin();//Load the users last UI CSS
    
    document.getElementById("performancing-editor-extra-pub").hidden =	!gPerformancingUtil.prefs.getBoolPref('settings.showextrapuboptions');
    document.getElementById("performancing-technorati-tab").hidden =  gPerformancingUtil.prefs.getBoolPref('display.hidetechnorati');
    document.getElementById("performancing-delicious-tab").hidden =	 gPerformancingUtil.prefs.getBoolPref('display.hidedelicious');
    document.getElementById("performancing-draft-checkbox").checked =  gPerformancingUtil.prefs.getBoolPref('publish.checkdraft');
    //alert("Dude: "+document.getElementById("performancing-editor-extra-pub").hidden);
}

performancingUI.toggleExtraOptDeck = function(forceClose) {
    var extraOptsButton = document.getElementById("performancing-editor-extra-pub");
    var extraOptDeck	= document.getElementById("performancing-editor-extra-pub-deck");
    var sidebarContent	= document.getElementById("performancing-sidebar");
    var extraoptContent = document.getElementById("performancing-sidebar-extra-options");
    
    if( extraOptDeck.getAttribute('selectedIndex') == 0 && !forceClose ){ //extraOptDeck.setAttribute('selectedIndex','0');
    	var newLabel = performancingUI.getLocaleString("closeoptions", []);
        extraOptsButton.setAttribute('label', newLabel);
        extraOptDeck.setAttribute('selectedIndex','1');
        sidebarContent.setAttribute('collapsed', true);
        extraoptContent.setAttribute('collapsed', false);
    }else{
    	var newLabel = performancingUI.getLocaleString("publishingoptions", []);
        extraOptsButton.setAttribute('label', newLabel);
        extraOptDeck.setAttribute('selectedIndex','0');
        sidebarContent.setAttribute('collapsed', false);
        extraoptContent.setAttribute('collapsed', true);
    }
}

performancingUI.clearTechnoratiTags = function() {
    gPFFLastTags = document.getElementById("performancing-technorati-tags").value;
    document.getElementById("performancing-technorati-tags").value = "";
}

performancingUI.insertTechnorati = function() {
    var regXP = /class\=\"performancingtags/;
    if( !performancingUI.checkIfContentMatch(regXP) ){
        var theTagList = document.getElementById("performancing-technorati-tags").value;
        if(theTagList != "" && theTagList != " " ){
            //First clear out spaces following ','.
            var re = /\,\s+/g;
            theTagList = theTagList.replace(re, ",");
            
            var theTagArrayList = theTagList.split(",");
            var theTagLinkArray = [];
            for(i=0; i < theTagArrayList.length; i++ ){
                theTagLinkArray.push( this.createTechnoratiLinksArray( theTagArrayList[i] ) );
            }
            performancingUI.doechnoratiLinksInsert( theTagLinkArray );
        }
    }
    
}

performancingUI.createTechnoratiLinksArray = function(aTagName){
    var aTagLink = "<a class=\"performancingtags\" href=\"http://technorati.com/tag/_tagname_\" rel=\"tag\">_tagname_</a>";
    //turn double spaces to single space
    var re = /\s\s+/g;
    aTagName = aTagName.replace(re, " ");
    
    var re = /_tagname_/g;
    aTagLink = aTagLink.replace(re, aTagName);
    //alert("theTagLink: " + theTagLink);
    return aTagLink;
}

performancingUI.doechnoratiLinksInsert = function(theTagLinkArray) {
    //var myIframeWindow = document.getElementById('perFormancingMidasFrame').contentDocument;
    
    //var textToAppend = "Technorati Tags:";
    var textToAppend = performancingUI.getLocaleString('technoratitags', []);
    
    for(i=0; i < theTagLinkArray.length; i++ ){
        if(i == theTagLinkArray.length-1){
            textToAppend = textToAppend + " " + theTagLinkArray[i] + "";
        }else{
            textToAppend = textToAppend + " " +	 theTagLinkArray[i] + ",";
        }
    }
    
    if(theTagLinkArray.length > 0){
        performancingUI.appendText( textToAppend );
    }
}

performancingUI.insertPoweredByPFF = function() {
    var regXP = /class\=\"poweredbyperformancing/;
    if( !performancingUI.checkIfContentMatch(regXP) ){
        var theText = '<p class="poweredbyperformancing">Powered by <a href="http://scribefire.com/">ScribeFire</a>.</p>';
        performancingUI.appendText( theText );
    }
}

performancingUI.checkIfContentMatch = function(theRegExp) {
    var tabbox = document.getElementById("performancing-editor-tabbox");
    var theContent = "";
    //var theTitle = myIframeWindow.getElementById("performancing-editor-subject").value;
    if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
        var winNormal = document.getElementById("performancing-message");
        theContent = winNormal.contentWindow.document.body.innerHTML;
    }else if(tabbox.selectedIndex == 1){ //Source
        var theSourceBox = document.getElementById("performancing-message-source");
        theContent = theSourceBox.value;
    }else{
        //alert('PerFormancing Error: Could not find Note content, please contact the author');
        theContent = null;
    }
    if(theContent != null){
        if(theRegExp.test(theContent)){
            return true;
        }
    }
    return false;
}

performancingUI.appendText = function(theText) {
    var tabbox = document.getElementById("performancing-editor-tabbox");
    //var theTitle = myIframeWindow.getElementById("performancing-editor-subject").value;
    if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
        var winNormal = document.getElementById("performancing-message");
        winNormal.contentWindow.document.body.innerHTML = winNormal.contentWindow.document.body.innerHTML + "<br/><br/>" + theText;
    }else if(tabbox.selectedIndex == 1){ //Source
        var theSourceBox = document.getElementById("performancing-message-source");
        theSourceBox.value = theSourceBox.value + "\n\n" + theText;
    }else{
        //alert('PerFormancing Error: Could not find Note content, please contact the author');
    }
}

//insertPoweredByPFF

performancingUI.cssPreviewSaveNLoad = function() {
    previewCSS = document.getElementById("performancing-settings-cssurl");
    gPerformancingUtil.prefs.setCharPref("content.preview.cssurl", previewCSS.value);
    
    //Now Load it
    performancingUI.setCSS();
}

performancingUI.getLastPageURInTitle = function(){
    var theWindow = performancingUI.getLastWindow();
    var docWrapper = new XPCNativeWrapper(theWindow.content);
    var theURL = docWrapper.location.href;
    var theTitle = docWrapper.document.title
    return [theURL, theTitle];
}

performancingUI.getPageInfo = function(anAction){
    var myLastWin = performancingUI.getLastWindow();
    var thePageProps = this.getLastPageURInTitle();
    var theURL = thePageProps[0];
    var theTitle = thePageProps[1];
    //var theURL = Components.lookupMethod(myLastWin._content, 'location').call(myLastWin._content).href;
    //var theTitle = Components.lookupMethod(myLastWin._content.document, 'title').call(myLastWin._content.document);
    var performancingSplinter = myLastWin.document.getElementById("performancingSplit");
    if( theURL != gPerformanceLastURL ){
        if(anAction == 'technorati'){
            if( !performancingSplinter.collapsed ){
                document.getElementById("performancing-technorati-loading-img").hidden = false;
                //document.getElementById("performancing-technorati-title").value = "Loading...";
                var weAreLoading = performancingUI.getLocaleString('loading', []);
                document.getElementById("performancing-technorati-title").value = weAreLoading;
                //var RSSurl = 'http://technorat.com/node/feed/';
                var RSSurl = 'http://feeds.technorati.com/cosmos/rss/?partner=performancing&url=' + encodeURIComponent(theURL);
                
                //Set the Title
                document.getElementById("performancing-technorati-currentpagetitle").value = theTitle;
                gPerformanceLastURL = theURL;
                performancingUI.technoratiSetTimeOut();
                //PffXmlHttpReq( aUrl, aType, aContent, aDoAuthBool, aUser, aPass)
                var theCall = new PffXmlHttpReq(RSSurl, "POST", '', false, null, null);
                
                theCall.onResult = function( aText, aXML ){
                    performancingUI.setPageInfo( aText, theTitle );
                }
                theCall.onError = function (aStatusMsg, Msg) {
                    //foo
                }
                theCall.prepCall(); //Set up The call (open connection, etc.)
                theCall.request.setRequestHeader("Content-Type", "text/xml");
                theCall.request.setRequestHeader("User-Agent", "ScribeFire " + gPerformancingVersionUA);
                theCall.makeCall(); //Make the call
                theCall.request.overrideMimeType ('text/xml');
            }
        }else if(anAction == 'delicious'){
            performancingUI.deliciousClearBM();
            document.getElementById("performancing-delicios-bookmark-url").value = theURL;
            document.getElementById("performancing-delicios-bookmark-desc").value = theTitle;
            performancingUI.deliciousGetPageInfo(theURL);
        }
    }
}

performancingUI.setPageInfo = function(theData, thePageTitle) {
    performancingUI.technoratiClearTimeOut();
    var re = /(\<\?\xml[0-9A-Za-z\D]*\?\>)/;
    var newstr = theData.replace(re, "");
    var theXML = new XML(newstr);
    //gPFFTempObject.push(theXML);
    var t = new Namespace("tapi", "http://api.technorati.com/dtd/tapi-002.xml")
    var theInboundBlogNum = theXML.channel.t::["result"].t::["inboundblogs"].toString();
    var theInboundLinkNum = theXML.channel.t::["result"].t::["inboundlinks"].toString();
    if(theInboundBlogNum == null || theInboundBlogNum == "" ){
        theInboundBlogNum = "0";
    }
    if(theInboundLinkNum == null || theInboundLinkNum == "" ){
        theInboundLinkNum = "0";
    }
    
    var numberOfItems = theXML.channel.item.length();
    gPerformancingUtil.clearCheckListOut("performancing-technorati-inboundlinks");
    for(i = 0; i<numberOfItems && i < 10; i++ ){
        performancingUI.addItemToTechnoratiList(theXML.channel.item[i].title, theXML.channel.item[i].link);
    }
    //performancingUI.addItemToTechnoratiList("More results...", theXML.channel.link + '/?partner=performancing');
    document.getElementById("performancing-technorati-moreresults").setAttribute('onclick', "performancingUI.openInTab('" + theXML.channel.link + '/?partner=performancing' + "');")
    
    //Now set the info:
    document.getElementById("performancing-technorati-linkcount").value = theInboundLinkNum;
    document.getElementById("performancing-technorati-blogcount").value = theInboundBlogNum;
    document.getElementById("performancing-technorati-loading-img").hidden = true;
    document.getElementById("performancing-technorati-title").value = "Technorati";
}

performancingUI.addItemToTechnoratiList = function(aTitle, aURL){
    var theVbox = document.getElementById('performancing-technorati-inboundlinks');
    var theLabel = document.createElement('label');
    theLabel.setAttribute('value', " " +aTitle);
    theLabel.setAttribute('class', 'url performancerssitem');
    theLabel.setAttribute('maxwidth', '300px');
    theLabel.setAttribute('crop', 'right');
    theLabel.setAttribute('style', 'font-size: x-small');
    theLabel.setAttribute('tooltiptext', aURL);
    theLabel.setAttribute('onclick', "performancingUI.openInTab('" + aURL + "');");
    theVbox.appendChild(theLabel);
}

performancingUI.onTechnoratiKeyPress = function(anEvent){
    if(anEvent.keyCode == 13){
            performancingUI.onTechnoratiSearch();
    }
}

performancingUI.onTechnoratiSearch = function(){
    var itemURL = 'http://technorati.com/search/' + document.getElementById('performancing-technorati-srchtechnorati').value + '?partner=performancing';
    performancingUI.openInTab(itemURL);
}

performancingUI.technoratiSetTimeOut = function(){
    gPffTechnoratiTimeOut = window.setTimeout('performancingUI.technoratiOnTimeOut()', 20000);
}

performancingUI.technoratiOnTimeOut = function(){
    var errorMessage = performancingUI.getLocaleString('technoratitimeout', []);
    //Sorry, Technorati has timed out. Their service might be down or unstable, please try again.
    alert(errorMessage);
}

performancingUI.technoratiClearTimeOut = function(){
    window.clearTimeout(gPffTechnoratiTimeOut);
}
//
performancingUI.deliciousSetTimeOut = function(){
    gPffDeliciousTimeOut = window.setTimeout('performancingUI.deliciousOnTimeOut()', 20000);
}

performancingUI.deliciousOnTimeOut = function(){
    //alert("Sorry, Delicious has timed out. Their service might be down or unstable, please try again.");
    //Login
    document.getElementById('performancing-delicios-loading-img').hidden = true;
    //Save Bookmark
    document.getElementById('performancing-delicios-saving-img').hidden = true;
}

performancingUI.deliciousClearTimeOut = function(){
    window.clearTimeout(gPffDeliciousTimeOut);
}

performancingUI.deliciousOnLoad = function(){
    var savePassword = gPerformancingUtil.prefs.getBoolPref("extra.delicious.savePassword");
    if(savePassword){
        var theUserName = gPerformancingUtil.prefs.getCharPref("extra.delicious.login");
        if(theUserName != "" && theUserName != "null" ){
            document.getElementById('performancing-delicios-login-username').value = theUserName;
            document.getElementById('performancing-delicios-login-password').value = gPerformancingUtil.goGetPassword(theUserName, "pff-delicious");
            performancingUI.deliciousLogin();
        }
    }
    document.getElementById('performancing-delicios-login-save').checked = savePassword;
}

performancingUI.deliciousOnSaveCheck = function(){
    var savePassword = document.getElementById('performancing-delicios-login-save').checked;
    gPerformancingUtil.prefs.setBoolPref("extra.delicious.savePassword", !savePassword);
    
}

performancingUI.doDeliciousCall = function(theURL, message, theAction, userName, passWord, doAuth){
    //PffXmlHttpReq( aUrl, aType, aContent, aDoAuthBool, aUser, aPass)
    var theCall = new PffXmlHttpReq(theURL, "GET", message, doAuth, userName, passWord);
    
    theCall.onResult = function( aText, aXML ){
        performancingUI.deliciousResponse( aText, message, theAction, userName, passWord);
    }
    theCall.onError = function (aStatusMsg, Msg) {
        //foo
    }
    theCall.prepCall(); //Set up The call (open connection, etc.)
    theCall.request.setRequestHeader("Content-Type", "text/xml");
    theCall.request.setRequestHeader("User-Agent", "ScribeFire " + gPerformancingVersionUA);
    theCall.makeCall(); //Make the call
    theCall.request.overrideMimeType ('text/xml');
}

performancingUI.deliciousLogin = function(){
    document.getElementById('performancing-delicios-loading-img').hidden = false;
    performancingUI.deliciousSetTimeOut();
    if( performancingUI.deliciousIsLoggedIn() ){
        //performancingUI.getPageInfo('delicious');
    }else{
        var theUserName = gPerformancingUtil.prefs.getCharPref("extra.delicious.login");
        var userName = document.getElementById('performancing-delicios-login-username').value;
        var passWord = document.getElementById('performancing-delicios-login-password').value;
        
        if(theUserName != 'null' && (userName == "" || passWord == "" )){
            var errorMessage = performancingUI.getLocaleString('delicioususererror', []);
            //Please make sure you have entered a Username and Password
            alert(errorMessage);
        }else{
            performancingUI.doDeliciousCall('https://api.del.icio.us/v1/posts/update', '', 'login', userName, passWord, true);
        }
    }
}

performancingUI.deliciousResponse = function(aResponse, aMessage, anAction, userName, passWord){
    //alert('Response Baby: ' +aResponse);
    //If save password
    //var savePassword = gPerformancingUtil.prefs.getBoolPref("extra.delicious.savePassword");
    var re = /(\<\?\xml[0-9A-Za-z\D]*\?\>)/;
    var newResponse = aResponse.replace(re, "");
        
    switch(anAction){
        case 'login':
            performancingUI.deliciousClearTimeOut();
            if(newResponse.search("update time") != -1 ){//If we really logged in
                var savePassword = document.getElementById('performancing-delicios-login-save').checked;
                if(savePassword){
                    var addedUser = gPerformancingUtil.usermanagment.storeLoginDetails(userName, passWord, "pff-delicious");
                    gPerformancingUtil.prefs.setCharPref("extra.delicious.login", userName);
                }
                document.getElementById('performancing-delicios-deck').setAttribute('selectedIndex', '1');
                performancingUI.getPageInfo('delicious');
                performancingUI.getTags('delicious');
            }else{
                var errorMessage = performancingUI.getLocaleString('deliciousloginerror', []);
                //Error logging into Del.Icio.Us, please check your username and password, and try again.
                alert(errorMessage + "\n" + newResponse);
            }
            document.getElementById('performancing-delicios-loading-img').hidden = true;
            break;
            
        case 'pageInfo':
            var myXML = new XML(newResponse);
            if(myXML.post.length() >= 1){
                document.getElementById('performancing-delicios-bookmark-url').value = myXML.post.@href;
                document.getElementById('performancing-delicios-bookmark-desc').value = myXML.post.@description;
                var theTags = myXML.post.@tag;
                if(theTags == "system:unfiled"){
                    theTags="";
                }
                document.getElementById('performancing-delicios-bookmark-tags').value = theTags;
                document.getElementById('performancing-delicios-bookmark-notes').value = myXML.post.@extended;
            }
            break;
            
        case 'createbm':
            //alert('Created Bookmark');
            performancingUI.deliciousClearTimeOut();
            document.getElementById('performancing-delicios-saving-img').hidden = true;
            performancingUI.deliciousClearBM();
            performancingUI.getTags('delicious');
            break;
            
        case 'getTags':
            var myXML = new XML(newResponse);
            gPffDeliciosTagArray = [];
            if(myXML.tag.length() >= 1){
                for(i=0; i < myXML.tag.length(); i++){
                    gPffDeliciosTagArray.push( myXML.tag[i].@tag );
                }
            }
            performancingUI.deliciousLoadTags();
            break;
            
    }
    //
    
}

performancingUI.deliciousGetPageInfo = function(aURL){
    if( performancingUI.deliciousIsLoggedIn() ){
        performancingUI.doDeliciousCall('https://api.del.icio.us/v1/posts/get?url='+aURL, '', 'pageInfo', '', '', false);
    }
}

performancingUI.deliciousIsLoggedIn = function(){
    if ( document.getElementById('performancing-delicios-deck').getAttribute('selectedIndex') == '1' ){
        return true;
    }
    return false;
}

performancingUI.deliciousPostBookmark = function(){
     if( performancingUI.deliciousIsLoggedIn() ){
        performancingUI.deliciousSetTimeOut();
        document.getElementById('performancing-delicios-saving-img').hidden = false;
        var theUrl = document.getElementById('performancing-delicios-bookmark-url').value;
        var theDesc = document.getElementById('performancing-delicios-bookmark-desc').value;
        var theNotes = document.getElementById('performancing-delicios-bookmark-notes').value;
        var theTags = document.getElementById('performancing-delicios-bookmark-tags').value;
        performancingUI.doDeliciousCall('https://api.del.icio.us/v1/posts/add?url='+theUrl+'&description='+theDesc+'&extended='+theNotes+'&tags='+theTags, '', 'createbm', '', '', false);
    }
}

performancingUI.deliciousClearBM = function(){
    document.getElementById('performancing-delicios-bookmark-url').value = "";
    document.getElementById('performancing-delicios-bookmark-desc').value = "";
    document.getElementById('performancing-delicios-bookmark-tags').value = "";
    document.getElementById('performancing-delicios-bookmark-notes').value = "";
}

performancingUI.getTags = function(aService){
    //http://del.icio.us/api/tags/get
    if(aService == 'delicious'){
        window.setTimeout("performancingUI.doDeliciousCall('https://api.del.icio.us/v1/tags/get', '', 'getTags', '', '', false)", 1000, true);
    }
}

performancingUI.deliciousLoadTags = function(){
    gPerformancingUtil.clearCheckListOut("performancing-delicios-tag-list");
    var userName = gPerformancingUtil.prefs.getCharPref("extra.delicious.login");
    for(i=0; i < gPffDeliciosTagArray.length; i++){
        performancingUI.deliciousAddTags(userName, gPffDeliciosTagArray[i]);
    }
}

performancingUI.deliciousAddTags = function(aName, aTag){
        var tagList = document.getElementById('performancing-delicios-tag-list');
        var theLabel = document.createElement('label');
        theLabel.setAttribute('value', " " +gPffDeliciosTagArray[i]);
        theLabel.setAttribute('class', "url");
        theLabel.setAttribute('width', "200px");
        theLabel.setAttribute('crop', "end");
        theLabel.setAttribute('onclick', "performancingUI.openInTab('" + "http://del.icio.us/"+aName+"/"+aTag+ "');");
        tagList.appendChild(theLabel);
}

performancingUI.autocomplete = function(theInput,event){
    var tmp = "";
    try{
        tmp = theInput.value.toLowerCase();
    }catch(e){
        return 1;
    }
    if (tmp == ""){
        //alert("tmp=0");
        return 1;
    }
    for (var z=0;z<gPffDeliciosTagArray.length;z++){
        var tmp2 = gPffDeliciosTagArray[z].toLowerCase();
        var count = 0;
        for (var i = 0;i<tmp.length;i++){
            if (tmp2.charAt(i) == tmp.charAt(i)){
                count++
            }
        }
        if (count == tmp.length){
            var diff = tmp2.length - tmp.length;
            if (diff <= 0) break;
            var kap = "";
            for (i=0;i<tmp2.length;i++){
                if (i >= tmp.length) kap += tmp2.charAt(i);
            }
            theInput.backspace = true;
            tmp = kap;
            
            //Insert Guessed Word
            var temp_n = theInput.value.length;
            theInput.value = gPffDeliciosTagArray[z];
            
            //Get Selection
            theInput.selectionEnd = theInput.value.length + temp_n;
            theInput.selectionStart = temp_n;
            return 0;
        }else{
            return 1;
        }
    }
    return 1;
}

//onkeyup="fareCompareA.getKeys(this,event)"
performancingUI.getKeys = function(theInput,event){
    if (theInput.value == "") {
        performancingUI.deliciousLoadTags();
    }
    
    if (event.keyCode == 8){
        //dontGetArray = "0";
        //return 0;
    }/*else if(event.keyCode == 8){
        theInput.selectionStart = theInput.selectionEnd;
    }*/
    
    if(performancingUI.autocomplete(theInput,event) == 1){
        performancingUI.deliciousAddSearch(theInput.value)
    }
}
//str.substr(0,10)
performancingUI.deliciousAddSearch = function(theInput){
    var myLength = theInput.length;
    gPerformancingUtil.clearCheckListOut("performancing-delicios-tag-list");
    var userName = gPerformancingUtil.prefs.getCharPref("extra.delicious.login");
    
    for(i=0; i < gPffDeliciosTagArray.length; i++){
        if( theInput == gPffDeliciosTagArray[i].substr(0,myLength) ){
            performancingUI.deliciousAddTags(userName, gPffDeliciosTagArray[i]);
        }
    }
}

performancingUI.deliciousAddTechnorati = function(aLink, aTitle, isAtom, atomEditURI){
    //alert("link: " + aLink + "\nTitle: " + aTitle + "\nisAtom: " + isAtom + "\natomEditURI: " + atomEditURI);
    var isChecked = document.getElementById('performancing-addto-delicious-checkbox').checked;
    if(isChecked){
        //Login
        if( !performancingUI.deliciousIsLoggedIn() ){
            performancingUI.deliciousOnLoad();
            var savePassword = gPerformancingUtil.prefs.getBoolPref("extra.delicious.savePassword");
            if(savePassword){
                performancingUI.deliciousLogin();
            }
        }
        
        var theTagList = document.getElementById("performancing-technorati-tags").value;
        if(theTagList == "" || theTagList == " "){
           theTagList = gPFFLastTags;
        }
        
        var theTagArrayList = [];
        if(theTagList != "" && theTagList != " " ){
            //First clear out spaces following ','.
            var re = /\,\s+/g;
            theTagList = theTagList.replace(re, ",");
            theTagArrayList = theTagList.split(",");
        } 
        isAtom = false; //For blogger Beta fix
        if(isAtom){
            //gMakeXMLCall2(atomEditURI, '', 'atomAPIpost', theTagArrayList, '');
            var theCall = new PffXmlHttpReq(atomEditURI, "GET", null, false, null, null);
    
            theCall.onResult = function( aText, aXML ){
                performancingUI.addDeliciousTechnoratiATOM( aText, theTagArrayList );
            }
            theCall.onError = function (aStatusMsg, Msg) {
                //foo
            }
            theCall.prepCall(); //Set up The call (open connection, etc.)
            theCall.request.setRequestHeader("Content-Type", "text/xml");
            theCall.request.setRequestHeader("User-Agent", "ScribeFire " + gPerformancingVersionUA);
            theCall.makeCall(); //Make the call
            theCall.request.overrideMimeType ('text/xml');
        }else{
            performancingUI.addDeliciousTechnoratiBM( aLink, aTitle, theTagArrayList );
        }
    }
}

performancingUI.addDeliciousTechnoratiBM = function(theURL, theDesc, theTags){
    var tagSpaceList = "";
    for(i=0; i < theTags.length; i++){
        tagSpaceList = tagSpaceList + " " + theTags[i];
    }
    var theCallURL = 'https://api.del.icio.us/v1/posts/add?tags='+tagSpaceList+'&url='+ encodeURIComponent(theURL) +'&description='+ encodeURIComponent(theDesc) ;
    //alert("theCallURL: " + theCallURL + " theTags: " + theTags + " gPFFLastTags: " + gPFFLastTags);
    performancingUI.doDeliciousCall(theCallURL, '', 'createbm', '', '', false);
}

performancingUI.addDeliciousTechnoratiATOM = function(aResponse, theTags){
    //Parse the post
    var re = /(\<\?\xml[0-9A-Za-z\D]*\?\>)/;
    var newstr = aResponse.replace(re, "");
    
    var t = new Namespace("tapi", "http://purl.org/atom/ns#")
    var myXML = new XML(newstr);
    var aLink  = myXML.t::link[1].@href;
    var aTitle = myXML.t::title;
    
    performancingUI.addDeliciousTechnoratiBM( aLink, aTitle, theTags );
}

performancingUI.sendTrackBacks = function(aTitle, aLink, aBlogName){
    var theTrackBackList = document.getElementById("performancing-trackback-textbox").value;
    //alert("theTrackBackList: " + theTrackBackList + " gPFFLastTrackbacks: " +gPFFLastTrackbacks);
    if(theTrackBackList != ""){
        gPFFLastTrackbacks = theTrackBackList;
    }else{
        theTrackBackList = gPFFLastTrackbacks;
    }
    if(theTrackBackList != "" && theTrackBackList != null ){
        var theTrackBackArray = [];
        if(theTrackBackList != "" && theTrackBackList.length > 4){
            theTrackBackArray = theTrackBackList.split(",");
        }
        for(i=0; i < theTrackBackArray.length; i++){
            performancingUI.trackbackCall(theTrackBackArray[i], aLink, aTitle,	aBlogName, i, false );
        }
    }
    //theTrackBackList.value = "";
}

performancingUI.trackbackCall = function( theURL, aLink, aTitle, aBlogName, aNumber, aSecondTry ){
    var theCompleteURL = theURL + "&title="+aTitle+"&url="+aLink+ "&blog_name=" +aBlogName;
    //gMakeTrackBackXMLCall(theURL, theCompleteURL, 'trackback', '', aNumber, aSecondTry, '');
    //PffXmlHttpReq( aUrl, aType, aContent, aDoAuthBool, aUser, aPass)
    var theCall = new PffXmlHttpReq(theURL, "POST", theCompleteURL, false, null, null);
    
    theCall.onResult = function( aText, aXML ){
        performancingUI.trackBackResponse( aText, theURL, theCompleteURL, 'trackback', '', aNumber, aSecondTry, '');
    }
    theCall.onError = function (aStatusMsg, Msg) {
        //foo
    }
    theCall.prepCall(); //Set up The call (open connection, etc.)
    theCall.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    theCall.makeCall(); //Make the call
    theCall.request.overrideMimeType ('text/xml');
    
}

performancingUI.trackBackResponse = function( aData, theURL, message, theAction, additionalInfo, aNumber, aSecondTry, theGUID){
    //alert('ANumber: '+aNumber+' aSecondTry: '+aSecondTry+' and TrackBack Success: ' + aData);
    var isSuccess = "<error>0</error>";
    var isError = "<error>1</error>";
    
    var isRDF = /(?:trackback:ping=\")(.*)(?:\")/mgi;
    //var isRDF = /(?:\trackback\:\ping\=\")((http|https):\/\/[a-zA-Z0-9@:%_~#?&=.,\/;-]*[a-zA-Z0-9@:%_~#&=\/;-])(?:\".+)(?=\")/mgi;
    var isLink = /(?:\<\a\ \href\=\")((http|https):\/\/[a-zA-Z0-9@:%_~#?&=.,\/;-]*[a-zA-Z0-9@:%_~#&=\/;-])(?=\"\srel="trackback">)|(?:\<\a\ \href\=\")((http|https):\/\/[a-zA-Z0-9@:%_~#?&=.,\/;-]*[a-zA-Z0-9@:%_~#&=\/;-])(?=\"\>trackback\<)/mgi;
    //var isLink2 = /(?:\<\a\ \href\=\")((http|https):\/\/[a-zA-Z0-9@:%_~#?&=.,\/;-]*[a-zA-Z0-9@:%_~#&=\/;-])(?=\"\>trackback\<)/mgi;
    //gPffTrackBackTemp = aData;
    if( aData.search(isSuccess) != -1){ //If succesfull
        //alert('It was GOOD! aSecondTry" ' + aSecondTry);
    }else if(aData.search(isError) != -1 ){ //If error but url was right
        //alert('It was a good trackback call but got rejected! aSecondTry" ' + aSecondTry);
    }else{ // url must be wrong, let's look for a real trackback url
        if(!aSecondTry){ //Make sure it's not already the second try
            //(?:trackback:ping=\")(.*)(?:\")
            //(?:\<\a\ \href\=\")((http|https):\/\/[a-zA-Z0-9@:%_~#?&=.,\/;-]*[a-zA-Z0-9@:%_~#&=\/;-])(?:\".+)(?=rel="trackback">)
            var isAnRDF =  aData.match(isRDF);
            var isALink =  aData.match(isLink);
            //alert("isAnRDF: " + isAnRDF +"\n isALink: "+isALink );
            if(isAnRDF != null){
                isAnRDF = isAnRDF.toString().replace(/trackback:ping=\"/, ""); //We need better regexps
                isAnRDF = isAnRDF.replace(/"/, "");
                //gMakeTrackBackXMLCall(isAnRDF, message, 'trackback', '', aNumber, true, '');
                //PffXmlHttpReq( aUrl, aType, aContent, aDoAuthBool, aUser, aPass)
                var theCall = new PffXmlHttpReq(isAnRDF, "POST", message, false, null, null);
                
                theCall.onResult = function( aText, aXML ){
                    performancingUI.trackBackResponse( aText, isAnRDF, message, 'trackback', '', aNumber, true, '');
                }
                theCall.onError = function (aStatusMsg, Msg) {
                    //foo
                }
                theCall.prepCall(); //Set up The call (open connection, etc.)
                theCall.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                theCall.makeCall(); //Make the call
                theCall.request.overrideMimeType ('text/xml');
            }else if(isALink != null){
                isALink = isALink.toString().replace(/<a href="/, ""); //We need better regexps 
                isALink = isALink.replace(/"/, "");
                //gMakeTrackBackXMLCall(isALink, message, 'trackback', '', aNumber, true, '');
                //PffXmlHttpReq( aUrl, aType, aContent, aDoAuthBool, aUser, aPass)
                var theCall = new PffXmlHttpReq(isALink, "POST", message, false, null, null);
                
                theCall.onResult = function( aText, aXML ){
                    performancingUI.trackBackResponse( aText, isALink, message, 'trackback', '', aNumber, true, '');
                }
                theCall.onError = function (aStatusMsg, Msg) {
                    //foo
                }
                theCall.prepCall(); //Set up The call (open connection, etc.)
                theCall.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                theCall.makeCall(); //Make the call
                theCall.request.overrideMimeType ('text/xml');
            }else{
                //alert('Fail, seems there is not a trackback link aSecondTry" ' + aSecondTry);
            }
        }
    }
}

performancingUI.clearTrackbacks = function(isClear) {
    document.getElementById("performancing-trackback-textbox").value ="";
}

//For bebugging, you must have FireBug installed.
//performancingUI.printfire(whatever);
performancingUI.printfire = function(){
    if (document.createEvent)
    {
        printfire.args = arguments;
        var ev = document.createEvent("Events");
        ev.initEvent("printfire", false, true);
        dispatchEvent(ev);
    }
}
//performancingUI.doPing( theMethodName, theBlogName, theBlogURL );
performancingUI.doPing = function( theBlogName, theBlogURL ){
    //alert("Ping Baby");
    if( document.getElementById("performancing-enablepings-checkbox").checked ) {
        var tempArray = [];
        var selectedPing =	document.getElementById("performancing-pingradio-group").selectedItem.value;
        if(selectedPing == 'custom'){
            var checkList = document.getElementById("performancing-pinglist-vbox");
            for(i=0; i < checkList.childNodes.length; i++ ){
                try{
                    if(checkList.childNodes[i].checked){
                        var tempString = checkList.childNodes[i].getAttribute("url");
                        tempArray.push(tempString);
                    }
                }catch(e){
                    //foo
                }
            }
            if(tempArray.length > 0){
                for(x=0; x < tempArray.length; x++){
                    performancingUI.doRPCPing(theBlogName, theBlogURL, tempArray[x]);
                }
            }
           // alert("tempArray: " + tempArray);
        }else{
            switch(selectedPing){
                case 'pingomatic':
                    
                    var theRestURL = "http://pingomatic.com/ping/?title="+theBlogName+"&blogurl="+theBlogURL+"&rssurl=http%3A%2F%2F&chk_weblogscom=on&chk_blogs=on&chk_technorati=on&chk_feedburner=on&chk_syndic8=on&chk_newsgator=on&chk_feedster=on&chk_myyahoo=on&chk_pubsubcom=on&chk_blogdigger=on&chk_blogrolling=on&chk_blogstreet=on&chk_weblogalot=on&chk_icerocket=on";
                    performancingUI.doRestPing(theBlogName, theBlogURL, theRestURL);
                    break;
                    
                case 'pingoat':
                    var theRestURL = "http://pingoat.com/index.php?pingoat=go&blog_name="+theBlogName+"&blog_url="+theBlogURL+"&rss_url=http%3A%2F%2F&cat_0=0&id%5B%5D=0&id%5B%5D=1&id%5B%5D=2&id%5B%5D=3&id%5B%5D=4&id%5B%5D=5&id%5B%5D=6&id%5B%5D=7&id%5B%5D=10&id%5B%5D=11&id%5B%5D=12&id%5B%5D=14&id%5B%5D=16&id%5B%5D=20&cat_1=0&cat_2=0";
                    performancingUI.doRestPing(theBlogName, theBlogURL, theRestURL);
                    break;
                    
                default:
                    var errorMessage = performancingUI.getLocaleString('nopingtypeselected', []);
                    //No Ping Type Selected
                    alert(errorMessage);
                    break;
            }
        }
    }
}

performancingUI.doRestPing = function( theBlogName, theBlogURL, theRestURL ){
    //Now make RPC Call
   //gMakeXMLCall2(theRestURL, "", "ping" );
    var theCall = new PffXmlHttpReq(theRestURL, "GET", null, false, null, null);
    
    theCall.onResult = function( aText, aXML ){
        performancingUI.processPingRecData( aText, "", "ping");
    }
    theCall.onError = function (aStatusMsg, Msg) {
        //foo
    }
    theCall.prepCall(); //Set up The call (open connection, etc.)
    theCall.request.setRequestHeader("Content-Type", "text/xml");
    theCall.request.setRequestHeader("User-Agent", "ScribeFire " + gPerformancingVersionUA);
    theCall.makeCall(); //Make the call
    theCall.request.overrideMimeType ('text/xml');
}

performancingUI.doRPCPing = function( theBlogName, theBlogURL, rpcURL ){
    var theMethodName = "weblogUpdates.extendedPing";
    var theXMLtoSend = bfXMLRPC.makePingXML(theMethodName, theBlogName, theBlogURL);
    
    //Now make RPC Call
    //gMakePingXMLCall( rpcURL, theXMLtoSend, "" );
    //PffXmlHttpReq( aUrl, aType, aContent, aDoAuthBool, aUser, aPass) 
    var theCall = new PffXmlHttpReq(rpcURL, "POST", theXMLtoSend, false, null, null);
    
    theCall.onResult = function( aText, aXML ){
        performancingUI.processPingRecData( aText, theXMLtoSend, "");
    }
    theCall.onError = function (aStatusMsg, Msg) {
        //foo
    }
    theCall.prepCall(); //Set up The call (open connection, etc.)
    theCall.request.setRequestHeader("Content-Type", "text/xml");
    theCall.request.setRequestHeader("User-Agent", "ScribeFire " + gPerformancingVersionUA);
    theCall.makeCall(); //Make the call
    theCall.request.overrideMimeType ('text/xml');
}


performancingUI.processPingRecData = function( aData ){
    //alert("Ping Back: " + aData);
}

performancingUI.openImageUpload = function(){
    //alert("Ping Back: " + aData);
    var re = [];
    var ourURL = "";
    var theURL = [ourURL];
    var localeString = performancingUI.getLocaleString('imageinsertwindowtitle', []);
    window.openDialog("chrome://performancing/content/imageUpload.xul", localeString,"chrome,modal,centerscreen",re,theURL);
    if(re[0]){
      //alert("the URL to insert: " +theURL[0]);
      return theURL[0];
    }
    return false;
}

/*
    For testing Image Uploads
*/
performancingUI.openImageUpload2 = function(){
    //alert("Ping Back: " + aData);
    var re = [];
    var ourURL = "";
    var theURL = [ourURL];
    var localeString = performancingUI.getLocaleString('imageinsertwindowtitle', []);
    window.openDialog("chrome://performancing/content/imageUpload.xul", localeString,"chrome,modal,centerscreen",re,theURL);
    if(re[0]){
      //alert("the URL to insert: " +theURL[0]);
      return theURL[0];
    }
    return false;
}

performancingUI.openFileUpload = function(){
    //alert("Ping Back: " + aData);
    var re = [];
    var ourURL = "";
    var theURL = [ourURL];
    var localeString = performancingUI.getLocaleString('fileinsertwindowtitle', []);
    window.openDialog("chrome://performancing/content/fileUpload.xul", localeString,"chrome,modal,centerscreen",re,theURL);
    if(re[0]){
      //alert("the URL to insert: " +theURL[0]);
      return theURL[0];
    }
    return false;
}


performancingUI.onTextBoxLoad2 = function(){
    var prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefs = prefsService.getBranch("performancing.");
    var isRTL = prefs.getBoolPref('display.enablertl');
    var theStyle = "direction:rtl;";
    if(!isRTL){
        theStyle = "";
    }
        
        try{
            var winPreview = document.getElementById("performancing-preview-display");
            winPreview.contentDocument.getElementById("performancing-richtext").setAttribute('style', theStyle);
        }catch(e){
        }
        
        try{
            var winPreview = document.getElementById("performancing-message");
            winPreview.contentDocument.getElementById("performancing-richtext").setAttribute('style', theStyle);
        }catch(e){
        }
        
        try{
            document.getElementById("performancing-editor-subject").setAttribute('style', theStyle);
        }catch(e){
        }
        
        try{
            document.getElementById("performancing-message-source").setAttribute('style', theStyle);
        }catch(e){
        }
}

performancingUI.getLocaleString = function(strName, formattingValues){
        var str = null;
        try {
            var strbundle = document.getElementById("performancingstrings");
            var strbundleFallback = document.getElementById("performancingstrings-fallback");
            if (formattingValues === undefined) {
                try {
                    str = strbundle.getString("performancing." + strName);
                }catch(e) {
                    str = strbundleFallback.getString("performancing." + strName);
                }
            } else {
                try {
                    str = strbundle.getFormattedString("performancing." + strName, formattingValues);
                }catch(e) {
                    str = strbundleFallback.getFormattedString("performancing." + strName, formattingValues);
                }
            }
        } catch (err) {
            //this.printLine("Couldn't get string: " + strName + "\nErr: " + err );
        }
        return str;
}

performancingUI.hasCheckboxChildren = function(checkListIDname){
    var theCheckList = document.getElementById(checkListIDname);
    if( theCheckList.hasChildNodes() ){
        return (theCheckList.firstChild.nodeName == 'checkbox') ;
    }else{
        return false;
    }
}

performancingUI.hasLabelChild = function(checkListIDname){
    var theCheckList = document.getElementById(checkListIDname);
    if( theCheckList.hasChildNodes() ){
        return (theCheckList.firstChild.nodeName == 'label') ;
    }else{
        return false;
    }
}

performancingUI.addCategories = function(){
	var localeString = performancingUI.getLocaleString('addcategories', []);
    var theCategories = prompt(localeString);
	
	if ((theCategories != null) && (theCategories != "")){
		var theCategoryArray = theCategories.split(",");
		
		if (gPerformancingUtil.serviceObject.createCategories) {
			// The means that new categories can be created server-side
			// without adding them to a post right away.
			
			// Check to make sure that this category isn't in the list already.
			
			var checkList = document.getElementById("blog-sidebar-listing-categories");
			
			var theBlogXML = gPerformancingUtil.serviceObjectXML;
			var myServiceObject = gPerformancingUtil.serviceObject;
			
			newCategory : for (var i = 0; i < theCategoryArray.length; i++){
				for (var j = 0; j < checkList.childNodes.length; j++) {
					if (checkList.childNodes[j].getAttribute("label") == theCategoryArray[i]){
						checkList.childNodes[j].setAttribute("checked", "true");
						continue newCategory;
					}
				}
				
				var myResponse = myServiceObject.newCategory(theCategoryArray[i]);
				
				if(myResponse){
					performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'newcategorycall', theCategoryArray[i], "", performancing_xmlcall.processData);
				}
			}
		}
		
		performancingUI.addCategoriesToList(theCategoryArray);
	}
}

performancingUI.addCategoriesToList = function(theCategoryArray){
	var doNotCheckClear = performancingUI.hasCheckboxChildren('blog-sidebar-listing-categories');
	gPerformancingUtil.setCategoriesSidebar(theCategoryArray, !doNotCheckClear);
}
