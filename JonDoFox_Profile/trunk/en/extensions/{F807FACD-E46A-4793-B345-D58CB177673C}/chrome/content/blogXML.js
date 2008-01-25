/*
Blog XML Javascript
--------------------------------
A poor attempt to keep all blog XML manipulation code here
*/
const bloglistxmlfile = "performancing-bloglist.xml";

//For testing only
//var gBlogObject = null;
//var gTempBlogObject = new Object();

performancingUtil.prototype.deleteBlogEntry = function(theListObject){
	var blogGroup = document.getElementById("blog-group");
	
	if (blogGroup.selectedItem) {
		var theGUID = blogGroup.selectedItem.getAttribute('blogGUID');
		var writeConfirmed = performancingUtil.prototype.removeBlogEntryFromXML(theGUID);

		if(!writeConfirmed){
			var errorMessage = performancingUI.getLocaleString('errordeletingblog', []);
			// Error deleting the selected Blog entry\n Please try again.
			alert(errorMessage);
		}
		else {
			//Reload the file - in the future, only remove the item form the listbox
			performancingUI.init();
		}
	}
	else {
            var alertMessage = performancingUI.getLocaleString('mustselectblog', []);
            alert(alertMessage);
	}
}

performancingUtil.prototype.removeBlogEntryFromXML = function(theGUID){
    try{
        var file = gPerformancingUtil.getXMLFile();
        var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theBlogXML = new XML(theXMLString);
        //dump("The Read XML: " + theBlogXML..GUID + '\n' + "GUID to Delete:" + theGUID + '\n')
        //delete dude..blog.(GUID == theGUID);
        var entryIndex = theBlogXML.blogs.blog.(GUID == theGUID ).childIndex();
        delete theBlogXML.blogs.blog[entryIndex];
        //Now save the file
        var newWrite = PerFormancingFileIO.write(file, theBlogXML.toString(), "w", "UTF-8");
        if(!newWrite) {
            var errorMessage = performancingUI.getLocaleString('cannotwritetofile', []);
            //Can not write to file, you may not have the correct permissions
            alert(errorMessage);
            return false;
        }
        try{
            gPerformancingUtil.prefs.setCharPref("settings.lastselected.blog", theBlogXML..blog.GUID[0]);
        }catch(e){
        }
        
        return true;
    }catch(e){
        //dump('Delete Error: ' + e + '\n');
        return false;
    }
}


performancingUtil.prototype.getArrOfCatChecked = function(checkListIDname, isMT){
    var checkList = document.getElementById(checkListIDname);
    var tempArray = [];
    if(isMT){
        for(i=0; i < checkList.childNodes.length; i++ ){
            try{
                if(checkList.childNodes[i].checked){
                    //var myResponse = myServiceObject.setPostCategories('123', [{'dude' : 'dude2'}, {'dude3' : 'dude4'} ]);
                    var tempStruct = {'categoryId' : checkList.childNodes[i].getAttribute('cat') };
                    //dump("\n CategoryId: " + checkList.childNodes[i].getAttribute('cat') + "\n" )
                    tempArray.push(tempStruct);
                    //dump("\n tempArray: " + tempArray + "\n");
                }
            }catch(e){
                //foo
            }
        }
    }else{
        for(i=0; i < checkList.childNodes.length; i++ ){
            try{
                if(checkList.childNodes[i].checked){
                    //var myResponse = myServiceObject.setPostCategories('123', [{'dude' : 'dude2'}, {'dude3' : 'dude4'} ]);
                    var tempString = checkList.childNodes[i].label;
                    //dump("\n CategoryId: " + checkList.childNodes[i].getAttribute('cat') + "\n" )
                    tempArray.push(tempString);
                    //dump("\n tempArray: " + tempArray + "\n");
                }
            }catch(e){
                //foo
            }
        }
    }
    //alert("tempStruct.categoryId: " + tempStruct.categoryId);
    return tempArray;
}


// #### API GETTERS #### 

performancingUtil.prototype.getCategoryList = function(theGUID){
    //dump("Get Category List if you can\n");
    var theBlogXML = gPerformancingUtil.serviceObjectXML;
    //
    var myServiceObject = gPerformancingUtil.serviceObject;
    var myResponse = myServiceObject.getCategoryList();
    var localeString2 = performancingUI.getLocaleString('notavailable', []);
    if(myResponse){
        //dump("Get Cetegory Response ###########:\n" + myResponse + "\n");
        gPerformancingUtil.clearCheckListOut('blog-sidebar-listing-categories');
        var localeString = performancingUI.getLocaleString('fetchingcategories', []);
        //Fetching Categories..
        gPerformancingUtil.addItemToCheckList([localeString], 0, 'blog-sidebar-listing-categories', null, localeString2, "", 'label' );
        performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'categorycall', "", "", performancing_xmlcall.processData);
    }else{
        //Disable the category section
        //dump("Category Response Error: ###########:\n" + myResponse + "\n");
        gPerformancingUtil.clearCheckListOut('blog-sidebar-listing-categories');
        var localeString = performancingUI.getLocaleString('nocategoriesavailable', []);
        //No Categories Available
        gPerformancingUtil.addItemToCheckList([localeString], 0, 'blog-sidebar-listing-categories', null, localeString2, "", 'label' );
    }
}

performancingUtil.prototype.getBlogPages = function (theGUID) {
	var theBlogXML = gPerformancingUtil.serviceObjectXML;
	var myServiceObject = gPerformancingUtil.serviceObject;

	// Set number of history pages to get.
	var numOfPosts = 10; 
	
	try { numOfPosts = gPerformancingUtil.prefs.getIntPref("display.history.numbertoshow"); } catch(e) { numOfPosts = 10; }

	var myResponse = myServiceObject.getPages();
	performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'pagescall', null, theGUID, performancing_xmlcall.processData);
	
	var localeString = performancingUI.getLocaleString('notavailable', []);
	
	if (theBlogXML..blogtype == "wordpress_cust") {
		gPerformancingUtil.clearListOut('performancing-pages-list');
		
		if (myResponse) {
			var localeString2 = performancingUI.getLocaleString('loading', []);
			gPerformancingUtil.addItemToList([localeString2], 0, 'performancing-pages-list', null, localeString, "");
		} else {
			gPerformancingUtil.addItemToList([localeString], 0, 'performancing-pages-list', null, localeString, "");
		}
	}
	else {
		gPerformancingUtil.clearListOut('performancing-pages-list');
		gPerformancingUtil.addItemToList([localeString], 0, 'performancing-pages-list', null, localeString, "");
	}
};

performancingUtil.prototype.getBlogHistory = function(theGUID){
    //dump("Get Blog history if you can\n");
    var theBlogXML = gPerformancingUtil.serviceObjectXML;
    var myServiceObject = gPerformancingUtil.serviceObject;
    
    //Set number of history posts to get.
    var numOfPosts = 10; 
    try{
        numOfPosts = gPerformancingUtil.prefs.getIntPref("display.history.numbertoshow");
    }catch(e){
        numOfPosts = 10;
    }
    
	var myResponse = myServiceObject.getRecentPosts(numOfPosts);
    //first 3 are for legacy support (v1.0)
    if( !(theBlogXML..blogtype == "blogger_com") || !(theBlogXML..blogtype == "livejournal_atom_com") || !(theBlogXML..blogtype == "atom_cust") || !(theBlogXML..blogtype == "s_atom")	|| !(theBlogXML..blogtype == "atom") || !(theBlogXML..blogtype == "atom_blogger")   ){
        var localeString = performancingUI.getLocaleString('notavailable', []);
        if(myResponse){
            //dump("Get History Response ###########:\n" + myResponse + "\n");
            var localeString2 = performancingUI.getLocaleString('loading', []);
            gPerformancingUtil.clearListOut('performancing-history-list');
            gPerformancingUtil.addItemToList([localeString2], 0, 'performancing-history-list', null, localeString, "" );
            performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'historycall', null, theGUID, performancing_xmlcall.processData);
        }else{
            //dump("History Response Error ###########:\n" + myResponse + "\n");
            gPerformancingUtil.clearListOut('performancing-history-list');
            //dataArray, number, listIDname, theGUID, theURL, onItemClick, aDate, aPostId
            gPerformancingUtil.addItemToList([localeString], 0, 'performancing-history-list', null, localeString, "" );
        }
    }else{
        
    }
}

// #### API SETTERS

//gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
performancingUtil.prototype.postCurrentItem = function(){
    //dump("Post Current Item if you can\n");
    var theGUID = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
    if(gSelectedBlog != null && gSelectedBlog != 'null'){
        var theBlogXML = gPerformancingUtil.serviceObjectXML;
        
        var myServiceObject = gPerformancingUtil.serviceObject;
        //figure out which HTML to grab (source or rich)
        var tabbox = document.getElementById("performancing-editor-tabbox");
        
        //Insert Technorati tags automatically?
        //performancingUI.insertTechnorati()
        if( gPerformancingUtil.prefs.getBoolPref('extra.inserttechnorati') ){
            performancingUI.insertTechnorati();
        }
        //Insert Powered by Performancing
        if( gPerformancingUtil.prefs.getBoolPref('extra.insertpfftext2')){
            performancingUI.insertPoweredByPFF();
        }
        
        var theContent = null;
        //dump('Content Tab Selected: ' + tabbox.selectedIndex + '\n');
        if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
            var winNormal = document.getElementById("performancing-message");
            theContent = winNormal.contentWindow.document.body.innerHTML;
        }else if(tabbox.selectedIndex == 1){ //Source
            //If pref, convert chartype
            //gPerformancingUtil.convertFromUnicode
            theContent = document.getElementById("performancing-message-source").value
        }else{
            var localeString = performancingUI.getLocaleString('couldnotfindcontent', []);
            //PerFormancing Error: Could not find content, please contact the author
            alert(localeString);
        }
        if(theContent != null){
            if( performancingUI.checkSubjectEmpty() ){
                var theTitle = document.getElementById("performancing-editor-subject").value;
                //If LiveJournal, add Title
                theContent = performancingMidas.getXHTML(theContent);
                
                if(theBlogXML.blogtype == 'livejournal_com'){
                    theContent = theContent + "<title>" + theTitle + "</title>";
                }
                
                //Send as specified by encoding pref
                var theBlogCharType = gPerformancingUtil.getCharType();
                //theContent = gPerformancingUtil.convertFromUnicode(theContent, theBlogCharType);
                
                var publishThisPost = 1;
                var isDraft = document.getElementById("performancing-draft-checkbox").checked;
                //var useBool =	 gPerformancingUtil.prefs.getBoolPref("publishing.truebool");
                var useBool =  gPerformancingUtil.useBooleanPublish(theBlogXML.blogtype, theBlogXML.useboolean);
                
                if(isDraft){
                    publishThisPost = 'bool0';
                    if(useBool){
                        publishThisPost = false;
                    }
                }else{
                    publishThisPost = 'bool1';
                    if(useBool){
                        publishThisPost = true;
                    }
                }
				
				// If the pages tab is selected, post this as a page.
				if (document.getElementById('performancing-sidebar-vbox').getAttribute("selectedIndex") == "4") {
	                var myResponse = myServiceObject.newPage(theTitle, theContent, null, publishThisPost);
					
	                performancingUI.toggleEnableOnPost();
	                performancingUI.onServerSend();
	                performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'newpagecall', null, "", performancing_xmlcall.processData);
				}
				else {
	                var catArray1 = this.getArrOfCatChecked('blog-sidebar-listing-categories', false);
	                var myResponse = myServiceObject.newPost(theTitle, theContent, catArray1, null, publishThisPost);//Should it be 1?
					
	                performancingUI.toggleEnableOnPost();
	                performancingUI.onServerSend();
	                var catArray = this.getArrOfCatChecked('blog-sidebar-listing-categories', true);
	                performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'newpostcall', catArray, "", performancing_xmlcall.processData);
				}
            }else{
                //dump('Subjet was empty, canceled \n');
            }
        }
    }else{
        var localeString = performancingUI.getLocaleString('pleaseselectablogs', []);
        alert(localeString);
    }
}

performancingUtil.prototype.useBooleanPublish = function(aBlogType, usesBoolean){
    //alert(" theBlogXML.blogtype: " + aBlogType + " usesBoolean: " + usesBoolean.toString() );
    if(usesBoolean.toString() == 'true'){
        return true;
    }else{
        switch (aBlogType.toString()) { //this._fareWatcherState = FAREWATCHER_STATE_ERROR;
                case 'drupal_cust':
                case 'performancing_com':
                    return true;
                    break;
                    
                default:
                    return false;
                    break;
        }
    }
    return false;
}

//TODO, mush this and postCurrentItem together with a flag
performancingUtil.prototype.editCurrentItem = function(){
    //dump("Post Current Item if you can\n");
    var theGUID = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
    var pubButton = document.getElementById("performancing-republish-button");
    var thePostID = pubButton.getAttribute("lastpostid");
    var theDateCreated = pubButton.getAttribute("datecreated");
    if(gSelectedBlog != null && gSelectedBlog != 'null'){
        var theBlogXML = gPerformancingUtil.serviceObjectXML;
        var theBlogType = theBlogXML.blogtype.toString();
        
        //Hard coded, if it's wordpress, leave dateCreated blank
        if(theBlogType == "wordpress_com" || theBlogType == "wordpress_cust" ){
            theDateCreated = "";
        }
        
        var myServiceObject = gPerformancingUtil.serviceObject;
        //figure out which HTML to grab (source or rich)
        var tabbox = document.getElementById("performancing-editor-tabbox");
        var theContent = null;
        //dump('Content Tab Selected: ' + tabbox.selectedIndex + '\n');
        if(tabbox.selectedIndex == 0 || tabbox.selectedIndex == 2){//Rich or preview
            var winNormal = document.getElementById("performancing-message");
            theContent = winNormal.contentWindow.document.body.innerHTML;
        }else if(tabbox.selectedIndex == 1){ //Source
            theContent = document.getElementById("performancing-message-source").value
        }else{
            var localeString = performancingUI.getLocaleString('couldnotfindcontent', []);
            //PerFormancing Error: Could not find content, please contact the author
            alert(localeString);
        }
        if(theContent != null){
            if( performancingUI.checkSubjectEmpty() ){
                var theTitle = document.getElementById("performancing-editor-subject").value;
                //If LiveJournal, add Title
                theContent = performancingMidas.getXHTML(theContent);
                
                if(theBlogXML.blogtype == 'livejournal_com'){
                    theContent = theContent + "<title>" + theTitle + "</title>";
                }
                
                //Send as specified by encoding pref
                var theBlogCharType = gPerformancingUtil.getCharType();
                //theContent = gPerformancingUtil.convertFromUnicode(theContent, theBlogCharType);
                
                var publishThisPost = 1;
                var isDraft = document.getElementById("performancing-draft-checkbox").checked;
                var useBool =  gPerformancingUtil.useBooleanPublish(theBlogXML.blogtype, theBlogXML.useboolean);
                
                if(isDraft){
                    publishThisPost = 'bool0';
                    if(useBool){
                        publishThisPost = false;
                    }
                }else{
                    publishThisPost = 'bool1';
                    if(useBool){
                        publishThisPost = true;
                    }
                }
                var catArray1 = this.getArrOfCatChecked('blog-sidebar-listing-categories', false);
                var myResponse = myServiceObject.editPost(thePostID, theTitle, theContent, catArray1, theDateCreated, publishThisPost);
                //dump("Get New Post Response ###########:\n" + myResponse + "\n");
                performancingUI.toggleEnableOnPost();
                performancingUI.onServerSend();
                var catArray = this.getArrOfCatChecked('blog-sidebar-listing-categories', true);
                performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'editpostcall', catArray, "", performancing_xmlcall.processData);
                
            }else{
                //dump('Subjet was empty, canceled \n');
            }
        }
    }else{
        var localeString = performancingUI.getLocaleString('pleaseselectablogs', []);
        //Please Select a Blog before trying to publish!
        alert(localeString);
    }
}

performancingUtil.prototype.setCategoryList = function(aPostID, catArray){
    //dump("Get Category List if you can\n");
    var theGUID = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
    var theBlogXML = gPerformancingUtil.serviceObjectXML;
    
    var myServiceObject = gPerformancingUtil.serviceObject;
    var myResponse = myServiceObject.setPostCategories(aPostID, catArray);
    //publishPost
    
    if(myResponse){
        //dump("Get Category  SET Response ###########:\n" + myResponse + "\n");
        performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'setcategoriescall', null, null, performancing_xmlcall.processData );
    }else{
        //Disable the cetagory section
        //dump("Category SET Response Error: ###########:\n" + myResponse + "\n");
    }
    //Now publish it! This fixes a typepad category bug
    //gPerformancingUtil.publishThePost(gLastPostID);
}

performancingUtil.prototype.publishThePost = function(aPostID){
    //dump("Publish Post\n");
    var theGUID = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
    var theBlogXML = gPerformancingUtil.serviceObjectXML;
    
    var myServiceObject = gPerformancingUtil.serviceObject;
    var myResponse = myServiceObject.publishPost(aPostID);
    //publishPost
    
    if(myResponse){
        //dump("Publish POST Response ###########:\n" + myResponse + "\n");
        performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'publishPost', null, null, performancing_xmlcall.processData );
    }else{
        //Disable the cetagory section
        //dump("Published Post Response Error: ###########:\n" + myResponse + "\n");
    }
}

performancingUtil.prototype.deleteHistoryItem = function(){
	var confirmText = performancingUI.getLocaleString("deletepostconfirm", []);
	if (confirm(confirmText)){
    //dump("Delete Item if you can\n");
    var theGUID = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
    var theBlogXML = gPerformancingUtil.serviceObjectXML;
    var theListElement = document.getElementById('performancing-history-list');
    var thePostID = theListElement.selectedItem.getAttribute('postid');
    
    try{
        var myServiceObject = gPerformancingUtil.serviceObject;
        var myResponse = myServiceObject.deletePost(thePostID);
        if(myResponse){
            performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'deletehistorycall', null, null, performancing_xmlcall.processData);
            performancingMidas.makeBlank(); //clear out the onte area.
            performancingUI.toggleExtraOptDeck(true);
            //performancingUI.clearTechnoratiTags();
        }else{
            //foo
        }
    }catch(e){
        var localeString = performancingUI.getLocaleString('selectitemtodelete', [e]);
        alert(localeString);
    }
    }
}

performancingUtil.prototype.deletePage = function(){
	if (confirm("Are you sure? This will permanently delete the selected page from your blog.")) {
    var theGUID = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
    var theBlogXML = gPerformancingUtil.serviceObjectXML;
    var theListElement = document.getElementById('performancing-pages-list');
    var thePostID = theListElement.selectedItem.getAttribute('postid');
    
    try{
        var myServiceObject = gPerformancingUtil.serviceObject;
        var myResponse = myServiceObject.deletePage(thePostID);
		
        if(myResponse){
            performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'deletepagecall', null, null, performancing_xmlcall.processData);
            performancingMidas.makeBlank();
            performancingUI.toggleExtraOptDeck(true);
        }
    }catch(e){
        var localeString = performancingUI.getLocaleString('selectitemtodelete', [e]);
        alert(localeString);
    }
    }
}
