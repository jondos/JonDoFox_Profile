/*
    Performancing for Firefox Skin and Addon code
*/

var gGlobalPerFormancingAddons = []; //For testing only
var gPFFLastStyleSheetURL = ""; //Last style sheet url

var gPFFAddonList = []; //List of addons for PFF

var pffAddonSkin = new Object();

pffAddonSkin = {
    LastStyleSheetURL: "",
    AddonList: [],
    loadedAddonList: false
    //SkinList: [],
    //loadedSkinList: false
}

/**************************************************************
********************* Skin Functions **************************
***************************************************************/

pffAddonSkin.onSkinListClick = function(anElement, AEvent, itemNum){
    if(AEvent.button == 0){ //if left-click
        //var temp = document.getElementById("performancing-skin-list");
        var elementIDName2	= "li-s-" + itemNum;
        var temp3 = document.getElementById(elementIDName2);
        
        var theDesc = temp3.getAttribute('tooltiptext');
        var descBox = document.getElementById("performancing-skin-desc");
        descBox.value = theDesc;
        
        document.getElementById("performancing-skin-desc-label").hidden = false;
        descBox.hidden = false;
    }else{ //if other click
        //openWindowIn( true, decodeURI(event.originalTarget.getAttribute('tooltiptext')) );
    }
}

pffAddonSkin.appendStyleSheetToEditor = function(aDoc, aSkinURI) {
    try{
      var theStylesheet = aDoc.createElementNS("http://www.w3.org/1999/xhtml", "link");
      theStylesheet.setAttribute("rel", "stylesheet");
      theStylesheet.setAttribute("type", "text/css");
      theStylesheet.setAttribute("href", aSkinURI);
      var theHeaders = aDoc.getElementsByTagName('head');
      theHeaders[theHeaders.length -1].appendChild(theStylesheet);
    }catch(e){}
}

pffAddonSkin.appendStyleSheetToPFF = function(aDoc, aSkinURI, aLdDef) {
    var numSS = document.styleSheets.length;
    var foundMatch = false;
    for(var i=0; i< numSS; i++){
        var theHREF = document.styleSheets[i].href;
        if(this.LastStyleSheetURL == theHREF){
            document.styleSheets[i].disabled = true;
        }
        if(theHREF == aSkinURI){
            document.styleSheets[i].disabled = false;
            foundMatch = true;
        }else if(theHREF == "chrome://performancing/skin/overlay.css"){
            if(aLdDef == "false"){
                document.styleSheets[i].disabled = true;
            }else{
                document.styleSheets[i].disabled = false;
            }
        }
    }
    if(!foundMatch){
        var pi = aDoc.createProcessingInstruction("xml-stylesheet", 
                "href=\"" + aSkinURI + "\" type=\"text/css\"");
        aDoc.insertBefore(pi, aDoc.lastChild);
    }
    
    //alert("foundMatch: " + foundMatch + "\naSkinURI: " + aSkinURI + "\nthis.LastStyleSheetURL: " + this.LastStyleSheetURL);
    
    this.LastStyleSheetURL = aSkinURI;
    
    //document.styleSheets[2].disabled = true
}

pffAddonSkin.setSkinCSS = function(aSkinURI, aLdDef) {
    var theEditor = performancingUI.getRichEditorWindow();
    var theEditorPreview = performancingUI.getPreviewWindow();
    
    pffAddonSkin.appendStyleSheetToPFF(document, aSkinURI, aLdDef);
    pffAddonSkin.appendStyleSheetToEditor(theEditor.document, aSkinURI);
    //pffAddonSkin.appendStyleSheetToEditor(theEditorPreview.document, aSkinURI);
    
}

//Load the last saved Skin
pffAddonSkin.loadLastSkin = function() {
    var theLastSkinURI = null;
    var theLastSkinLoadDefault = null;
    try{
        theLastSkinURI = gPerformancingUtil.prefs.getCharPref("settings.lastselected.skinuri");
        theLastSkinLoadDefault = gPerformancingUtil.prefs.getCharPref("settings.lastselected.lddef");
    }catch(e){}
    
    if(theLastSkinURI != ""){
        var theURI = this.getSkinURI(theLastSkinURI);
        
        if(theURI != null && theURI != "chrome://performancing/skin/overlay.css" && theURI != ""){
            pffAddonSkin.setSkinCSS(theURI, theLastSkinLoadDefault);
        }
    }
}

//Get a full Skin path from file name
pffAddonSkin.getSkinURI = function(aSkinSRCLeaf) {
    var theSkinSRC = "";
    if( aSkinSRCLeaf == "_default_"){
        theSkinSRC = "chrome://performancing/skin/overlay.css";
    }else{
        var file = PerFormancingDirIO.get("ProfD");
            file.append("performancing");
            file.append("skins");
            file.append(aSkinSRCLeaf);
            
        theSkinSRC = file.path;
        theSkinSRC = theSkinSRC.toString().replace(/\\/g,"/");
        theSkinSRC = encodeURI(theSkinSRC);
        theSkinSRC = "file:///" +theSkinSRC; //Works on Linux and Mac?
    }
    return theSkinSRC;
}

//Loads the selected Skin file
pffAddonSkin.enableSelectedSkin = function() {
    var theList = document.getElementById("performancing-skin-list");
    var aElement  = theList.selectedItem;
    var theSkinSRCLeaf = aElement.getAttribute("src");
    var theSkinLdDef = aElement.getAttribute("lddef");
    var theSkinSRC = "";
    theSkinSRC = this.getSkinURI(theSkinSRCLeaf);
    //alert("theSkinSRC: " + theSkinSRC + " \n\ntheSkinSRCLeaf: " + theSkinSRCLeaf);
        
        
    if(theSkinSRC == ""){
        //alert("Couldn't find CSS file");
    }else{
        pffAddonSkin.setSkinCSS(theSkinSRC, theSkinLdDef);
        //Set pref
        gPerformancingUtil.prefs.setCharPref("settings.lastselected.skinuri", theSkinSRCLeaf);
        gPerformancingUtil.prefs.setCharPref("settings.lastselected.lddef", theSkinLdDef);
        
        //Make sure the other elements are not enabled
        var theParent = aElement.parentNode;
        for(var i=0; i < theParent.childNodes.length; i++){
            if(theParent.childNodes[i].localName == "listitem"){
                theParent.childNodes[i].setAttribute("enabled", false);
            }
        }
        //Enable current selection
        aElement.setAttribute("enabled", "true");
        
        //var errorStr = performancingUI.getLocaleString('skin.restartfx', []);//skin.restartfx
        //alert(errorStr);
    }
}

//Add a Skin file
pffAddonSkin.addASkinFile = function() {
    //Load File Picker
    var theFile = this.filePicker();
    if(theFile.leafName.match(".css")){
        this.handleTheFile( theFile );
    }else if(theFile.leafName.match(".zip")){
        this.handleSkinZip(theFile);
    }
}


//Once we have an nsIFIle, play with it here.
pffAddonSkin.handleTheFile = function(aFile) {
    //Let's make sure it's a good file before we copy it.
    var isGood = this.processSkinFile(aFile);
    
    if(isGood[0] == true){
        
        var file = PerFormancingDirIO.get("ProfD");
        file.append("performancing");
        file.append("skins");
        //var myDir = file.clone();
        file.append(aFile.leafName);
        var alreadyExists = false;
        if(file.exists()){
            alreadyExists = true;
        }
        //Let's always overwrite it so user has the latest
        var theoldFile = PerFormancingFileIO.open(aFile.path);
        var theOldContent = PerFormancingFileIO.read(theoldFile, "UTF-8");
        PerFormancingFileIO.create(file);
        
        var isSaved = this.saveContentsToFile( file, theOldContent );
        
        if(isSaved){
            //Good, now add the file and save it
            var filePath = file.leafName;
            this.addSkinToXMLAndList( isGood, filePath );
            
        }
    }
}

pffAddonSkin.addSkinToXMLAndList = function(aSkinDesc, fileName) {
    var theList =  document.getElementById("performancing-skin-list");
    var theNumber = theList.getRowCount() + 1;
    var wasOverwritten = this.saveXMLFile("skin", aSkinDesc[3], aSkinDesc[2], aSkinDesc[1], aSkinDesc[5], fileName, false );
    if(wasOverwritten == null){
        //Error writing to file
    }else if(!wasOverwritten){
        this.loadSkinAddonList("skin", "performancing-skin-list", theNumber, aSkinDesc[3], aSkinDesc[2], aSkinDesc[1], fileName, false, aSkinDesc[5] );
    }
}

pffAddonSkin.processSkinFile = function(aFile) {
    
    var theFileContent = PerFormancingFileIO.read(aFile, "UTF-8");
    var theType     = "";
    var theAuthor   = "";
    var theName     = "";
    var theDesc     = "";
    var theDef      = "";
    var thePFFVer   = "";
    var noError     = true;
    try{
        theType    = /(?:@type:[\s^\n^\f^\r]*)(.*)(?:[\n\f\r])/i.exec(theFileContent);
        theAuthor  = /(?:@author:[\s^\n^\f^\r]*)(.*)(?:[\n\f\r])/i.exec(theFileContent);
        theName    = /(?:@name:[\s^\n^\f^\r]*)(.*)(?:[\n\f\r])/i.exec(theFileContent);
        theDesc    = /(?:@desc:[\s^\n^\f^\r]*)(.*)(?:[\n\f\r])/i.exec(theFileContent);
        theDef     = /(?:@lddef:[\s^\n^\f^\r]*)(.*)(?:[\n\f\r])/i.exec(theFileContent);
        thePFFVer  = /(?:@pffver:[\s^\n^\f^\r]*)(.*)(?:[\n\f\r])/i.exec(theFileContent);
        
        theAuthor   = theAuthor[1];
        theName     = theName[1];
        theDesc     = theDesc[1];
        theType     = theType[1];
        theDef      = theDef[1];
        thePFFVer   = thePFFVer[1];
    }catch(e){
        noError = false;
        var errorStr = performancingUI.getLocaleString('validskinfilenotfound', []);//skin.restartfx
        alert(errorStr + "\n" + e);
    }
    //alert("theType: " + theType + "\ntheAuthor: " + theAuthor + "\ntheName: " + theName + "\ntheDesc: " + theDesc +  "\ntheDefault: " + theDef );
    theFileContent = null;
    if(noError && theType == "PFF Skin"){
        return [true, theAuthor, theName, theDesc, theType, theDef, thePFFVer ];
    }else{
        return [false]; //Bad file, so return false
    }
    return [false];
}


pffAddonSkin.deleteASkinFile = function() {
    //Delete File from the UI list
    var theList = document.getElementById("performancing-skin-list");
    var theElement      = theList.selectedItem;
    var theElemIndex    = theList.selectedIndex;
    var theSkinSRCLeaf  = theElement.getAttribute("src");
    if( theSkinSRCLeaf == "_default_"){
        //Down't allow to delete!!!
    }else{
        //Delete from XML file
        var didDelete = this.deleteItemFromXML(theSkinSRCLeaf);
        //Delete the file
        var didFDelete = this.deleteFile(theSkinSRCLeaf);
        try{
            didDirDelete = this.deleteDir(theSkinSRCLeaf);
        }catch(e){}
        //Delete from list
        theList.removeItemAt(theElemIndex);
    }
}

// Handle Zip files that contain a valid PFF Skin
// Conditions: Zip must contain the _skin_name_.css file in the parent dir
// All files needed (images, etc.) should be in a directory called _skin_name_
// The _skin_file_name_ dir can be multiple levels deep
// Example Structure:
//          myskin.zip
//                    \myskin.css
//                    \myskin\image.png
//                    \myskin\*.*
//
pffAddonSkin.handleSkinZip = function(zipFile){
    gPerformancingUtil.printLog("Start Skin Zip Functions!");
    var zipReader = pffAddonSkin.getZipReaderForFile(zipFile);
    zipReader.test(null);
    try{
        var entries = zipReader.findEntries("*.css");
        var entry = entries.getNext().QueryInterface(Components.interfaces.nsIZipEntry);
        //Extract to temp dir and process
        var theCSSFileName = entry.name;
        var file = PerFormancingDirIO.get("TmpD"); //Get's systems temp dir
        file.append(entry.name);
        
        zipReader.extract(entry.name, file);
        
        //Now test the css
        var isValidCSS = this.processSkinFile(file);
        //What ever, delete the temp file, be nice to users temp folder ;)
        PerFormancingFileIO.unlink(file);
        
        var isRightVersion = (gPerformancingVersion.match(/(\d\.\d)/)[0] - isValidCSS[6].match(/(\d\.\d)/)[0] >=0 );
        //If it's valid, extract all files in
        if(isValidCSS[0] == true && isRightVersion){
            var theDir = pffAddonSkin.getSkinAddonDir(entry.name);
            entries = zipReader.findEntries("*");
            
            while (entries.hasMoreElements()) {
                entry = entries.getNext().QueryInterface(Components.interfaces.nsIZipEntry);
                var parts = entry.name.split("/");
                var fileName = parts[parts.length-1];
                if (fileName != "") {
                    var theFileToAdd = theDir.clone();
                    for(var i=0; i< parts.length -1; i++){ //List all dirs
                        theFileToAdd.append(parts[i]);
                        PerFormancingDirIO.create(theFileToAdd); //create the dir
                    }
                    theFileToAdd.append(fileName); //Add the leaf to path
                    zipReader.extract(entry.name, theFileToAdd); //Now extract the file
                }
            }
            this.addSkinToXMLAndList( isValidCSS, theCSSFileName );
        }else{
            var errorStr = performancingUI.getLocaleString('validskinfilenotfound', []);//skin.restartfx
            alert(errorStr);
        }
    }catch(e){}
    //Always close the reader
    zipReader.close();
}

/**************************************************************
********************* Addon Functions *************************
***************************************************************/

pffAddonSkin.onAddonListClick = function(event, itemNum){
    if(event.button == 0){ //if left-click
        //li-check-i-1
        var temp = document.getElementById("performancing-addon-list");
        //alert('Checked: ' + temp.selectedIndex );
        //var elementIDName	 = "li-check-i-" + (temp.selectedIndex + 1);
        var elementIDName  = "li-a-check-i-" + itemNum;
        var temp2 = document.getElementById(elementIDName);
        temp2.checked = !temp2.checked;
        //deleteTodoItem(itemNum);
        
        //var elementIDName2  = "li-" + (temp.selectedIndex + 1);
        var elementIDName2	= "li-a-" + itemNum;
        var temp3 = document.getElementById(elementIDName2);
        if(temp2.checked){
        //window.setTimeout( "hideElement('"+elementIDName2+"')" , 1500, true);
            temp3.setAttribute('class', 'pffAddonBody');
            temp3.setAttribute('enabled', 'true');
        }else{
            temp3.setAttribute('class', '');
        }
        
        var elementIDName3	= "li-a-enabled-i-" + itemNum;
        var temp4 = document.getElementById(elementIDName3);
        var enabledStr = performancingUI.getLocaleString('enabled', []);
        var disabledStr = performancingUI.getLocaleString('disabled', []);
        var theSelectedElement = temp2.parentNode.parentNode; //li-a-#
        var isEnabled = enabledStr;
        if(temp2.checked){
            isEnabled = enabledStr;
            pffAddonSkin.enableSelectedAddon(theSelectedElement);
        }else{
            isEnabled = disabledStr;
            pffAddonSkin.disableSelectedAddon(theSelectedElement);
        }
        temp4.setAttribute('label', isEnabled);
        
        var theDesc = temp3.getAttribute('tooltiptext');
        var descBox = document.getElementById("performancing-addon-desc");
        descBox.value = theDesc;
        
        document.getElementById("performancing-addon-desc-label").hidden = false;
        descBox.hidden = false;
        
    }else{ //if other click
        //openWindowIn( true, decodeURI(event.originalTarget.getAttribute('tooltiptext')) );
    }
}

//TODO
pffAddonSkin.onAddonTabClick = function(aTab) {
    var theTabName = aTab.getAttribute("name");
    //theMainDeck.setAttribute('selectedIndex', parseInt(theTabIndex) + 6);
    var theContentname = 'performancing-'+ theTabName +'-content';
    var theDeck = document.getElementById("performancing-main-content-deck");
    for(var i=0; i < theDeck.childNodes.length; i++){
        if(theDeck.childNodes[i].id == theContentname){
            //document.getElementById(theContentname).setAttribute('collapsed', false);
            theDeck.setAttribute('selectedIndex',i);
            gPerformancingUtil.sendAddonInitNotification("performancing-addon-pfftabclick-topic", theTabName);
        }
    }
}

//TODO
//Loads the selected Skin file
pffAddonSkin.enableSelectedAddon = function(aElement) {
    var theAddonName = aElement.getAttribute("src");
    
    //Get Pref File
    var isInList = null;
    var theAddonEnabledList = gPerformancingUtil.prefs.getCharPref("addons.enabledlist");
    if(theAddonEnabledList != ""){
        //Make sure it doesn't already exists
        isInList = theAddonEnabledList.match(theAddonName);
    }
    if(isInList == null){
        //Add to Pref list
        theAddonEnabledList = theAddonEnabledList + theAddonName + ",";
    }
    
    //Set pref
    gPerformancingUtil.prefs.setCharPref("addons.enabledlist", theAddonEnabledList);
    
    //Tell addon to launch
    gPerformancingUtil.sendAddonInitNotification("performancing-addon-pffenable-topic", theAddonName);
    
}

//TODO
//Loads the selected Skin file
pffAddonSkin.disableSelectedAddon = function(aElement) {
    var theAddonName = aElement.getAttribute("src");
    //Get Pref file
    var theAddonEnabledList = gPerformancingUtil.prefs.getCharPref("addons.enabledlist");
    
    //Remove it from the list
    theAddonEnabledList = theAddonEnabledList.replace(theAddonName+",", "");
    //Save pref
    gPerformancingUtil.prefs.setCharPref("addons.enabledlist", theAddonEnabledList);
    gPerformancingUtil.sendAddonInitNotification("performancing-addon-pffdisable-topic", theAddonName);
}

pffAddonSkin.checkListForDupe = function( aAddonName ){
    var tempList = this.AddonList;
    for(var i=0; i< tempList.length; i++ ){
        if(tempList[i].id ==  aAddonName ){
            return true;
        }
    }
    return false;
}

pffAddonSkin.hookInAddon = function( aAddonObject ){
    var theAddonName = aAddonObject.id;
    var theAddonVer  = aAddonObject.pffver;
    
    //Make sure the version is supported
    //alert("gPerformancingVersion: " + gPerformancingVersion + " theAddonVer: " + theAddonVer);
    var isSupportedVer = (gPerformancingVersion.match(/(\d\.\d)/)[0] - String(theAddonVer).match(/(\d\.\d)/)[0] >=0 );
    if(isSupportedVer){
        //Add to population list
        //make sure it's not already added
        var isAlreadyThere = this.checkListForDupe(theAddonName);
        if(!isAlreadyThere){
            this.AddonList.push( {name: aAddonObject.name, version: aAddonObject.version, description: aAddonObject.description, author: aAddonObject.author, id: aAddonObject.id, pffver: aAddonObject.pffver} );
        }
        
        //Check if it's in the white list.
        var isInList = null;
        var theAddonEnabledList = gPerformancingUtil.prefs.getCharPref("addons.enabledlist");
        if(theAddonEnabledList != ""){
            //Make sure it doesn't already exists
            isInList = theAddonEnabledList.match(theAddonName + ",");
        }
        
        // if so, enable and return true, else false
        //isInList = true;
        if(isInList != null){
            var theAddonTab = document.getElementById("performancing-addons-tab");
            theAddonTab.hidden = false;
            pffAddonSkin.doAddonEnabling(aAddonObject);
        }
    }else{
        //alert("Wrong version of " + theAddonName);
    }
}

pffAddonSkin.doAddonEnabling = function( aAddonObject ){
    var aAddonName = aAddonObject.id;
    //Enable the Tab
    document.getElementById('performancing-'+ aAddonName +'-tab').setAttribute('collapsed', false);
    
    aAddonObject.hookIntoPFF(true);
}

pffAddonSkin.doAddonDisabling = function( aAddonObject ){
    var aAddonName = aAddonObject.id;
    //Enable the Tab
    document.getElementById('performancing-'+ aAddonName +'-tab').setAttribute('collapsed', true);
    
    aAddonObject.hookIntoPFF(false);
}

pffAddonSkin.enableAnAddonCallback = function( aAddonObject, aName ){
    gPerformancingUtil.printLog("Enable aAddonObject.name: " + aAddonObject.name + "\naName: " + aName);
    //Double check
    if(aAddonObject.id == aName){
        //Enable this addon
        pffAddonSkin.hookInAddon(aAddonObject);
    }
}

pffAddonSkin.disableAnAddonCallback = function( aAddonObject, aName ){
    gPerformancingUtil.printLog("Disable aAddonObject.name: " + aAddonObject.name + "\naName: " + aName);
    //Double check
    if(aAddonObject.id == aName){
        //Enable this addon
        pffAddonSkin.doAddonDisabling(aAddonObject);
    }
}
//li-a-0
pffAddonSkin.loadAddonList = function( ){
    var theListArr = this.AddonList;
    var theWhiteList = gPerformancingUtil.prefs.getCharPref("addons.enabledlist");
    if(!this.loadedAddonList){
        if(theListArr.length > 0){
            gPerformancingUtil.clearListOut('performancing-addon-list');
            for(var i=0; i < theListArr.length; i++){
                var enabled = false;
                if( theWhiteList.match(theListArr[i].id + ",") != null ){
                    enabled = true;
                }//name version description author id
                this.loadSkinAddonList("addon", 'performancing-addon-list', 
                                        i, theListArr[i].description, theListArr[i].name, theListArr[i].author, 
                                        theListArr[i].id, enabled, "");
            }
            this.loadedAddonList = true;
        }
    }
}

/**************************************************************
*********** Common (skin & addon) Functions ******************* 
***************************************************************/


pffAddonSkin.onTabSwitch = function(aTab) {
    var theId = aTab.selectedItem.id;
    if(theId == "performancing-tab-skin"){
        pffAddonSkin.openAndLoadXMLFile('skin');
    }else if(theId == "performancing-tab-addons"){
        pffAddonSkin.loadAddonList();
    }
}

pffAddonSkin.loadAddonTabs = function(aTab) {
    var theAddonBox = document.getElementById("performancing-navbar-tabs-addons");
    var theToggle = Boolean(theAddonBox.hidden);
    theAddonBox.hidden = !theToggle;
    
    var theAddonEnabledList = gPerformancingUtil.prefs.getCharPref("addons.enabledlist");
    if(theAddonEnabledList == ""){
        //Open the settings tab
        performancingUI.onLeftSidebarTabSelect('settings');
        var settingsTabs = document.getElementById("pff-addon-tabbox");
        settingsTabs.selectedIndex = 2
    }
}


//File Picker
pffAddonSkin.filePicker = function() {
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
               .createInstance(nsIFilePicker);
    fp.init(window, "Dialog Title", nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
    
    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK){
      var file = fp.file;
      //var fileName = file.leafName;
      return file;
    }else{
        return null;
    }
}

// On tab select, if we havn't loaded it yet, load the list
// aService = 'addon' | 'skin'
pffAddonSkin.loadSkinAddonList = function(aService, listIDname, aNumber, aDesc, aName, aAuthor, aSRC, isEnabled, aLdDef) {
    var list = document.getElementById(listIDname);
    var item = document.createElement('listitem');
    
    item.setAttribute('tooltiptext', aDesc);
    item.setAttribute('enabled', isEnabled);
    item.setAttribute('class', "pffAddonBody");
    item.setAttribute('src', aSRC);
    item.setAttribute('lddef', aLdDef);
    //item.setAttribute('name', aName);
    //item.setAttribute('author', aAuthor);
    
    //Now done with an XBL binding
    var itemCell = document.createElement('listcell');
    
    
    //Same for both
    var itemCell2 = document.createElement('listcell');
    itemCell2.setAttribute('label', aAuthor);
    itemCell2.setAttribute('crop', 'right');
    itemCell2.setAttribute('class', "addonAuth");
    
    if(aService == "addon"){
        item.setAttribute('id', 'li-a-' + aNumber);
        item.setAttribute('onclick', "pffAddonSkin.onAddonListClick(event, '" + aNumber + "')");
        
        var itemCell3 = document.createElement('listcell');
        
        var checkbox = document.createElement('checkbox');
        var label = document.createElement('label');
        checkbox.setAttribute('id', 'li-a-check-i-' + aNumber);
        checkbox.setAttribute('crop', 'false');
        checkbox.setAttribute('class', 'pffAddonCheck');
        checkbox.setAttribute('checked', isEnabled);
        label.setAttribute('value', aName);
        itemCell.appendChild(checkbox);
        itemCell.appendChild(label);
        itemCell3.setAttribute('id', 'li-a-enabled-i-' + aNumber);
        itemCell3.setAttribute('crop', 'right');
        var theStr = "";
        if(isEnabled){
            theStr = performancingUI.getLocaleString('enabled', []);
        }else{
            theStr = performancingUI.getLocaleString('disabled', []);
        }
        itemCell3.setAttribute('label', theStr);
    }else{
        itemCell.setAttribute('label', aName);
        itemCell.setAttribute('crop', 'right');
        itemCell.setAttribute('class', "addonName");
        item.setAttribute('id', 'li-s-' + aNumber);
        item.setAttribute('onclick', "pffAddonSkin.onSkinListClick(this, event, '" + aNumber + "')");
    }
    item.appendChild(itemCell);
    item.appendChild(itemCell2);
    if(aService == "addon"){
        item.appendChild(itemCell3);
    }
    //Append the elements
    list.appendChild(item);
}

// aService = 'addon' | 'skin'
pffAddonSkin.getXMLFile = function() {
    var file = PerFormancingDirIO.get("ProfD");
    file.append("performancing");
    //file.append("skins");
    file.append("pffaddons.xml");
    return file;
}

pffAddonSkin.deleteItemFromXML = function(aSRC) {
    var file = this.getXMLFile();
    if(file.exists()){
        var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theXML = new XML(theXMLString);
        var indexToDelete = theXML..entry.(src==aSRC).childIndex();
        var didDelete = delete theXML..entry[indexToDelete];
        var isSaved = this.saveContentsToFile( file, theXML.toString() );
        
        return (didDelete && isSaved) ;
    }else{
        return false;
    }
    return false;
}

pffAddonSkin.deleteFile = function(aSRC) {
    var theFile = this.getSkinAddonFile(aSRC);
    if( theFile.exists() ){
        PerFormancingFileIO.unlink(theFile);
    }else{
        //alert("Couldn't delete file");
    }
}

pffAddonSkin.deleteDir = function(aSRC) {
    var theFile = this.getSkinAddonDir(aSRC);
    var dirName = aSRC.split(".");
    theFile.append(dirName[0]);
    if( theFile.exists() ){
        if(theFile.isDirectory()){
            PerFormancingDirIO.unlink(theFile, true); //true => recursive
        }
    }
}

pffAddonSkin.openAndLoadXMLFile = function(aService) {
    var file = this.getXMLFile();
    if(file.exists()){
        var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theXML = new XML(theXMLString);
        var allTheAddons = null;
        if(aService=="addon"){
            allTheAddons = theXML.addons;
        }else{
            allTheAddons = theXML.skins;
        }
        //gGlobalPerFormancingAddons = theXML;
        
        var theLastSkinURI = gPerformancingUtil.prefs.getCharPref("settings.lastselected.skinuri");
        //var theLastSkinLdDef = gPerformancingUtil.prefs.getCharPref("settings.lastselected.lddef");
        if(allTheAddons.children().length() > 0){
            gPerformancingUtil.clearListOut('performancing-'+aService+'-list');
            for(var j = 0; j < allTheAddons.children().length(); j++){
                var entryDesc = allTheAddons.entry[j].desc.toString();
                var entryName = allTheAddons.entry[j].name.toString();
                var entryAuthor = allTheAddons.entry[j].author.toString();
                //entryDate = allTheAddons.entry[j].date.toString();
                var entrySRC = allTheAddons.entry[j].src.toString();
                var setLdDef = allTheAddons.entry[j].defaulton.toString();
                //alert("entrySRC: " + entrySRC + "\ntheLastSkinURI: " + theLastSkinURI);
                var isEntryEnabled = "false";
                if(theLastSkinURI == entrySRC){
                    isEntryEnabled = "true";
                }else{
                    isEntryEnabled = "false";
                }
                this.loadSkinAddonList(aService, 'performancing-' + aService + '-list', j, entryDesc, entryName, entryAuthor, entrySRC, isEntryEnabled, setLdDef)
            }
        }
    }else{
        //alert("No XML file");//TEMP
    }
    
}

// Here we save the XML data and create it if it doesn't exist
// aService = 'addon' | 'skin'
pffAddonSkin.saveXMLFile = function(aService, theDesc, theName, theAuthor, isDefaultOn, theSRC, isEnabled, aType ) {
    var file = this.getXMLFile();
    var theXMLFile = null;
    var theAddonXML = null;
    var theDateAdded = bfXMLRPC.iso8601Format( new Date() );
    var didOverWrite = false;
    var isSaved = false;
    
    //Doesn't exist, so let's create it.
    if(!file.exists()){
        //dump('Creating file: ' + bloglistxmlfile + "\n");
        var defName = "Default";
        var defDesc = "PFF's Default Theme";
        var defAuthor = "Performancing, Inc.";
        var defSRC = "_default_";
        var defDate = "20060711T22:19:53";
        var defEnable = "true";
        theAddonXML = <addonlist>
                        <skins>
                            <entry>
                              <name>{defName}</name>
                              <desc>{defDesc}</desc>
                              <author>{defAuthor}</author>
                              <src>{defSRC}</src>
                              <date>{defDate}</date>
                              <enabled>{defEnable}</enabled>
                              <defaulton>{isDefaultOn}</defaulton>
                              <type>{aType}</type>
                            </entry>
                        </skins>
                        <addons />
                     </addonlist>;
        PerFormancingFileIO.create(file);
        
        isSaved = this.saveContentsToFile( file, theAddonXML.toString() );
    }
    
    if(file.exists()){
        var theXMLFile = PerFormancingFileIO.open(file.path);
        var theXMLString = PerFormancingFileIO.read(theXMLFile, "UTF-8");
        var theAddonXML = new XML(theXMLString);
        
        //The Content for each Blog
        if(aService == "skin"){
            var itExists = theAddonXML.skins.entry.(src == theSRC);
            if(itExists != undefined){
               //We need to replace the values
               itExists.name = theName;
               itExists.desc = theDesc;
               itExists.author = theAuthor;
               itExists.src = theSRC;
               itExists.date = theDateAdded;
               itExists.enabled = isEnabled;
               itExists.defaulton = isDefaultOn;
               itExists.type = aType;
               
               didOverWrite = true;
            }else{ //Add a new one
                theAddonXML.skins.entry +=
                                        <entry>
                                            <name>{theName}</name>
                                            <desc>{theDesc}</desc>
                                            <author>{theAuthor}</author>
                                            <src>{theSRC}</src>
                                            <date>{theDateAdded}</date>
                                            <enabled>{isEnabled}</enabled>
                                            <defaulton>{isDefaultOn}</defaulton>
                                            <type>{aType}</type>
                                        </entry>;
            }
        }else if(aService == "addon"){
            var itExists = theAddonXML.addons.entry.(src== theSRC)
            if(itExists != undefined){
               //We need to replace the values
               itExists.name = theName;
               itExists.desc = theDesc;
               itExists.author = theAuthor;
               itExists.src = theSRC;
               itExists.date = theDateAdded;
               itExists.enabled = isEnabled;
               itExists.defaulton = isDefaultOn;
               itExists.type = aType;
               
               didOverWrite = true;
            }else{ //Add a new one
            theAddonXML.addons.entry +=
                                    <entry>
                                        <name>{theName}</name>
                                        <desc>{theDesc}</desc>
                                        <author>{theAuthor}</author>
                                        <src>{theSRC}</src>
                                        <date>{theDateAdded}</date>
                                        <enabled>{isEnabled}</enabled>
                                        <type>{aType}</type>
                                    </entry>;
            }
        }
        //Write to file (save changes)
        isSaved = this.saveContentsToFile( file, theAddonXML.toString() );
    }
    //Report if the file was saved
    if(isSaved){
        return didOverWrite;
    }else{
        return null;
    }
}


// TODO
// Send this to the UTIL Library
pffAddonSkin.saveContentsToFile = function(aFile, aContents){
    var newWrite = PerFormancingFileIO.write(aFile, aContents, "w", "UTF-8");
    if(!newWrite) {
        var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
        alert(localeString);
        return false;
    }else{
        return true;
    }
                            
    return false;
}

pffAddonSkin.getSkinAddonDir = function(aFileLeaf){
    var file = PerFormancingDirIO.get("ProfD");
    file.append("performancing");
    if( aFileLeaf.match(".css") ){
        file.append("skins");
    }else{
        file.append("addons");
    }
    return file;
}

pffAddonSkin.getSkinAddonFile = function(aFileLeaf){
    var file = pffAddonSkin.getSkinAddonDir(aFileLeaf);
    file.append(aFileLeaf);
    
    return file;
}

// nsIZipReader
// A good example of it's use can be found in the Extension Manager
pffAddonSkin.getZipReaderForFile = function(zipFile){
   try {
     var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"]
                               .createInstance(Components.interfaces.nsIZipReader);
     zipReader.init(zipFile);
     zipReader.open();
   }
   catch (e) {
     zipReader.close();
     return false;;
   }
   return zipReader;
}

//For dragging and droping onto the Skin Window (not the input box)
var pffCSSDragDropHandler = {
    
    onDragOver: function(aEvent, aFlavour, aSession){
        //Foobar
    },
    
    onDrop: function(aEvent, aTransferData, aSession){
        //aTransferData.first.first.data  => gives URL
        //.first.first.flavour.contentType	=> text/x-moz-url
        if (aTransferData.first.first.data != "") {
          var theFile = aTransferData.first.first.data;
          if(theFile.leafName.match(".css")){
              pffAddonSkin.handleTheFile( theFile );
          }else if(theFile.leafName.match(".zip") || theFile.leafName.match(".jar")){
              pffAddonSkin.handleSkinZip(theFile);
          }
        }
    },
    
    onDragExit: function(aEvent, aSession) {
        //foobar
    },
    
    getSupportedFlavours: function(){
        var flavours = new FlavourSet();
        flavours.appendFlavour("application/x-moz-file", "nsIFile");
        return flavours;
    },
    
    canHandleMultipleItems: function(){
        return false;
    }
};

//Object inherited by Addons
function pffaddonObject( aName, aVersion, aDescription, aAuthor, aId, aPffVer ) {
    this.addonEnabled = false;
    //this.theAddon = aAddon;
    this.name = aName;
    this.version = aVersion;
    this.description = aDescription;
    this.author = aAuthor;
    this.id = aId;
    this.pffver = aPffVer;
}

pffaddonObject.prototype = {
    
    observe: function(aSubject, aTopic, aData){
        var doHook = false;
        try{
            if (aTopic == "performancing-addon-pffstart-topic") {
                    pffAddonSkin.hookInAddon( this );
            }else if (aTopic == "performancing-addon-pffenable-topic") {
                if(this.id == aData){
                    pffAddonSkin.enableAnAddonCallback( this, aData );
                }
            }else if (aTopic == "performancing-addon-pffdisable-topic") {
                if(this.id == aData){
                    pffAddonSkin.disableAnAddonCallback( this, aData );
                }
            }else if (aTopic == "performancing-addon-pfftabclick-topic") {
                //alert("dude this.id: " + this.id + "\naData: " + aData + "\naTopic: " + aTopic);
                if(this.id == aData){
                   this.onThisTabClick();
                }else{
                }
            }
        }catch(e){}
    },

    hookIntoPFF:  function(doHook){
       if(doHook){
           gPerformancingUtil.printLog('PFF Addon Template Enabled');
           this.addonEnabled = true;
           this.onPFFLoad();
       }else{
           this.addonEnabled = false;
       }
    },
    
    init:  function(){
    },
    
    onPFFLoad:	function(){
    },
    
    onThisTabClick:	 function(){
    }
}
