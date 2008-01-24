/*
Utility javascript
--------------------------------
A poor attempt to keep all reusable functions here
*/

//Addon Topics
const PERFORMANCING_ADDON_PFFSTART_TOPIC = "performancing-addon-pffstart-topic";
const PERFORMANCING_ADDON_PFFENABLE_TOPIC = "performancing-addon-pffenable-topic";
const PERFORMANCING_ADDON_PFFDISABLE_TOPIC = "performancing-addon-pffdisable-topic";
const PERFORMANCING_ADDON_PFFTABCLICK_TOPIC = "performancing-addon-pfftabclick-topic";

//General Topics
const PERFORMANCING_STATE_CHANGED_TOPIC = "performancing-update-ui-topic"; //Not used (yet)
const PERFORMANCING_STATE_LOADBLOGS = "loadblogs"; //Not used (yet)
const bfPwdPrefix = "performancing:";
function performancingUtil() {
    this._observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    this._observerService.addObserver(this, PERFORMANCING_ADDON_PFFSTART_TOPIC, false);
    this.prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    this.prefs = this.prefsService.getBranch("performancing.");// Get the "firefax." branch
    //Usage: this.prefs.getCharPref("user.default"); getBoolPref, getIntPref
    //       this.prefs.setCharPref("user.default", "User Name"); setBoolPref, setIntPref
    this.currentURL = null;
    this.currentPass = null;
    this.charType = null;
    this.serviceObject = null;
    this.serviceObjectXML = null;
    try{
      this._performancingService  = Components.classes["@performancing.com/performancing/PerformancingService;1"].getService();
      this._performancingService = this._performancingService.QueryInterface(Components.interfaces.nsIPerformancingService);
      this.myJSService = Components.classes["@performancing.com/performancing/PerformancingService;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    }catch (e) {
      alert("Could not load nsIPerformancingService: " + e);
      //return false; 
    }
}


//gPerformancingUtil.onBrowerClose();
performancingUtil.prototype.onPFFWindowClose = function(){
    gPerformancingNotes.doNoteOnUnload();
}

performancingUtil.prototype.init = function(){
    try{
        this._performancingService.init("");
        performancingUI.init();
        loadPerFormancingNotes(); //Keep this one last incase we get errors
        pffAddonSkin.loadLastSkin();//Load the users last UI CSS
        var aTimer = window.setTimeout("gPerformancingUtil.sendAddonInitNotification('"+PERFORMANCING_ADDON_PFFSTART_TOPIC+"','');", 1000, false);
    }catch(e){
        //Will cause error when launched from somewhere else like the account wizard
        //unless you load with true parameter
         alert("Start Up Error: " + e);
    }
}

performancingUtil.prototype.sendAddonInitNotification = function(aTopic, aData){
    //this._performancingService.callAddonInit();
    this._performancingService.callNotification(aTopic, aData)
}



performancingUtil.prototype.observe = function(aSubject, aTopic, aData){
    //if(aTopic == PERFORMANCING_ADDON_PFFSTART_TOPIC){
        //alert('Saw Notification in UTIL');
        //this.reloadBlogs();
    //}
}

performancingUtil.prototype.printLog = function(theServiceMessage){
    this._performancingService.printLog(theServiceMessage);
}

//Only for Wizard *not yet used*
performancingUtil.prototype.processReturnData = function(theObject){
    var isError = true;
    var theClass = "performanceblog";
    
    if(theObject.length == null){
        if(theObject.faultString){
            //dump("\nLogin Error: " + theObject.faultString + "\n")
            isError = true;
        }else{
            //dump('\nError processReturnData #1 : Unknown State\n');
            isError = true;
        }
    }else{
        isError = false;
        //dump("\nLogin Success!\n")
        //dump("Response Length: "+theObject.length + "\n");
        
        //gBlogObject = theObject;
        //dump("Response Length: "+theObject.length + "\n");


        gPerformancingUtil.emptyElement('blog-group-rows');
        var tempArray = [];
        for(j = 0; j < theObject.length; j++){
            tempArray = [theObject[j].blogName, theObject[j].url, theObject[j].url];
            //dataArray, number, listIDname, theGUID, theURL, onItemClick, aDate, aPostId, theClass
                                             //dataArray, number, listIDname, theGUID, theURL, onItemClick, aDate, aPostId, theClass
            gPerformancingUtil.addItemToList(tempArray, j, 'performancing-wizard-blog-list', null, null, null, null, null, theClass );
        }
    }
    
    if(!isError){
        //document.getElementById('performancing-account-wizard').getPageById('login').next = "finish";
        //document.getElementById('performancing-account-wizard').advance("success");
        return true;
    }else{
         //document.getElementById('performancing-account-wizard').getPageById('login').next = "login-error";
         //document.getElementById('performancing-account-wizard').advance("login-error");
         return true;
    }
}

/*
<blog>
    <blogname>{theBlogName}</blogname>
    <blogtype>{theBlogType}</blogtype>
    <appkey>{theAppKey}</appkey>
    <username>{theUserName}</username>
    <apiurl>{theAPIURL}</apiurl>
    <GUID>{theGUID}</GUID>
    <url>{theURL}</url>
    <blogid>{theBlogID}</blogid>
</blog>
*/

//TODO: Make more generic for re-use!!
performancingUtil.prototype.loadXMLFIle = function(){
    var ourDeck = document.getElementById('performancing-account-deck');
    var theClass = "performanceblog";
    var file = gPerformancingUtil.getXMLFile();
    var f2 = PerFormancingFileIO.open(file.path);
    var theXMLString = null;
    if(f2.exists()){
        theXMLString = PerFormancingFileIO.read(file, "UTF-8");
        var theBlogXML = new XML(theXMLString);
        
        //dump("Number of Blogs in File: " +theBlogXML..blog.length() + "\n");
        var numberOfBlogs = theBlogXML..blog.length();
        if(numberOfBlogs > 0){
            ourDeck.setAttribute('selectedIndex','0');
            gPerformancingUtil.emptyElement('blog-group-rows');

            for(var x = 0; x < numberOfBlogs; x++){
		var blog = theBlogXML..blog[x];
		gPerformancingUtil.addBlogToGroup(blog.blogname, blog.url, blog.GUID, blog.datecreated);
            }

            gLastXMLBlogObject = theBlogXML;
            var theBlogUID = null;
            var theBlogURL = null;
            if(numberOfBlogs == 1){
                theBlogUID = theBlogXML..blog[0].GUID;
                theBlogURL = theBlogXML..blog[0].url;
                gPerformancingUtil.prefs.setCharPref("settings.lastselected.blog", theBlogUID );
                performancingUI.setBlogAsSelected(theBlogUID, theBlogURL);
            }else{
                try{
                    theBlogUID = gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog")
                    
                    window.setTimeout("performancingUI.showCurrentBlog('"+theBlogUID+"', null)", 1000, true);
                }catch(e){
                    
                }
            }
        }else{
            ourDeck.setAttribute('selectedIndex','1');
        }
    }else{
        //dump('PerFormancing XML File does not exists!');
        ourDeck.setAttribute('selectedIndex','1');
    }
    
}

//TODO: Make more generic for use with Notes!
performancingUtil.prototype.getXMLFile = function(){
    var file = PerFormancingDirIO.get("ProfD");
    file.append("extensions");
    file.append(bloglistxmlfile);
    var theBlogXML = null;
    
    return file;
}

performancingUtil.prototype.addBlogToGroup = function (name, url, guid, date) {
	var group = document.getElementById("blog-group-rows");
	
	var row = document.createElement("row");
	var r = document.createElement("radio");
	r.setAttribute("id","blog-" + group.getElementsByTagName("radio").length);
	r.setAttribute("blogGUID",guid);
	r.setAttribute("tooltiptext", url);
	r.setAttribute("date", date);
	r.setAttribute("onclick","performancingUI.onBlogSelect(this);");

	var link = document.createElement("label");
	link.setAttribute("value",name);
	link.setAttribute("tooltiptext", url);
	link.setAttribute("onclick","performancingUI.openInTab('" + url + "');");
	link.setAttribute("class","link");

	row.appendChild(r);
	row.appendChild(link);
	group.appendChild(row);
};

performancingUtil.prototype.addItemToList = function(dataArray, number, listIDname, theGUID, theURL, onItemClick, aDate, aPostId, theClass){
    var list = document.getElementById(listIDname);
    var item = document.createElement('listitem');
    item.setAttribute('id', 'blog-' + number);
    item.setAttribute('blogGUID', theGUID);
    item.setAttribute('tooltiptext', theURL);
    item.setAttribute('date', aDate);
    item.setAttribute('postid', aPostId);
    item.setAttribute('onclick', onItemClick);
    item.setAttribute('class', theClass);
    
    for(var i=0; i < dataArray.length; i++){
        var itemCell = document.createElement('listcell');
        itemCell.setAttribute('label', dataArray[i]);
        itemCell.setAttribute('crop', 'right');
        itemCell.setAttribute('class', theClass + '2');
        item.appendChild(itemCell);
    }
    //Append the elements
    list.appendChild(item);
    //sizeToContent();
}

performancingUtil.prototype.addItemToCheckList = function(dataArray, number, checkListIDname, theGUID, aCategory, onItemClick, AType, isChecked){
    if(isChecked != true){
        isChecked = false;
    }
    
    var checkList = document.getElementById(checkListIDname);
    if(AType != 'label'){
        var checkbox = document.createElement('checkbox');
        checkbox.setAttribute('id', 'blog-' + number);
        checkbox.setAttribute('cat', aCategory);
        checkbox.setAttribute('checked', isChecked);
        for(i=0; i < dataArray.length; i++){
            checkbox.setAttribute('label', dataArray[i]);
            checkList.appendChild(checkbox);
        }
    }else{
        var label = document.createElement('label');
        label.setAttribute('id', 'blog-' + number);
        label.setAttribute('value', dataArray[0]);
        checkList.appendChild(label);
    }
}

performancingUtil.prototype.emptyElement = function (groupID) {
	var group = document.getElementById(groupID);
	while (group.lastChild) group.removeChild(group.lastChild);
};

performancingUtil.prototype.clearListOut = function(listIDname){
    var list=document.getElementById(listIDname);
    while(list.getRowCount() > 0){
        list.removeItemAt( list.getRowCount() - 1);
    }
}

performancingUtil.prototype.clearCheckListOut = function(checkListIDname){
    var checkList = document.getElementById(checkListIDname);
    while( checkList.hasChildNodes() ){
        checkList.removeChild( checkList.firstChild );
    }
}

//gPerformancingUtil.convertFromUnicode(theOldText, encodingType); //"iso-8859-1"
performancingUtil.prototype.convertFromUnicode = function(aOldText, encodingType){
    var uniConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    uniConverter.charset = encodingType; //"iso-8859-1"
    var theNewText = uniConverter.ConvertFromUnicode(aOldText);
    return theNewText;
}

performancingUtil.prototype.getCharType = function(){
    if(this.charType == null){
        try{
            this.charType = gPerformancingUtil.prefs.getCharPref("settings.defaults.encoding");
        }catch(e){
            this.charType = "UTF-8";
        }
    }
    return this.charType;
}

//We get the password, if it doesn't exist, we prompt user for the password.
performancingUtil.prototype.goGetPassword = function(aUserName, aURL){
    //If same as last call, we've cached the password.
    if(this.currentURL == aURL){
        return this.currentPass;
    }else{
        var thePassword = gPerformancingUtil.usermanagment.getPassword(aUserName, aURL);
        if(thePassword){
            this.currentURL = aURL;
            this.currentPass = thePassword;
            return thePassword;
        }else{
            var localeString = performancingUI.getLocaleString('pleaseenterpassword', [aURL]);
            var theUserPassword = prompt(localeString);
            var addedUser = gPerformancingUtil.usermanagment.storeLoginDetails(aUserName, theUserPassword, aURL);
            this.currentURL = aURL;
            this.currentPass = theUserPassword;
            return theUserPassword;
        }
    }
}

performancingUtil.prototype.usermanagment = {
	storeLoginDetails : function(myUserName, aPassword, aURL){
		// Get Password Manager (does not exist in Firefox 3)
		var CC_passwordManager = Components.classes["@mozilla.org/passwordmanager;1"];
		var CC_loginManager = Components.classes["@mozilla.org/login-manager;1"];

		if (CC_passwordManager != null) {
			// Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
			var newURL = bfPwdPrefix + aURL;

			if(myUserName){
				this._passwordManager = CC_passwordManager.createInstance();
				
				if (this._passwordManager) {
					this._passwordManager = this._passwordManager.QueryInterface(Components.interfaces.nsIPasswordManager);

					try{
						this._passwordManager.removeUser(newURL, myUserName);
					} catch (e) {
					}

					if (aPassword) {
						this._passwordManager.addUser(newURL, myUserName, aPassword);
						return true;
					}  
				} else {
					return false;
				}
			}

			return false;
		}
		else if (CC_loginManager!= null) {
			// Login Manager exists so this is Firefox 3
			var newURL = bfPwdPrefix + aURL;

			if (myUserName) {
				this._passwordManager = CC_loginManager.getService(Components.interfaces.nsILoginManager);
				var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo, "init");
				var loginInfo = new nsLoginInfo(newURL, 'chrome://scribefire', null, myUserName, aPassword, null, null);
				this._passwordManager.addLogin(loginInfo);

				return true;
			}

			return false;
		}
    },

	getPassword : function (aUserName, aURL) {
		// Get Password Manager (does not exist in Firefox 3)
		var CC_passwordManager = Components.classes["@mozilla.org/passwordmanager;1"];
		var CC_loginManager = Components.classes["@mozilla.org/login-manager;1"];

		if (CC_passwordManager != null) {
			// Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
			var newURL = bfPwdPrefix + aURL;
			this._passwordManager = CC_passwordManager.createInstance(Components.interfaces.nsIPasswordManagerInternal);
			this._host = { value : "" };
			this._user = { value : "" };
			this._password = { value : "" };

			try {
				this._passwordManager.findPasswordEntry(newURL, aUserName, "", this._host, this._user, this._password);
			} catch (e) {
				return false;
			}

			return this._password.value;
		}
		else if (CC_loginManager!= null) {
			// Login Manager exists so this is Firefox 3
			this._passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
			var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
			                            Components.interfaces.nsILoginInfo, "init");
			var hostname = bfPwdPrefix + aURL;
			var formSubmitURL = null;
			var httprealm = null;
			var username = aUserName;

			// Get Login Manager 
			var myLoginManager = CC_loginManager.getService(Components.interfaces.nsILoginManager);
			var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, null);

			for (var i = 0; i < logins.length; i++) {
				if (logins[i].username == username) {
					if (logins[i].formSubmitURL != 'chrome://scribefire') {
						var newLogin = new nsLoginInfo(hostname, 'chrome://scribefire', null, username, logins[i].password, null, null);
						this._passwordManager.modifyLogin(logins[i], newLogin);
					}
					
					return logins[i].password;
				}
			}

			var formSubmitURL = 'chrome://scribefire';
			
			// Get Login Manager 
			var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, null);

			for (var i = 0; i < logins.length; i++) {
				if (logins[i].username == username) {
					return logins[i].password;
				}
			}

			return false;
		}
	}
}

performancingUtil.prototype.checkCategories = function(aCheck){
    //check or uncheck them.
    var checkList = document.getElementById('blog-sidebar-listing-categories');
    for(var k=0; k < checkList.childNodes.length; k++ ){
        checkList.childNodes[k].setAttribute("checked", aCheck);
    }
}

/*
    Set the categories for the post
*/
performancingUtil.prototype.setCategoriesSidebar = function(arrayCatList, aDoClear){
    var doNotCheckClear = performancingUI.hasLabelChild('blog-sidebar-listing-categories');
    
    if(aDoClear || doNotCheckClear) gPerformancingUtil.clearCheckListOut('blog-sidebar-listing-categories');
    
    if(arrayCatList != "" && arrayCatList.length > 0){
        var checkList = document.getElementById('blog-sidebar-listing-categories');
        
        if(gPerformancingUtil.serviceObject.addCategories){
			// This API can create categories, so we'll create the checkboxes.
          	newCategories : for (var l = 0; l < arrayCatList.length; l++) {
				// Check if it already exists.
				for(var j = 0; j < checkList.childNodes.length; j++){
					if (checkList.childNodes[j].getAttribute('label') == arrayCatList[l]){
						checkList.childNodes[j].setAttribute("checked", true);
						continue newCategories;
					}
				}
				
                var theNewCatArray = arrayCatList[l].split(",");
                var theCategory1 = "";
                if(theNewCatArray.length > 1){
                    theCategory1 = theNewCatArray[1];
                }
                gPerformancingUtil.addItemToCheckList([theNewCatArray[0]], l, 'blog-sidebar-listing-categories', null, theCategory1, "", null, true );
            }
        }
		else{
			// This API can't actually create categories, so we'll just check them if they exist.
            gPerformancingUtil.checkCategories(false);
            for(x=0; x < arrayCatList.length; x++ ){
                for(i=0; i < checkList.childNodes.length; i++ ){
                    try{
                        if(checkList.childNodes[i].getAttribute('label') == arrayCatList[x]){
                            checkList.childNodes[i].setAttribute("checked", true);
                        }
                    }catch(e){
                        // Error getting categories from object
                        var localeString = performancingUI.getLocaleString('getcategorieserror', []);
                        alert(localeString);
                    }
                }
            }
        }
    }else{
        if(!doNotCheckClear){
            if( performancingUI.hasCheckboxChildren('blog-sidebar-listing-categories') ) gPerformancingUtil.clearCheckListOut('blog-sidebar-listing-categories');
            var localeString = performancingUI.getLocaleString('nocategoriesavailable', []);
            var localeString2 = performancingUI.getLocaleString('notavailable', []);
            //No Categories Available
            gPerformancingUtil.addItemToCheckList([localeString], 0, 'blog-sidebar-listing-categories', null, localeString2, "", 'label' );
        }
    }
}

performancingUtil.prototype.setUpAPISpecificFunctions = function(aUID){
	document.getElementById("blog-sidebar-listing-4").setAttribute("hidden","true");
	document.getElementById("performancing-sb-tab4").setAttribute("hidden","true");
	document.getElementById("blog-sidebar-categories-addbtn").hidden = true;
	
	if (gPerformancingUtil.serviceObject.supportsPages) {
		// Not all MT APIs will support pages.  We should do a ping to make sure this is an
		// Up-to-date WP API
		
		// If the  getPageList API exists, then so do all the new pages APIs and a newCategory API
		
	    var theBlogXML = gPerformancingUtil.serviceObjectXML;
	    var myServiceObject = gPerformancingUtil.serviceObject;
		
	    var myResponse = myServiceObject.getPageList();
		
	    if(myResponse){
			performancing_xmlcall.sendCommand(theBlogXML.apiurl.toString(), myResponse, 'pagelistcall', "", aUID, performancing_xmlcall.processData);
		}
		else {
			gPerformancingUtil.serviceObject.supportsPages = false;
		}
	}
	
    //User can add his own categories (i.e. in blogger)?
    document.getElementById("blog-sidebar-categories-addbtn").hidden = !gPerformancingUtil.serviceObject.addCategories;
}


var gPerformancingUtil = null;
function loadPerFormancingUtil(isAccountWizard) {
    if(gPerformancingUtil == null){
        try {
            gPerformancingUtil = new performancingUtil();
        } catch(e) { alert(e); }
        if(!isAccountWizard){
            gPerformancingUtil.init();//Load (D&D) Prefs
        }
    }
}
