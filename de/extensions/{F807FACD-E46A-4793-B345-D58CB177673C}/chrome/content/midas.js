/*
Firefox Midas Handling code (Rich text editing)
-----------------------------------------------------

A portion of this code is derived from GPL 2.0 code originally by David Murray, author of the outstanding DeepestSender extension (http://deepestsender.mozdev.org)
Original note by David Murray:
This lot of code is half made up from Mozilla.org's Midas demo (http://www.mozilla.org/editor/midasdemo/)
and Netscape DevEdge's demo of the control also (http://devedge.netscape.com/viewsource/2003/midas/01/).
*/

var gPerFormancingColorPick = false; //Keep color picker from triggering twice (bad hack)
var gPerFormancingSelectedTab = 0;
var gTheTabHTMLEditor = null;
var performancingMidas = new Object();
var performancingTextEdit = new Object();

performancingMidas.setUpMidas = function() {
    this.dontautoformat = false;
    var midas = performancingUI.getRichEditor();
    var theSourceBox = document.getElementById("performancing-message-source");
    window.editorShell = midas.editorShell;
    this.makeBlank();
    midas.makeEditable("html", false);
    this.sourceview = false;
    
    //Set Color icon to black. performance-color-picker
    document.getElementById("performance-color-picker").color = "#000000";
    
    //Open Last viewed window
    var lastOpenedEditTab = null;
    try{
        lastOpenedEditTab = gPerformancingUtil.prefs.getCharPref('display.state.lastviewopened');
    }catch(e){
        lastOpenedEditTab = "tab-normal-edit";
    }
    var lastOpenedEditTabObj = document.getElementById(lastOpenedEditTab);
    //performancingMidas.viewTab(lastOpenedEditTabObj);
    //var tabbox = document.getElementById("performancing-editor-tabbox"); 
    //tabbox.selectedIndex = lastOpenedEditTab;
    
    if(lastOpenedEditTab == 0){
        midas.contentWindow.focus();
    }else if(lastOpenedEditTab == 1){
        theSourceBox.focus();
    }
    
    gTheTabHTMLEditor = midas.getHTMLEditor(midas.contentWindow);
    var useCSS = gPerformancingUtil.prefs.getBoolPref("settings.usecss");
    midas.contentDocument.execCommand("styleWithCSS", false, useCSS);
    //gTheTabHTMLEditor.returnInParagraphCreatesNewParagraph = true;
}

performancingMidas.makeBlank = function() {
    // This is to blank out the iframe, for if a post has been sent succesfully or whatever.
    var midas = document.getElementById("performancing-message");
    var SourceTextBox = document.getElementById("performancing-message-source");
    var subjectTextBox = document.getElementById("performancing-editor-subject");
    var winPreview = document.getElementById("performancing-preview-display");
    try{
        winPreview.contentWindow.document.body.innerHTML = "";
    }catch(e){}
    SourceTextBox.value = "";
    subjectTextBox.value = "";
    //midas.contentDocument.body.innerHTML = "<p>&nbsp;</p>";
    midas.contentDocument.body.innerHTML = "<br/>";
    midas.contentDocument.designMode = "On";
    
    var useCSS = gPerformancingUtil.prefs.getBoolPref("settings.usecss");
    midas.contentDocument.execCommand("styleWithCSS", false, useCSS);
    
    //midas.contentWindow.document.body.innerHTML = "<p>&nbsp;</p>";
    midas.contentWindow.document.body.innerHTML = "<br/>";
    midas.contentWindow.focus()
}

performancingMidas.doSomeEditCommand = function(aName, aArg) {
    var bfEditorTabSelected = document.getElementById("performancing-editor-tabbox").selectedIndex;
    if(bfEditorTabSelected == 1){
        performancingTextEdit.insertCode(aName, null, null);
    }else{
        this.doRichEditCommand(aName, aArg);
    }
} 

performancingMidas.doRichEditCommand = function(aName, aArg) {
    var midas = document.getElementById("performancing-message");
    // substitute undefined command identifiers
    midas.contentDocument.execCommand(aName,false, aArg);
    midas.contentWindow.focus()
} 

performancingMidas.addLink = function(){
        var midas = document.getElementById("performancing-message");
        var bfEditorTabSelected = document.getElementById("performancing-editor-tabbox").selectedIndex;
        if(bfEditorTabSelected == '1'){
            performancingTextEdit.insertCode('url', null, null);
        }else{
            var localeString = performancingUI.getLocaleString('midaseenterurl', []);
            var myUrl = prompt(localeString, "http://");
            if (myUrl != null && myUrl != "http://") {
                midas.contentDocument.execCommand("createLink", false, myUrl);
            }
        }
}

performancingMidas.blockquote = function(){
  performancingMidas.doApplyTag("blockquote");
}


performancingMidas.strong = function(){
  performancingMidas.doApplyTag("strong");
}

performancingMidas.em = function(){
  performancingMidas.doApplyTag("em");
}

performancingMidas.doApplyTag = function(sTagName) {
  var bfEditorTabSelected, midas, oRange, sRange, newNode;
  bfEditorTabSelected = document.getElementById("performancing-editor-tabbox").selectedIndex;
  midas = document.getElementById("performancing-message");
  oRange = midas.contentWindow.getSelection().getRangeAt(0);  // this will exist only in the rich text editor
    if(bfEditorTabSelected == '1'){
      performancingTextEdit.insertCode(sTagName, null, null);
    } else if(performancingMidas.isTagPresent(sTagName, oRange) && !oRange.collapsed) {
      performancingMidas.removeTag(oRange);
    } else {
      sRange = oRange.toString();
      oRange.deleteContents();
      newNode = midas.contentDocument.createElement(sTagName);
      newNode.appendChild(midas.contentDocument.createTextNode(sRange));
      oRange.insertNode(newNode);

      // TODO: set focus back AFTER the range
      sRange = null;
      newNode = null;
    }

  bfEditorTabSelected = null;
  midas = null;
  if(oRange) oRange.detach();
}

performancingMidas.isTagPresent = function(sTagName, oRange) {
  sTagName = sTagName.toUpperCase();
  if(oRange.startContainer.parentNode.nodeName == sTagName || oRange.endContainer.parentNode.nodeName == sTagName)
    return true;
  else
    return false;
}

performancingMidas.removeTag = function(oRange) {
  var sRange = oRange.toString();
  var midas = document.getElementById("performancing-message");
  oRange.deleteContents();
  oRange.insertNode(midas.contentDocument.createTextNode(sRange));
  sRange = null;
  return false;
}

//Not used blockquote
performancingMidas.bold = function(){
        var midas = document.getElementById("performancing-message");
        var bfEditorTabSelected = document.getElementById("performancing-editor-tabbox").selectedIndex;
        if(bfEditorTabSelected == '1'){
            performancingTextEdit.insertCode('url', null, null);
        }else{
            var strong = midas.contentWindow.document.createElement("strong");
            var sel = midas.contentWindow.getSelection();
            var range = sel.getRangeAt(0);
            var beforeNode = range.extractContents();
            //var beforeNode = document.createTextNode(range);
            strong.appendChild(beforeNode);//Range is not an object! Damn it!
            this.insertNodeAtSelection(midas.contentWindow, strong, null);
            //alert("bold!");
        }
}


performancingMidas.addImage = function() {
        var midas = document.getElementById("performancing-message");
        
        var bfEditorTabSelected = document.getElementById("performancing-editor-tabbox").selectedIndex;
        if(bfEditorTabSelected == '1'){
            performancingTextEdit.insertCode('img', null, null);
        }else{
            /*
            var imagetag = prompt("Please enter a Image URL:", "http://");
            //alert('imagetag:' + imagetag+':dude');
            if (imagetag != "http://" && imagetag != null) {
                var img = midas.contentWindow.document.createElement("img");
                img.setAttribute("src",imagetag);
                this.insertNodeAtSelection(midas.contentWindow, img);
                this.placeCaret(midas, img.nextSibling);
            }
            */
            var theImageToInsert = performancingUI.openImageUpload();
            if(theImageToInsert != false){
                var img = midas.contentWindow.document.createElement("img");
                    img.setAttribute("src",theImageToInsert);
                    this.insertNodeAtSelection(midas.contentWindow, img);
                    this.placeCaret(midas, img.nextSibling);
            }
        }
}

/*
    For Testing only
*/
performancingMidas.addImage2 = function() {
        var midas = document.getElementById("performancing-message");
        
        var bfEditorTabSelected = document.getElementById("performancing-editor-tabbox").selectedIndex;
        if(bfEditorTabSelected == '1'){
            performancingTextEdit.insertCode('img', null, null);
        }else{
            /*
            var imagetag = prompt("Please enter a Image URL:", "http://");
            //alert('imagetag:' + imagetag+':dude');
            if (imagetag != "http://" && imagetag != null) {
                var img = midas.contentWindow.document.createElement("img");
                img.setAttribute("src",imagetag);
                this.insertNodeAtSelection(midas.contentWindow, img);
                this.placeCaret(midas, img.nextSibling);
            }
            */
            var theImageToInsert = performancingUI.openImageUpload();
            if(theImageToInsert != false){
                var img = midas.contentWindow.document.createElement("img");
                    img.setAttribute("src",theImageToInsert);
                    this.insertNodeAtSelection(midas.contentWindow, img);
                    this.placeCaret(midas, img.nextSibling);
            }
        }
}

performancingMidas.insertNodeAtSelection = function(win, insertNode, type) {//type = before, after null
    // get current selection
    var sel = win.getSelection();
    //alert("sel: "+ sel + " sel.getRangeAt(0): " + sel.getRangeAt(0));

    // get the first range of the selection
    // (there's almost always only one range)
    var range = sel.getRangeAt(0);

    // deselect everything
    sel.removeAllRanges();

    // remove content of current selection from document
    //var clone = null;
    if(type == null){
        range.deleteContents();
    }

    // get location of current selection
    var container = range.startContainer;
    var pos = range.startOffset;
    if(type == "after"){
        container = range.endContainer;
        pos = range.endOffset;
    }

    // make a new range for the new selection
    range=document.createRange();

    if (container.nodeType==3 && insertNode.nodeType==3) {
        // if we insert text in a textnode, do optimized insertion
        container.insertData(pos, insertNode.nodeValue);

        // put cursor after inserted text
        range.setEnd(container, pos+insertNode.length);
        range.setStart(container, pos+insertNode.length);
    } else {
        var afterNode;
        if (container.nodeType==3) {
            // when inserting into a textnode
            // we create 2 new textnodes
            // and put the insertNode in between
            var textNode = container;
            container = textNode.parentNode;
            var text = textNode.nodeValue;

            // text before the split
            var textBefore = text.substr(0,pos);
            // text after the split
            var textAfter = text.substr(pos);

            var beforeNode = document.createTextNode(textBefore);
            var afterNode = document.createTextNode(textAfter);

            // insert the 3 new nodes before the old one
            container.insertBefore(afterNode, textNode);
            container.insertBefore(insertNode, afterNode);
            container.insertBefore(beforeNode, insertNode);

            // remove the old node
            container.removeChild(textNode);
        } else {
            // else simply insert the node
            afterNode = container.childNodes[pos];
            container.insertBefore(insertNode, afterNode);
        }
        range.setEnd(afterNode, 0);
        range.setStart(afterNode, 0);
    }

    sel.addRange(range);
}



//Places the caret inside and at the beginning of the node specified
performancingMidas.placeCaret = function(win, node) {
    var sel = win.contentWindow.getSelection();
    var range = sel.getRangeAt(0);
    sel.removeAllRanges();
    range=document.createRange();
    range.setEnd(node, 0);
    range.setStart(node, 0);
    sel.addRange(range);
    win.contentWindow.focus();
}

//
performancingMidas.placeCaretLite = function(win) {
    var sel = win.contentWindow.getSelection();
    var range = sel.getRangeAt(0);
    sel.removeAllRanges();
    range=document.createRange();
    sel.addRange(range);
    win.contentWindow.focus();
}

//For generic XHTML compliance
performancingMidas.getXHTML = function(text) {
    //Fix closing tags on single elements
    text = text.replace(/<(br|hr|img)([^>]*)([^\/])>/gi, "<$1$2$3 />");
    //Remove extra space in case it was formatted as <br > - not a big deal
    text = text.replace(/<(br|hr|img)([^>]*)  \/>/gi, "<$1$2 />");
    //Add space if it is <br style=""/> at this point
    text = text.replace(/<(br|hr|img)([^>]*)"\/>/gi, "<$1$2\" />");
    //Make sure br is closed
    text = text.replace(/<br>/gi, "<br />");
    return text;
}


// Source -> Normal (note: DOM is NOT compliant at this point)
// 1) The value of the Source tab's textbox is stored in a variable and modified using RegExp's to make it DOM compliant and any other formating that should be done at this time.
// 2) The innerHTML of the Preview tab's frame is replaced with the value from the variable.
// 3) Any DOM modifications that are needed for the Normal tab are made to the Preview tab's frame.
// 4) The innerHTML of the Normal tab's editor is replaced with the innerHTML from the Preview tab's frame.
// (note: Preview handles adding the subject and just about everything else is taken from the Normal tab
performancingMidas.syncNormalTab = function() {
    //***Begin RegExp phase***
    var text = document.getElementById("performancing-message-source").value;

    if (this.dontautoformat.toString() != "true") {
        //When leaving source view we only use the DS specific classes for br's when "Don't auto-format" is NOT checked.
        text = text.replace(/(\r)?\n/gi, "<br/>");
        text = text.replace(/<br( \/)?>/gi, "<br/>");
    }


    //For generic XHTML compliance whether the user wants them or not?
    text = this.getXHTML(text);

    //***End RegExp phase***
    try{
        //***Begin DOM phase***
        var winNormal = document.getElementById("performancing-message");
        var winPreview = document.getElementById("performancing-preview-display");
        winPreview.contentWindow.document.body.innerHTML = text;
        var elements = winPreview.contentDocument.getElementsByTagName("*");
    
        //this.cleanup();
        //***End DOM phase***
    
        text = winPreview.contentWindow.document.body.innerHTML;
    
        winNormal.contentWindow.document.body.innerHTML = text;
    }catch(e){
        //Foo
    }
}

// Normal -> Source (note: DOM is compliant at this point)
// 1) The innerHTML in the Preview tab's frame is replaced with the innerHTML from the Normal tab's editor.
// 2) Any DOM modifications that are needed for the Source tab are made to the Preview tab's frame.
// 3) The innerHTML of the Preview tab's frame is then stored in a variable and further modified using RegExp's.
// 4) The value of the Source tab's textbox is then replaced with the contents of the variable.
performancingMidas.syncSourceTab = function() {

    //***Begin DOM phase***
    var winNormal = document.getElementById("performancing-message");
    var winPreview = document.getElementById("performancing-preview-display");
    try{
        winPreview.contentWindow.document.body.innerHTML =	winNormal.contentWindow.document.body.innerHTML;
        //this.cleanup();
    
        var text = winPreview.contentWindow.document.body.innerHTML;
        //***End DOM phase***
        //***Begin RegExp phase***
        //replace 0 or 1 newline followed by a br followed by 0 or 1 newline with a formatted br
        text = text.replace(/<br([^>]*)>[\r\f]?\n/gi, "<br$1 />");
        text = text.replace(/[\r\f]\n? ?/gi, " ");
        text = text.replace(/\n ?/gi, " ");
    
        //remove all br's at the end of the string. The editor usually adds at least one.
        text = text.replace(/<br( \/)?>$/gi, "");
    
        if (this.dontautoformat.toString() != "true") {
            //Replace any new br's entered in the message tab with newlines
            text = text.replace(/<br( \/)?>/gi,"\n");
        }
    
    
        //For generic XHTML compliance whether the user wants them or not?
        text = this.getXHTML(text);
    
        //***End RegExp phase***
    
        document.getElementById("performancing-message-source").value = text;
    }catch(e){}
}

performancingMidas.viewTab = function(tabname) {
    // To move between textbox and iframe. The 'this.sourceview' thing is to stop it blanking the post if you click
    // the same tab that you're already on. (ie. if you're in source view and click the 'source' tab)
    var theClickedID = tabname.id;
    
    var tabbox = document.getElementById("performancing-editor-tabbox");
    
    var theTabList = ["tab-normal-edit","tab-source-edit","tab-preview-edit"];
    for(var i=0; i < theTabList.length; i++){
        if(theTabList[i] != theClickedID){
            document.getElementById(theTabList[i]).setAttribute("isselected","false");
        }
    }
    
    switch(theClickedID){
        case "tab-normal-edit":
            performancingUI.theSpellcheck = performancingUI.richSpellCheck;
            tabbox.selectedIndex = 0;
            tabname.setAttribute("isselected","true");
            gPerformancingUtil.prefs.setCharPref('display.state.lastviewopened', theClickedID);
            break;
            
        case "tab-source-edit":
            performancingUI.theSpellcheck = performancingUI.sourceSpellCheck;
            tabbox.selectedIndex = 1;
            tabname.setAttribute("isselected","true");
            gPerformancingUtil.prefs.setCharPref('display.state.lastviewopened', theClickedID);
            break;
            
        case "tab-preview-edit":
            tabbox.selectedIndex = 2;
            tabname.setAttribute("isselected","true");
            break;
            
    }
    
    var selectedTab = tabbox.selectedIndex;
    
    
    //if (selectedTab == 0 && this.sourceview) {
    if (selectedTab == 0 && gPerFormancingSelectedTab != 0) {
        this.syncNormalTab();
//This is still buggy
//		placeCaret(document.getElementById("message"), document.getElementById("message").contentWindow.document.body.lastChild);
        document.getElementById("performancing-message").contentWindow.focus();
        this.sourceview = false;
        gPerFormancingSelectedTab = 0;
    //} else if (selectedTab == 1 && !this.sourceview) {
    } else if (selectedTab == 1	 && gPerFormancingSelectedTab != 1) {
        this.syncSourceTab();
        document.getElementById("performancing-message-source").setSelectionRange(document.getElementById("performancing-message-source").textLength, document.getElementById("performancing-message-source").textLength);
        document.getElementById("performancing-message-source").focus();
        this.sourceview = true;
        gPerFormancingSelectedTab = 1;
    } else if (selectedTab == 2	 && gPerFormancingSelectedTab != 2) {
        if (this.sourceview == true) {
            this.syncNormalTab();
        } else {
            this.syncSourceTab();
        }
        this.previewPost();
        gPerFormancingSelectedTab = 2;
    }else{
        //alert('Error, no tab selected');
    }
}

// Say welcome back to the Preview function
performancingMidas.previewPost = function() {
    var winNormal = document.getElementById("performancing-message");
    var winPreview = document.getElementById("performancing-preview-display");
    //Always use Normal tab for this since it is almost completely formatted for this already... yes, it is read twice when coming from the source tab
    var copiedToPreview = winNormal.contentWindow.document.body.innerHTML + "\n"; //to avoid removing the last line which might not end in a newline?
    var subjectPreview = document.getElementById("performancing-editor-subject").value;
    
    if (subjectPreview) {
        copiedToPreview = "<strong>"+ subjectPreview + ":</strong><br><br>" + copiedToPreview;
    }
    winPreview.contentDocument.body.innerHTML = copiedToPreview;
}


performancingMidas.toggleSidebar = function(forceOpen) {
    var performancingSidebarElement = document.getElementById("performancing-sidebar-outer");
    var performancingSidebarButton = document.getElementById("performancing-sidebarbutton");
    
    var isCollapsed = performancingSidebarElement.getAttribute('collapsed');
    if(isCollapsed == 'true' || forceOpen){
        performancingSidebarElement.setAttribute('collapsed', false);
        performancingSidebarButton.setAttribute('state', 'open');
        var localeString = performancingUI.getLocaleString('closesidebar', []);
        performancingSidebarButton.setAttribute('tooltiptext', localeString);
    }else{
        performancingSidebarElement.setAttribute('collapsed', true);
        performancingSidebarButton.setAttribute('state', 'closed');
        var localeString = performancingUI.getLocaleString('opensidebar', []);
        performancingSidebarButton.setAttribute('tooltiptext', localeString);
    }
}

//Handle preview link clicks
performancingMidas.previewClick = function(event) {
    var linkString;
    var isLink = false;
    try{
      //The parentNode is just incase we have an image or other object wrapped around a mailto link.
      linkString = event.originalTarget.parentNode.getAttribute('href').toString();
      isLink = true;
    }catch (e) {
      linkString = "Null";
    }
    
    try{
      linkString = event.originalTarget.getAttribute('href').toString();
      isLink = true;
    }catch (e) {
      //Foobar
    }
    if(isLink == true){
        event.preventDefault();
        performancingUI.openInTab(linkString);
    }
}

//Used for Tag insertion in Source Editor
performancingTextEdit.insertCode = function(myCommand, codeType, mycustomstring) {
    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
    if (!clip){
      return false;
    }
    
    
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    if (!trans){
      return false;
    }
    
      trans.addDataFlavor("text/unicode");
      clip.getData(trans,clip.kGlobalClipboard);

    
    var str = null;
    var str_clipboard=new Object();
    var strLength=new Object();
    try{
      trans.getTransferData("text/unicode",str_clipboard,strLength);
  
  
      if (str_clipboard){
        str_clipboard=str_clipboard.value.QueryInterface(Components.interfaces.nsISupportsString);
      }
      if (str_clipboard){
        pastetext=str_clipboard.data.substring(0,strLength.value / 2);
      }
    }catch (e){
      //alert("No text in the clipboard, please copy something first.");
    }
    
    //var theBox = document.commandDispatcher.focusedElement;
    var theBox = document.getElementById("performancing-message-source");
    var oPosition = theBox.scrollTop;
    var oHeight = theBox.scrollHeight;
    
    
    //Get Selected text (if selected)
      var startPos = theBox.selectionStart;
      var endPos = theBox.selectionEnd;
      str = theBox.value.substring(startPos, endPos);
      //alert("Str: " +str);
 
    //if(codeType == "bbcode"){
    if( gPerformancingUtil.prefs.getBoolPref('settings.usecss') ){
        performancingTextEdit.insertAtCursorSetup(myCommand, str_clipboard, str, theBox, mycustomstring);
    }else{
        performancingTextEdit.insertHTMLAtCursorSetup(myCommand, str_clipboard, str, theBox, mycustomstring);
    }
    
    var nHeight = theBox.scrollHeight - oHeight;
    theBox.scrollTop = oPosition + nHeight;
    
    return true;
}

//CSS!
performancingTextEdit.insertAtCursorSetup = function(myCommand, str_clipboard, str, theBox) {
    var bold = "<strong>";
    var boldend="<\/strong>";
    var color = "<span style=\"color: ";
    var color2 = "\">";
    var colorend = "<\/span>";
    var colorend2 = "</span>";
    var select_flag = (str != "");
    switch (myCommand){
        
      case "img":
        /*
        var imagetag = prompt("Please enter a Image URL:", "http://");
        if (imagetag != "http://" && imagetag != null) {
            performancingTextEdit.insertAtCursor("<img src=\"" + imagetag + "\"/>");
        }
        */
        var theImageToInsert = performancingUI.openImageUpload();
        if(theImageToInsert != false){
            performancingTextEdit.insertAtCursor("<img src=\"" + theImageToInsert + "\"/>");
        }
        
        break;
        
      case "url2":
        performancingTextEdit.insertAtCursorEx("<a href=\"\">" + str,"</a>",select_flag);
        break;
        
      case "url":
        var localeString = performancingUI.getLocaleString('midaseenterurl', []);
        var myUrl = prompt(localeString, "http://");
        if (myUrl != null && myUrl != "http://") {
            performancingTextEdit.insertAtCursorEx("<a href=\"" + myUrl + "\">" + str,"</a>",select_flag);
        }
        break;
        
      case "bold":
        performancingTextEdit.insertAtCursorEx("<span style=\"font-weight: bold;\">" + str,"</span>",select_flag);
        break;
        
      case "italic":
        performancingTextEdit.insertAtCursorEx("<span style=\"font-style: italic;\">" + str,"</span>",select_flag);
        break;
        
      case "underline":
        performancingTextEdit.insertAtCursorEx("<span style=\"text-decoration: underline;\">" + str,"</span>",select_flag);
        break;
      
      case "strikethrough":
        performancingTextEdit.insertAtCursorEx("<span style=\"text-decoration: line-through;\">" + str,"</span>",select_flag);
        break;
        
      case "strong":
        performancingTextEdit.insertAtCursorEx("<strong>" + str,"</strong>",select_flag);
        break;
        
      case "em":
        performancingTextEdit.insertAtCursorEx("<em>" + str,"</em>",select_flag);
        break;
        
      case "blockquote":
        performancingTextEdit.insertAtCursorEx("<blockquote>" + str,"</blockquote>",select_flag);
        break;
        
      case "increasefontsize":
        performancingTextEdit.insertAtCursorEx("<big>" + str,"</big>",select_flag);
        break;
        
      case "decreasefontsize":
        performancingTextEdit.insertAtCursorEx("<small>" + str,"</small>",select_flag);
        break;
        
      case "justifyleft":
        performancingTextEdit.insertAtCursorEx("<div style=\"text-align: left;\">" + str,"</div>",select_flag);
        break;
        
      case "justifycenter":
        performancingTextEdit.insertAtCursorEx("<div style=\"text-align: center;\">" + str,"</div>",select_flag);
        break;
        
      case "justifyright":
        performancingTextEdit.insertAtCursorEx("<div style=\"text-align: right;\">" + str,"</div>",select_flag);
        break;
        
      case "justifyfull":
        performancingTextEdit.insertAtCursorEx("<div style=\"text-align: justify;\">" + str,"</div>",select_flag);
        break;
        
      case "insertorderedlist":
        var eachLineArray = str.split("\n");
        var newLineString = "";
        for(i=0; i< eachLineArray.length; i++){
          if(newLineString == ""){
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }else{
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }
        }
        performancingTextEdit.insertAtCursor("<ol>"	 + newLineString + "</ol>");
        break;
        
      case "insertunorderedlist":
        var eachLineArray = str.split("\n");
        var newLineString = "";
        for(i=0; i< eachLineArray.length; i++){
          if(newLineString == ""){
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }else{
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }
        }
        performancingTextEdit.insertAtCursor("<ul>"	 + newLineString + "</ul>");
        break;
        
      case "forecolor2":
        
        var re = [];
        var mycolor = ["#000"];
        var localeString = performancingUI.getLocaleString('midascolor', []);
        window.openDialog("chrome://performancing/content/color.xul", localeString,"chrome,modal,centerscreen",re,mycolor);
        if(re[0]){
          performancingTextEdit.insertAtCursorEx("<span style=\"color: " + mycolor[0] + "\">" + str,"</span>",select_flag);
          //myColor = mycolor[0];
        }
        break;
        
      case "forecolor":
        if(gPerFormancingColorPick == false){
            gPerFormancingColorPick = true;
            var mycolor = document.getElementById("performance-color-picker").color;
            document.getElementById("performancing-message-source").focus();
            performancingTextEdit.insertAtCursorEx("<span style=\"color: " + mycolor + "\">" + str,"</span>",select_flag);
        }
        window.setTimeout(performancingTextEdit.setColorPicker, 2000, true);
        break;

        
      default :
        var localeString = performancingUI.getLocaleString('notimplementederror', []);
        alert(localeString);
    }
}

//HTML!
performancingTextEdit.insertHTMLAtCursorSetup = function(myCommand, str_clipboard, str, theBox) {
    var bold = "<strong>";
    var boldend="<\/strong>";
    var color = "<font color=\"";
    var color2 = "\">";
    var colorend = "<\/font>";
    var colorend2 = "</span>";
    var select_flag = (str != "");
    switch (myCommand){
        
      case "img":
      /*
        var imagetag = prompt("Please enter a Image URL:", "http://");
        if (imagetag != "http://" && imagetag != null) {
            performancingTextEdit.insertAtCursor("<img src=\"" + imagetag + "\"/>");
        }
        */
        var theImageToInsert = performancingUI.openImageUpload();
        if(theImageToInsert != false){
            performancingTextEdit.insertAtCursor("<img src=\"" + theImageToInsert + "\"/>");
        }
        break;
        
      case "url2":
        performancingTextEdit.insertAtCursorEx("<a href=\"\">" + str,"</a>",select_flag);
        break;
        
      case "url":
        var localeString = performancingUI.getLocaleString('midaseenterurl', []);
        var myUrl = prompt(localeString, "http://");
        if (myUrl != null && myUrl != "http://") {
            performancingTextEdit.insertAtCursorEx("<a href=\"" + myUrl + "\">" + str,"</a>",select_flag);
        }
        break;
        
      case "bold":
        performancingTextEdit.insertAtCursorEx("<b>" + str,"</b>",select_flag);
        break;
        
      case "italic":
        performancingTextEdit.insertAtCursorEx("<i>" + str,"</i>",select_flag);
        break;
        
      case "underline":
        performancingTextEdit.insertAtCursorEx("<u>" + str,"</u>",select_flag);
        break;
      
      case "strikethrough":
        performancingTextEdit.insertAtCursorEx("<strike>" + str,"</strike>",select_flag);
        break;
        
      case "blockquote":
        performancingTextEdit.insertAtCursorEx("<blockquote>" + str,"</blockquote>",select_flag);
        break;
        
      case "strong":
        performancingTextEdit.insertAtCursorEx("<strong>" + str,"</strong>",select_flag);
        break;
        
      case "em":
        performancingTextEdit.insertAtCursorEx("<em>" + str,"</em>",select_flag);
        break;
        
      case "increasefontsize":
        performancingTextEdit.insertAtCursorEx("<big>" + str,"</big>",select_flag);
        break;
        
      case "decreasefontsize":
        performancingTextEdit.insertAtCursorEx("<small>" + str,"</small>",select_flag);
        break;
        
      case "justifyleft":
        performancingTextEdit.insertAtCursorEx("<div align=\"left\">" + str,"</div>",select_flag);
        break;
        
      case "justifycenter"://<div align="left">
        performancingTextEdit.insertAtCursorEx("<div align=\"center\">" + str,"</div>",select_flag);
        break;
        
      case "justifyright":
        performancingTextEdit.insertAtCursorEx("<div align=\"right\">" + str,"</div>",select_flag);
        break;
        
      case "justifyfull":
        performancingTextEdit.insertAtCursorEx("<div align=\"justify\">" + str,"</div>",select_flag);
        break;
        
      case "insertorderedlist":
        var eachLineArray = str.split("\n");
        var newLineString = "";
        for(i=0; i< eachLineArray.length; i++){
          if(newLineString == ""){
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }else{
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }
        }
        performancingTextEdit.insertAtCursor("<ol>"	 + newLineString + "</ol>");
        break;
        
      case "insertunorderedlist":
        var eachLineArray = str.split("\n");
        var newLineString = "";
        for(i=0; i< eachLineArray.length; i++){
          if(newLineString == ""){
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }else{
            newLineString = newLineString +"<li>" + eachLineArray[i] + "</li>";
          }
        }
        performancingTextEdit.insertAtCursor("<ul>"	 + newLineString + "</ul>");
        break;
        
      case "forecolor2":
        
        var re = [];
        var mycolor = ["#000"];
        window.openDialog("chrome://performancing/content/color.xul", "PerFormancing Color","chrome,modal,centerscreen",re,mycolor);
        if(re[0]){
          performancingTextEdit.insertAtCursorEx("<font color=\"" + mycolor[0] + "\">" + str,"</font>",select_flag);
          //myColor = mycolor[0];
        }
        break;
        
      case "forecolor":
        if(gPerFormancingColorPick == false){
            gPerFormancingColorPick = true;
            var mycolor = document.getElementById("performance-color-picker").color;
            document.getElementById("performancing-message-source").focus();
            performancingTextEdit.insertAtCursorEx("<font color=\"" + mycolor + "\">" + str,"</font>",select_flag);
        }
        window.setTimeout(performancingTextEdit.setColorPicker, 2000, true);
        break;

        
      default : 
        var localeString = performancingUI.getLocaleString('notimplementederror', []);
        alert(localeString);
    }
}

performancingTextEdit.setColorPicker = function() {
    gPerFormancingColorPick = false;
}

performancingTextEdit.insertAtCursor = function( aText) {
    try {
      var command = "cmd_insertText";
      var controller = document.commandDispatcher.getControllerForCommand(command);
      if (controller && controller.isCommandEnabled(command)) {
        controller = controller.QueryInterface(Components.interfaces.nsICommandController);
        var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        params = params.createInstance(Components.interfaces.nsICommandParams);
        params.setStringValue("state_data", aText);
        controller.doCommandWithParams(command, params);
      }
    }catch (e) {
      //alert("Can't do cmd_insertText! ");
      //dump(e+"\n")
    }
}

performancingTextEdit.insertAtCursorEx = function(aText, bText, selection) {
      this.insertAtCursor(aText+bText);
      if ( selection ) {
          //this.reselectCursor(aText+bText);
      } else {
          this.backupCursor(bText);
      }	 
}

//Original Function by Asquella, modified by Patrick Wildenborg
performancingTextEdit.backupCursor = function(aText) {
    try {
      var command = "cmd_charPrevious";
      var controller = document.commandDispatcher.getControllerForCommand(command);
      if (controller && controller.isCommandEnabled(command)) {
        controller = controller.QueryInterface(Components.interfaces.nsICommandController);
        var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        params = params.createInstance(Components.interfaces.nsICommandParams);
        var len = aText.length
        while( len-- > 0 ) {
            controller.doCommand(command, params);
        }
      }
    }catch (e) {
      //dump("Can't do cmd_insertText! ");
      //dump(e+"\n")
    }
}

performancingTextEdit.moveCursorForward = function(aText) {
    try {
      var command = "cmd_charNext";
      var controller = document.commandDispatcher.getControllerForCommand(command);
      if (controller && controller.isCommandEnabled(command)) {
        controller = controller.QueryInterface(Components.interfaces.nsICommandController);
        var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        params = params.createInstance(Components.interfaces.nsICommandParams);
        var len = aText.length
        while( len-- > 0 ) {
            controller.doCommand(command, params);
        }
      }
    }catch (e) {
      //dump("Can't do cmd_insertText! ");
      //dump(e+"\n")
    }
}

//Original Function by Asquella, modified by Patrick Wildenborg
//Bug: If there is a line wrap in the text box, we are 1 char off on the selection.
// Not sure how to check that boundery condition.
performancingTextEdit.reselectCursor = function(aText) {
    try {
      var command = "cmd_selectCharPrevious";
      var controller = document.commandDispatcher.getControllerForCommand(command);
      if (controller && controller.isCommandEnabled(command)) {
        controller = controller.QueryInterface(Components.interfaces.nsICommandController);
        var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        params = params.createInstance(Components.interfaces.nsICommandParams);
        var len = aText.length
        while( len-- > 0 ) {
            controller.doCommand(command, params);
        }
      }
    }catch (e) {
      //dump("Can't do cmd_insertText! ");
      //dump(e+"\n")
    }
}

// Not currently used (for old prototype)
performancingTextEdit.switchStyles = function(aNum) {
    var ourStyleBox = document.getElementById("performancing-main-hbox");
    var ourStyleVBox = document.getElementById("performancing-main-vbox");
    var ourWindow = document.getElementById("transpTest");
    
    switch (aNum){
        
      case "1":
        ourStyleBox.setAttribute('style', "background-image: url('chrome://performancing/skin/bg-temp.png'); background-repeat: repeat-x; ");
        ourStyleVBox.setAttribute('style', "padding: 15px;");
        ourWindow.setAttribute('style', "background-color: none; border: 0;");
        break;
        
      case "2":
        ourStyleBox.setAttribute('style', "background-image: url('chrome://performancing/skin/ffextmockup_3.png'); background-repeat: repeat-x; ");
        ourStyleVBox.setAttribute('style', "padding: 50px;");
        ourWindow.setAttribute('style', "background-color: white; border: 0;");
        break;
        
      case "3":
        ourStyleBox.setAttribute('style', "background-image: url('chrome://performancing/skin/bg-temp3.png'); background-repeat: repeat-x; ");
        ourStyleVBox.setAttribute('style', "padding: 15px;");
        ourWindow.setAttribute('style', "background-color: none; border: 0;");
        break;
        
      case "4":
        ourStyleBox.setAttribute('style', "");
        ourStyleVBox.setAttribute('style', "padding: 15px;");
        ourWindow.setAttribute('style', "background-color: none; border: 0;");
        break;
        
      case "5":
        ourStyleBox.setAttribute('style', "background-image: url('chrome://performancing/skin/ffextmockup_3.png'); background-repeat: repeat-x; ");
        ourStyleVBox.setAttribute('style', "padding: 50px;");
        ourWindow.setAttribute('style', "background-color: transparent; border: 0;");
        break;
        
      default:
        var localeString = performancingUI.getLocaleString('styledoesnotexist', []);
        alert(localeString);
        break;
    }
}
