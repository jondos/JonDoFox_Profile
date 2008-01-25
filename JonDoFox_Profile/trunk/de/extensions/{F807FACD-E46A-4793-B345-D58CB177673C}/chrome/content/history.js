/*
History javascript
--------------------------------
A poor attempt to keep all history functions here
*/

var PFFTempHistoryObject = new XML();
var pffDebugTempHistObject = [];

//TODO: Make more generic for re-use!!
performancingUtil.prototype.loadHistoryXMLFile = function(){
    var file = gPerformancingUtil.getHistoryXMLFile();
    var f2 = PerFormancingFileIO.open(file.path);
    var theXMLString = null;
    if(f2.exists()){
        theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theHistoryXML = new XML(theXMLString);
        return theHistoryXML;
    }else{
        //dump('PerFormancing XML File does not exists!');
        return false;
    }
}

//TODO: Make more generic for use with Notes!
performancingUtil.prototype.getHistoryXMLFile = function(){
    var file = PerFormancingDirIO.get("ProfD");
    file.append("extensions");
    file.append('performancing_history.xml');
    return file;
}

performancingUtil.prototype.addHistoryItemToEditor = function(theElement){
/*
   Todo:
   - Load Content
   - Load Subject
   - Load Categories
   - Display 'Publish as New' and 'Publish as Edit'
*/
    var thePostID = theElement.getAttribute("postid");
    var theDateCreated = theElement.getAttribute("date");
    var histFile = gPerformancingUtil.loadHistoryXMLFile();
    
    var theBlogXML = new XML(histFile);
    pffDebugTempHistObject = theBlogXML;
    try{
        //dump("The Read History XML: " + theBlogXML..entry + '\n' + "aPostId to get:" + thePostID + '\n')
        var theEntry = theBlogXML..entry.(postid == thePostID );
        
        //Now load everything
        //First Focus the Source
        var tabbox = document.getElementById("performancing-editor-tabbox"); 
        //tabbox.selectedIndex = 1;
        
        //convert back to html
        var theContent = theEntry.content.toString();
        theContent = theContent.replace(/&lt;/gi, "<");
        theContent = theContent.replace(/&gt;/gi, ">");
        
        /*
        //Then Load the contents
        var winPreview = document.getElementById("performancing-preview-display");
        //winPreview.contentWindow.document.body.innerHTML = theContent;
        document.getElementById("performancing-message-source").value = theContent;
        performancingMidas.syncNormalTab();
        */
        
        //var tabbox = document.getElementById("performancing-editor-tabbox");
        if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
            var winNormal = document.getElementById("performancing-message");
            winNormal.contentWindow.document.body.innerHTML = theContent;
        }else if(tabbox.selectedIndex == 1){ //Source
            document.getElementById("performancing-message-source").value = theContent;
        }else{
            //PerFormancing Error: Could not find Note content, please contact the author
            var localeString = performancingUI.getLocaleString('nonotecontent', []);
            alert(localeString);
        }
        var winPreview = document.getElementById("performancing-preview-display");
        //winPreview.contentWindow.document.body.innerHTML = theContent;
        document.getElementById("performancing-message-source").value = theContent;
        performancingMidas.syncNormalTab();
        
        //Then Load the Title
        var theTitle = theEntry.title.toString();
        document.getElementById("performancing-editor-subject").value = theTitle;
        
        //Load the categories
        var tempArray = theEntry.categories.split(",");
        gPerformancingUtil.setCategoriesSidebar(tempArray, false);
        
        //Show Republish button and set attributes
        var pubButton = document.getElementById("performancing-republish-button");
        var editButtons = document.getElementById("post-edit-buttons");
        pubButton.setAttribute("lastpostid", thePostID);
        pubButton.setAttribute("datecreated", theDateCreated);
        editButtons.hidden = false;
        
        return true;
    }catch(e){
        //alert("History Error: " + e);
        return true;
    }
    
}

performancingUtil.prototype.clearHistoryXMLFile = function(){
    var file = gPerformancingUtil.getHistoryXMLFile();
    var theXMLFile = null;
    var theBlogXML = null;
    //Doesn't exist, so let's create it.
    if(!file.exists()){
        //dump('Creating HISTORY file: \n');
        theBlogXML = <historylist>
                        <list></list>
                     </historylist>;
        PFFTempHistoryObject = theBlogXML;
        PerFormancingFileIO.create(file);
        var rv = PerFormancingFileIO.write(file, theBlogXML.toString(), "w", "UTF-8");
        if(!rv) {
            var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
            alert(localeString);
        }
    }else if(file.exists()){
         var theXMLFile = PerFormancingFileIO.open(file.path);
         theBlogXML = <historylist>
                        <list></list>
                     </historylist>;
         PFFTempHistoryObject = theBlogXML;
         var newWrite = PerFormancingFileIO.write(file, theBlogXML.toString(), "w", "UTF-8");
         if(!newWrite) {
            var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
            alert(localeString);
         }
    }
}

performancingUtil.prototype.setHistoryXML = function(thePostID, theContent, theTitle, theCategories, theDateCreated){
    //PFFTempHistoryObject
    PFFTempHistoryObject.list.entry +=
                            <entry>
                                <postid>{thePostID}</postid>
                                <content>{theContent}</content>
                                <title>{theTitle}</title>
                                <categories>{theCategories}</categories>
                                <datecreated>{theDateCreated}</datecreated>
                            </entry>;
}

    
//TODO: Make more generic for use with Notes!
//gPerformancingUtil.saveHistoryXMLFile(thePostID, theContent, theTitle, theCategories, theDateCreated);
performancingUtil.prototype.saveHistoryXMLFile = function(){
    //We need to get this from a file and theBlogXML = new XML(theFilesStringContents);
    var file = gPerformancingUtil.getHistoryXMLFile();
    if(file.exists()){
        var theXMLFile = PerFormancingFileIO.open(file.path);
        //var theXMLString = PerFormancingFileIO.read(theXMLFile, "UTF-8");
        //theBlogXML = new XML(theXMLString);
        /*theBlogXML = <historylist>
                        <list></list>
                     </historylist>;
        */
        //The Content for each Blog
        /*theBlogXML.list.entry +=
                                    <entry>
                                        <postid>{thePostID}</postid>
                                        <content>{theContent}</content>
                                        <title>{theTitle}</title>
                                        <categories>{theCategories}</categories>
                                        <datecreated>{theDateCreated}</datecreated>
                                    </entry>;*/
        //Write to file (save changes)
        var newWrite = PerFormancingFileIO.write(file, PFFTempHistoryObject.toString(), "w", "UTF-8");
        PFFTempHistoryObject = null;
        if(!newWrite) {
            var localeString = performancingUI.getLocaleString('cannotwritetofile', []);
            alert(localeString);
        }
                                
        return true;
    }else{
        return false;
    }
}
