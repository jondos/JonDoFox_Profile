/*
Note Handling code
---------------------------------------------------
*/
var gGlobalPerFormancingNotes = null;
function performancingNotes() {
    this.notesFile = "performancing-notes.xml";
}

performancingNotes.prototype.init = function(){
    this.loadNotes(false, null);
    window.setTimeout('gPerformancingNotes.onSavedLoad()', 500, true);
}

performancingNotes.prototype.doNoteOnUnload = function(){
    //alert("Unload");
    var doTheUnload = gPerformancingUtil.prefs.getBoolPref("settings.saveonexit");
    if(doTheUnload){
        try{
            var file = this.getXMLFile();
            var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
            var theNotesXML = new XML(theXMLString);
            
            var tabbox = document.getElementById("performancing-editor-tabbox");
            var theContent = null;
            var theTitle = document.getElementById("performancing-editor-subject").value;
            if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
                var winNormal = document.getElementById("performancing-message");
                theContent = winNormal.contentWindow.document.body.innerHTML;
            }else if(tabbox.selectedIndex == 1){ //Source
                theContent = document.getElementById("performancing-message-source").value
            }else{
                //alert('PerFormancing Error: Could not find Note content, please contact the author');
            }
            
            theNotesXML.lastsaved.note = 
                                    <note> 
                                    <title>{theTitle}</title> 
                                    <content>{theContent}</content> 
                                    </note>;
            //Save the note
            var newWrite = PerFormancingFileIO.write(file, theNotesXML.toString(), "w", "UTF-8");
            if(!newWrite) {
                //Can not write to file error #1, you may not have the correct permissions
                var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
                alert(localeString);
            }
        }catch(e){
            //Foo
        }
    }
}

performancingNotes.prototype.onSavedLoad = function(){
        var file = this.getXMLFile();
        var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theNotesXML = new XML(theXMLString);
        var theEntry = theNotesXML.lastsaved.note;
        
        //First Focus the Source
        var tabbox = document.getElementById("performancing-editor-tabbox"); 
        //tabbox.selectedIndex = 1;
        
        //convert back to html
        var theContent = theEntry.content.toString();
        theContent = theContent.replace(/&lt;/gi, "<");
        theContent = theContent.replace(/&gt;/gi, ">");
        
        //Then Load the contents
        //var tabbox = document.getElementById("performancing-editor-tabbox");
        if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
            var winNormal = document.getElementById("performancing-message");
            winNormal.contentWindow.document.body.innerHTML = theContent;
        }else if(tabbox.selectedIndex == 1){ //Source
            document.getElementById("performancing-message-source").value = theContent;
        }else{
            var localeString = performancingUI.getLocaleString('notenotfound', []);
            alert(localeString);
        }
        var winPreview = document.getElementById("performancing-preview-display");
        //winPreview.contentWindow.document.body.innerHTML = theContent;
        document.getElementById("performancing-message-source").value = theContent;
        performancingMidas.syncNormalTab();
        
        
        //Then Load the Title
        var theNoteName = theEntry.title.toString();
        document.getElementById("performancing-editor-subject").value = theEntry.title.toString();
        
        performancingUI.onLoadInsert();
}

performancingNotes.prototype.loadNotes = function(isSearch, searchArray){
    try{
        var file = this.getXMLFile();
        var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theNotesXML = new XML(theXMLString);
        
        var allTheNotes = theNotesXML.notes;
        gGlobalPerFormancingNotes = allTheNotes;
        
        //allTheNotes.note.length()
        //Show only search results!
        //alert("isSearch: " + isSearch + " searchArray: " +searchArray);
        if(isSearch){
            allTheNotes = new XML(<notes></notes>);
            for( l = 0; l < searchArray.length; l++){
                allTheNotes.note += theNotesXML.notes.note[ searchArray[l] ] ; 
            }
        }
        //alert("allTheNotes: " + allTheNotes.toString() );
        //gGlobalPerFormancingNotes = allTheNotes;
        var noteName = null;
        var noteContent = null;
        var noteDate = null;
        var noteGUID = null;
        var onNoteClick = "gPerformancingNotes.addNoteToEditor(this);";
        var theClass = "performancenote";
        var isFirstRun = gPerformancingUtil.prefs.getBoolPref("firstrun");
        var numOfNotes = allTheNotes.children().length();
        //Load the notes into the note list
        if(numOfNotes > 0){
            gPerformancingUtil.clearListOut('performancing-notes-list');
            for(var j = 0; j < allTheNotes.children().length(); j++){
                noteName = allTheNotes.note[j].title.toString();
                //Remove any extra spaces (atleast 2 or more consecutive spaces)
                noteName = noteName.replace(/\s\s+/gi, " ");
                if(noteName == "" || noteName == " "){
                    noteName = "Untitled";
                }
                noteContent = allTheNotes.note[j].content.toString();
                noteDate = allTheNotes.note[j].datemodified.toString();
                noteGUID = allTheNotes.note[j].GUID.toString();
                this.addItemToList('performancing-notes-list', noteName, noteContent, noteDate, noteGUID, onNoteClick, j, theClass )
            }
        }else if(numOfNotes == 0 && isFirstRun){
            //Foo.
            gPerformancingUtil.clearListOut('performancing-notes-list');
            this.addItemToList('performancing-notes-list', 'No notes available.', "", "", "", "", 0, "" )
        }else if(!isSearch || !isFirstRun){
            var formatedExample = "This is an <span style=\"font-weight: bold; color: rgb(255, 0, 0);\">example </span>of a <span style=\"font-weight: bold;\">formatted <span style=\"color: blue;\">note</span></span> note";
            this.generateXML("Example Note 1", formatedExample, null, null, onNoteClick);
            this.generateXML("Example Note 2", "This is an example of a normal text note", null, null, onNoteClick);
            isFirstRun = true;
            gPerformancingUtil.prefs.setBoolPref("firstrun", true);
            this.loadNotes(false, null);
        }
    }catch(e){
        alert("Error Loading notes: " + e);
    }
    //dnote.notes.children().length()
}

//theNoteName, theNoteContent, aNoteDate, theGUID
performancingNotes.prototype.addItemToList = function(listIDname, theNoteName, theNoteContent, aNoteDate, theGUID, onItemClick, aNumber, theClass){
    var list = document.getElementById(listIDname);
    var item = document.createElement('listitem');
    item.setAttribute('id', 'note-' + aNumber);
    item.setAttribute('noteGUID', theGUID);
    item.setAttribute('tooltiptext', theNoteName);
    item.setAttribute('date', aNoteDate);
    item.setAttribute('onclick', onItemClick);
    item.setAttribute('class', theClass);
    
    var itemCell = document.createElement('listcell');
    itemCell.setAttribute('label', theNoteName);
    itemCell.setAttribute('crop', 'right');
    itemCell.setAttribute('class', theClass + '2');
    item.appendChild(itemCell);
    
    //Append the elements
    list.appendChild(item);
    //sizeToContent();
}

performancingNotes.prototype.doSave = function(theElement){
    //Check if note doesn't already exists (same GUID)
    var theNoteGUID = theElement.getAttribute("lastpostid");
    var theTitle = document.getElementById("performancing-editor-subject").value;
    
    var file = this.getXMLFile();
    var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
    var theNotesXML = new XML(theXMLString);
    var theEntry = theNotesXML.notes.note.(title.toString() == theTitle);
    if( theEntry.length() > 0 ){
        //We have a match, prompt user and make sure he wants to save it.
        //Call some function here
        this.promptSaveType(theTitle, theElement);
    }else{
        //Note doesn't exists, so go save it as a new one.
        gPerformancingNotes.reSaveNote(theElement, true);
    }
    
}

//Not used anymore! (?)
performancingNotes.prototype.promptSaveType = function(aTitle, theElement){
    //If not, then create the new GUID
    var localeString = performancingUI.getLocaleString('notealreadyexists', [aTitle]);
    var localeString2 = performancingUI.getLocaleString('overwritenote', []);
    if( confirm(localeString + "\n" + localeString2) ){
        gPerformancingNotes.reSaveNote(theElement, false, aTitle);
    }
}

performancingNotes.prototype.reSaveNote = function(theElement, creatNewNote, aTitle){
    //Check if note doesn't already exists (same GUID)
    var theNoteGUID = theElement.getAttribute("lastpostid");
    var file = this.getXMLFile();
    var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
    var theNotesXML = new XML(theXMLString);
    var theEntry = null;
    try{
        theEntry = theNotesXML.notes.note.(title.toString() == aTitle );
    }catch(e){
        //foo
    }
    
    var tabbox = document.getElementById("performancing-editor-tabbox");
    var theContent = null;
    var theTitle = document.getElementById("performancing-editor-subject").value;
    if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
        var winNormal = document.getElementById("performancing-message");
        theContent = winNormal.contentWindow.document.body.innerHTML;
    }else if(tabbox.selectedIndex == 1){ //Source
        theContent = document.getElementById("performancing-message-source").value
    }else{
        var localeString = performancingUI.getLocaleString('notenotfound', []);
        alert(localeString);
    }
    
    var theNoteDate = bfXMLRPC.iso8601Format( new Date() );
    if( theEntry.length() > 0  && !creatNewNote){
        //Save new content and
        var theIndex = theEntry.childIndex();
        theNotesXML.notes.note[theIndex].title = theTitle;
        theNotesXML.notes.note[theIndex].content = theContent;
        theNotesXML.notes.note[theIndex].datemodified = theNoteDate;
        
        //Save the note
        var newWrite = PerFormancingFileIO.write(file, theNotesXML.toString(), "w", "UTF-8");
        if(!newWrite) {
            var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
            alert(localeString);
        }
    }else{
        //If not, then create the new GUID
        var theGUID = this.newGuid();
        //Not will be saved by this function
        result = this.generateXML( theTitle, theContent, theNoteDate, theGUID );
        
    }
    //Remove re-save button
    var noteButton = document.getElementById("performancing-resavenote-button");
    noteButton.hidden = true;
    
    //Now reload notes
    gPerformancingNotes.loadNotes(false, null);
}

performancingNotes.prototype.generateXML = function(theNoteName, theNoteContent, aNoteDate, theGUID){
    //We need to get this from a file and theBlogXML = new XML(theFilesStringContents);
    var file = this.getXMLFile();
    var theXMLFile = null;
    var theBlogXML = null;
    var theNoteDate = null;
    if(!aNoteDate){
        theNoteDate = bfXMLRPC.iso8601Format( new Date() );
    }
    
    if(!theGUID){
        theGUID = this.newGuid();
    }
    //Doesn't exist, so let's create it.
    if(!file.exists()){
        //dump('Creating file: ' + bloglistxmlfile + "\n");
        theBlogXML = <notelist>
                        <lastsaved>
                            <note></note>
                        </lastsaved>
                        <notes>
                        </notes>
                     </notelist>;
        PerFormancingFileIO.create(file);
        var rv = PerFormancingFileIO.write(file, theBlogXML.toString(), "w", "UTF-8");
        if(!rv) {
            var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
            alert(localeString);
        }
    }
    
    if(file.exists()){
        var theXMLFile = PerFormancingFileIO.open(file.path);
        var theXMLString = PerFormancingFileIO.read(theXMLFile, "UTF-8");
        theBlogXML = new XML(theXMLString);
        
        //The Content for each Blog
        theBlogXML.notes.note +=
                                    <note>
                                        <title>{theNoteName}</title>
                                        <content>{theNoteContent}</content>
                                        <datemodified>{theNoteDate}</datemodified>
                                        <GUID>{theGUID}</GUID>
                                    </note>;
        //Write to file (save changes)
        var newWrite = PerFormancingFileIO.write(file, theBlogXML.toString(), "w", "UTF-8");
        if(!newWrite) {
            var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
            alert(localeString);
        }
                                
        return theBlogXML;
    }else{
        return false;
    }
}

performancingNotes.prototype.addNoteToEditor = function(theElement){
/*
   Todo:
   - Load Content
   - Load Subject
   - Load Categories
   - Display 'Save as New' and 'Save'
*/
    var theNoteGUID = theElement.getAttribute("noteGUID");
    var file = this.getXMLFile();
    var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
    var theNotesXML = new XML(theXMLString);
    
    try{
        //dump("The Read NOTES XML: " + theNotesXML.notes.note + '\n' + "aPostId to get:" + theNoteGUID + '\n')
        var theEntry = theNotesXML.notes.note.(GUID == theNoteGUID );
        
        //Now load everything
        //First Focus the Source
        var tabbox = document.getElementById("performancing-editor-tabbox"); 
        //tabbox.selectedIndex = 1;
        
        //convert back to html
        var theContent = theEntry.content.toString();
        theContent = theContent.replace(/&lt;/gi, "<");
        theContent = theContent.replace(/&gt;/gi, ">");
        
        //Then Load the contents
        //var tabbox = document.getElementById("performancing-editor-tabbox");
        if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
            var winNormal = document.getElementById("performancing-message");
            winNormal.contentWindow.document.body.innerHTML = theContent;
        }else if(tabbox.selectedIndex == 1){ //Source
            document.getElementById("performancing-message-source").value = theContent;
        }else{
            var localeString = performancingUI.getLocaleString('notenotfound', []);
            alert(localeString);
        }
        var winPreview = document.getElementById("performancing-preview-display");
        //winPreview.contentWindow.document.body.innerHTML = theContent;
        document.getElementById("performancing-message-source").value = theContent;
        performancingMidas.syncNormalTab();
        
        
        //Then Load the Title
        var theNoteName = theEntry.title.toString();
        document.getElementById("performancing-editor-subject").value = theEntry.title.toString();
        
        //Show Republish button and set attributes
        var pubButton = document.getElementById("performancing-resavenote-button");
        pubButton.setAttribute("lastpostid", theNoteGUID);
        pubButton.hidden = false;
        
        return true;
    }catch(e){
        var localeString = performancingUI.getLocaleString('noteerror', [e]);
        alert(localeString);
        return true;
    }
    
}

performancingNotes.prototype.deleteNoteEntry = function(){
    try{
        var resaveButton = document.getElementById("performancing-resavenote-button");
        var theNoteGUID = resaveButton.getAttribute("lastpostid");
        var file = this.getXMLFile();
        var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theNotesXML = new XML(theXMLString);
        //delete dude..blog.(GUID == theGUID);
        var entryIndex = theNotesXML.notes.note.(GUID == theNoteGUID ).childIndex();
        delete theNotesXML.notes.note[entryIndex];
        
        //Now save the change
        var rv = PerFormancingFileIO.write(file, theNotesXML.toString(), "w", "UTF-8");
        if(!rv) {
            var localeString = performancingUI.getLocaleString('cannotwritetofile', [e]);
            alert(localeString);
        }
    }catch(e){
        var localeString = performancingUI.getLocaleString('cantdeletenote', []);
        //Could not delete the selected note!
        alert(localeString);
    }
    //Now reload notes
    performancingMidas.makeBlank();
    performancingUI.toggleExtraOptDeck(true);
    performancingUI.clearTechnoratiTags();
    gPerformancingNotes.loadNotes(false, null);
}

performancingNotes.prototype.getXMLFile = function(){
    var file = PerFormancingDirIO.get("ProfD");
    file.append("extensions");
    file.append(this.notesFile);
    return file;
}

//Return array of index's of notes or false if not found
performancingNotes.prototype.searchNotes = function(theTextString){
    //First search in title
    theTextString = theTextString.toLowerCase();
    var file = this.getXMLFile();
    var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
    var theNotesXML = new XML(theXMLString);
    
    var allTheNotes = theNotesXML.notes;
    
    var theNoteTitles = allTheNotes.note.title;
    var theNoteContent = allTheNotes.note.content;
    
    var noteLength = theNoteTitles.length();
    var searchResults = [];
    
    for(i=0; i < noteLength; i++){
        var theTitle = "";
        var theContent = "";
        try{
            theTitle = theNoteTitles[i].text().toLowerCase();
        }catch(e){}
        try{
            theContent = theNoteContent[i].text().toLowerCase();
        }catch(e){}
        if( theTitle.search(theTextString) >= 0 ){
            searchResults.push( i ) ;
        }else if( theContent.search(theTextString) >= 0 ){
            searchResults.push( i ) ;
        }
    }

    if(searchResults.length > 0 ){
        return searchResults;
    }else{
        //didn't find anything!
        return false;
    }
    //didn't find anything!
    return false;
    
    //then search in content if that failed
    
}

//for search
performancingNotes.prototype.onNoteSearchChange = function(){
    var theTextString = document.getElementById("performancing-search-notes-text").value;
    var notesToShow = gPerformancingNotes.searchNotes( theTextString );
    
    if(!notesToShow){
        gPerformancingUtil.clearListOut('performancing-notes-list');
        this.addItemToList('performancing-notes-list', 'No results found', '', '', '', '', 0, 'onsearcherror' )
    }else{
        gPerformancingNotes.loadNotes(true, notesToShow );
    }
    
}

/*
// Original function by Lewis E. Moten III
// Terms of Agreement:
// By using this code, you agree to the following terms...
// 1) You may use this code in your own programs (and may compile it into a program and distribute it in compiled format for languages that allow it) freely and with no charge.   
// 2) You MAY NOT redistribute this code (for example to a web site) without written permission from the original author. Failure to do so is a violation of copyright laws.   
// 3) You may link to this code from another website, but ONLY if it is not wrapped in a frame. 
// 4) You will abide by any additional copyright restrictions which the author may have placed in the code or code's description.
*/
performancingNotes.prototype.newGuid = function(){
    var g = ""; 
    for(var i = 0; i < 32; i++){
        g += Math.floor(Math.random() * 0xF).toString(0xF) + (i == 8 || i == 12 || i == 16 || i == 20 ? "-" : ""); 
    }
    return g;
}
////////////////////

var gPerformancingNotes = null;
function loadPerFormancingNotes() {
    try {
        gPerformancingNotes = new performancingNotes();
    } catch(e) { alert(e); }
    gPerformancingNotes.init();//Load (D&D) Prefs
}
