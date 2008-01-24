var gBlogObject = null;
var gTempBlogObject = new Object();
var gPffAccountTimeOut = [];
var gTempFeedback = null;
var gAutoReturn = false;
var gSelectedBlogs = [];

var gPffDebugTemp = [];

window.addEventListener('load', onLoad, false);

function onClose(){
    window.opener.setTimeout('performancingUI.reLoadBlogs()', 1000, true);
    return true;
}

function onLoad(){
    loadPerFormancingUtil(true);
}

function onWizarPageShow(){
    enableNext();
    enableBack();
    return true;
}

function onAutoNext(){
    if(!gAutoReturn){
        doCheckURL();
        return false;
    }else{
        return true
    }
}

function doCheckURL(){
    var isValid = checkURL();
    var autoDetectDeck = document.getElementById("autodetect-deck");
    if(isValid){
        enableNext();
        autoDetectDeck.selectedIndex = "2";
    }else{
        //autoDetectDeck.selectedIndex = "3";
        doServerAPICheck();
    }
    gAutoReturn = true;
}

function goTo( aWizard ){
    document.getElementById('performancing-account-wizard').goTo(aWizard);
}

function tryAgain(){
    var autoDetectDeck = document.getElementById("autodetect-deck");
    autoDetectDeck.selectedIndex = "0";
}

function checkURL(){
    var isStandard = checkForStandardURL();
    var autoDetectDeck = document.getElementById("autodetect-deck");
    autoDetectDeck.selectedIndex = "1";
    if(isStandard){
        document.getElementById('performancing-account-wizard').getPageById('start').next = "start2";
        enableNext();
        return true;
    }
}

function checkForStandardURL(){
    var theDomain = document.getElementById("blog-url").value;
    var serviceList = document.getElementById("performancing-blogservice-list");
    //var customServiceList = document.getElementById('performancing-blogservice-custom-list');
    var theSelectedBlogIndex = null;
    var isStandard = false;
    /*if(theDomain.search(/.blogspot.com/) != -1){ //Old Blogger Support
        theSelectedBlogIndex = "0";
        isStandard = true;
    //}else
    if(theDomain.search(/.wordpress.com/) != -1){
        theSelectedBlogIndex = "0";
        isStandard = true;
    }else*/ if(theDomain.search(/.typepad.com/) != -1 || theDomain.search(/.blogs.com/) != -1){
        theSelectedBlogIndex = "1";
        isStandard = true;
    }else if(theDomain.search(/livejournal.com/) != -1){
        theSelectedBlogIndex = "2";
        isStandard = true;
    }else if(theDomain.search(/spaces.msn.com/) != -1 || theDomain.search(/spaces.live.com/) != -1){
        theSelectedBlogIndex = "3";
        isStandard = true;
    }else if(theDomain.search(/performancing.com/) != -1){
        theSelectedBlogIndex = "4";
        isStandard = true;
    }else if(theDomain.search(/jeeran.com/) != -1){
        theSelectedBlogIndex = "5";
        isStandard = true;
    }
    if(isStandard){
        serviceList.selectedIndex = theSelectedBlogIndex;
        return true;
    }else{
        return false;
    }
}

//Check to see if they accepted the terms of service
//Check to see if we need to show the custom settings window
function checkForAcceptedTOS(){
    var acceptBox = document.getElementById('pff-license-check');
    if(acceptBox.checked){
        return true;
    }else{
        var errorMessage = performancingUI.getLocaleString('accounttoserror', []);
        alert(errorMessage);
        return false;
    }
}

function loadTOS(aService){
    var theText = "";
    if(aService == "performancing_com"){
        //perfaccounttos
        theText = performancingUI.getLocaleString('perfaccounttos');
    }
    var winAboout = document.getElementById("performancing-aw-tos-frame");
    winAboout.contentWindow.document.body.innerHTML = theText;
}


//Check to see if we need to show the custom settings window
function checkForCustom(){
    var serviceList = document.getElementById('performancing-blogservice-list');
    var aService = serviceList.selectedItem.value;
    if( aService.match("_cust") ){
         //document.getElementById('performancing-account-wizard').advance("login-custom");
         document.getElementById('performancing-account-wizard').getPageById('start2').next = "login-custom";
         return true;
    }else if(aService == 'livejournal_com'){
        var localeString = performancingUI.getLocaleString('awlivejournalsupport', []);
        alert(localeString);
    }else if(aService == 'performancing_com'){
        loadTOS(aService);
        document.getElementById('performancing-account-wizard').getPageById('start2').next = "doTOSConfirm";
        return true;
    }
    return true;
}

function tryServiceLogin(){
    var serviceList = document.getElementById('performancing-blogservice-list');
    var aService = serviceList.selectedItem.value;
    var aServiceAPI = serviceList.selectedItem.getAttribute("api");
    
    var customServiceList = document.getElementById('performancing-blogservice-custom-list');
    var aCustomService = customServiceList.selectedItem.value;
    var aCustomServiceAPI = customServiceList.selectedItem.getAttribute("api");
    var theApiInUse = null;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var custAPIURL = document.getElementById('custom-apiurl').value;
    var custAPKey = document.getElementById('custom-appkey').value; //custAPIURL custAPKey

    if(username != "" && password != ""){
        var isAtom = false;
        document.getElementById("login-error-msg").hidden = true;
        var loginSuccess = false;
        var myWizardBlog = null;
        var url = null;
        var blogType = null;
        var blogAPI = null;
        var APIURL = null;
        var APPKey = null;
        var myWizardBlog = null;
        //aService = 'blogger_com';
        dump("Service Chosen: " + aService + "\n")
        
        if( aService.match("_cust") ){
            theApiInUse = aCustomServiceAPI;
        }else{
            theApiInUse = aServiceAPI;
        }
        
        switch(theApiInUse){
            case "s_atom": //https://blogger.com/atom
                blogAPI = serviceList.selectedItem.getAttribute("api");
                APIURL = serviceList.selectedItem.getAttribute("apiurl");
                blogType = aService;          
                APPKey = serviceList.selectedItem.getAttribute("apikey");
                myWizardBlog = new perFormancingAtomAPI();
                isAtom = true;
                break;
                
            case "s_mt":
                blogAPI = serviceList.selectedItem.getAttribute("api");
                APIURL = serviceList.selectedItem.getAttribute("apiurl");
                blogType = aService;          
                APPKey = serviceList.selectedItem.getAttribute("apikey");
                myWizardBlog = new perFormancingMovableTypeAPI();
                break;
                
            case "s_blogger":
                blogAPI = serviceList.selectedItem.getAttribute("api");
                APIURL = serviceList.selectedItem.getAttribute("apiurl");
                blogType = aService;          
                APPKey = serviceList.selectedItem.getAttribute("apikey");
                myWizardBlog = new perFormancingBloggerAPI();
                break;
                
            case "s_metaweblog":
                blogAPI = serviceList.selectedItem.getAttribute("api");
                APIURL = serviceList.selectedItem.getAttribute("apiurl");
                blogType = aService;          
                APPKey = serviceList.selectedItem.getAttribute("apikey");
                myWizardBlog = new performancingMetaweblogAPI();
                break;
                
            //Start Custom/Standard API's
            
            case "atom": //https://blogger.com/atom
                blogAPI = customServiceList.selectedItem.getAttribute("api");
                APIURL = custAPIURL;
                blogType = aCustomService;
                APPKey = custAPKey;
                myWizardBlog = new perFormancingAtomAPI();
                isAtom = true;
                break;
                
            case "atom_blogger": //https://blogger.com/ Beta
                blogAPI = customServiceList.selectedItem.getAttribute("api");
                APIURL = custAPIURL;
                blogType = aCustomService;
                APPKey = custAPKey;
                myWizardBlog = new perFormancingBloggerAtomAPI();
                isAtom = true;
                break;
                
            case "mt":
                blogAPI = customServiceList.selectedItem.getAttribute("api");
                APIURL = custAPIURL;
                blogType = aCustomService;
                APPKey = custAPKey;
                myWizardBlog = new perFormancingMovableTypeAPI();
                break;
                
            case "blogger":
                blogAPI = customServiceList.selectedItem.getAttribute("api");
                APIURL = custAPIURL;
                blogType = aCustomService;
                APPKey = custAPKey;
                myWizardBlog = new perFormancingBloggerAPI();
                break;
                
            case "metaweblog":
                blogAPI = customServiceList.selectedItem.getAttribute("api");
                APIURL = custAPIURL;
                blogType = aCustomService;
                APPKey = custAPKey;
                myWizardBlog = new performancingMetaweblogAPI();
                break;
                
            default:
                var localeString = performancingUI.getLocaleString('awnoservicechosen', []);
                alert(localeString);
                break;
        }
        
        APIURL = APIURL.replace("_USER_NAME_", username);
        APPKey = custAPKey;
        
        //case blogger
        myWizardBlog.doSetup();
        myWizardBlog.init(blogType, APPKey, APIURL, null, null, username,  password, false  );
        //Setup temp object
        gTempBlogObject.blogtype = blogType;
        gTempBlogObject.blogapi = blogAPI;
        gTempBlogObject.apiurl = APIURL;
        gTempBlogObject.appkey = APPKey;
        
        var xmlStringMessageToSend = myWizardBlog.getUsersBlogs();
        dump("XML to Send\n" + xmlStringMessageToSend + "\n");
        if(!isAtom){
            performancing_xmlcall.sendCommand(APIURL, xmlStringMessageToSend, 'accountwizard', "", "", performancing_xmlcall.processData);
            setLoginTimeOut();
        }
        
        return true;
    }else{
        document.getElementById("login-error-msg").hidden = false;
        
        return false;
    }
}

function tryServiceSelection(){
    var serviceList = document.getElementById('performancing-wizard-blog-list');
    
    if (serviceList.selectedCount > 0) {
            gSelectedBlogs = serviceList.selectedItems;
            return true;
    }
    else{
        var localeString = performancingUI.getLocaleString('selectablog', []);
        alert(localeString);
        return false;
    }
}


function disableNext(){
    document.getElementById('performancing-account-wizard').getButton('next').disabled = true;
    return true;
}

function enableNext(){
    document.getElementById('performancing-account-wizard').getButton('next').disabled = false;
    return true;
}

function disableBack(){
    document.getElementById('performancing-account-wizard').getButton('back').disabled = true;
    return true;
}

function enableBack(){
    document.getElementById('performancing-account-wizard').getButton('back').disabled = false;
    return true;
}

function processReturnData(theObject, isAtom, theXML){
    gPffDebugTemp.push(theObject);
    gPffDebugTemp.push(theXML);
    clearLoginTimeOut();
    var isError = true;
    if(theObject.length == null){
        if(!isAtom){
            if(theObject.faultString){
                dump("\nLogin Error: " + theObject.faultString + "\n")
                isError = true;
            }else{
                dump('\nError: Unknown State\n');
                isError = true;
            }
        }
    }else{
        isError = false;
        dump("\nLogin Success!\n")
        dump("Response Length: "+theObject.length + "\n");
        
        gBlogObject = theObject;
        dump("Response Length: "+gBlogObject.length + "\n");
        clearListOut();
        var tempArray = [];
        for(j = 0; j < gBlogObject.length; j++){
            var blogName = gBlogObject[j].blogName; 
            var blogURL = gBlogObject[j].url;
            var theGUID = newGuid();
            var theBlogID = gBlogObject[j].blogid;
            
            addItemToList(blogName, blogURL, j, theGUID, theBlogID );
        }

        var serviceList = document.getElementById('performancing-wizard-blog-list');
        
        if (serviceList.getRowCount() == 0){
        	isError = true;
        }
        else {
	        if( serviceList.selectedCount == 0) {
        	    serviceList.invertSelection();
       		 }
        }
    }
    
    if(!isError){
        //document.getElementById('performancing-account-wizard').getPageById('login').next = "finish";
        document.getElementById('performancing-account-wizard').advance("success");
        return true;
    }else{
         //document.getElementById('performancing-account-wizard').getPageById('login').next = "login-error";
         document.getElementById('performancing-account-wizard').advance("login-error");
         return true;
    }
}

function gotoLoginPage(){
    document.getElementById('performancing-account-wizard').goTo("login");
    return false;
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
function newGuid() { 
    var g = ""; 
    for(var i = 0; i < 32; i++){
        g += Math.floor(Math.random() * 0xF).toString(0xF) + (i == 8 || i == 12 || i == 16 || i == 20 ? "-" : ""); 
    }
    return g;
}
////////////////////

function saveBlogToSprefs(){
    var result = false;
    var tempGUID = [];
    //gSelectedBlogs
    if(gSelectedBlogs.length > 0){
        
        for(var i=0; i < gSelectedBlogs.length; i++){
            //
            var theBlogName = gSelectedBlogs[i].getAttribute('blogname');
            var theGUID = gSelectedBlogs[i].getAttribute('blogguid');
            var theURL = gSelectedBlogs[i].getAttribute('blogurl');
            var theBlogID = gSelectedBlogs[i].getAttribute('blogid');
            //
            
            var theBlogType = gTempBlogObject.blogtype;
            var theBlogAPI = gTempBlogObject.blogapi;
            var theAppKey = gTempBlogObject.appkey;
            var theAPIURL = gTempBlogObject.apiurl;
            
            var theUserName = document.getElementById('username').value;
            var thePassWord = document.getElementById('password').value;
            var useBoolean = document.getElementById('useBooleanForPublish').checked;
            
            //First 3 are for legacy support (v1.0)
            if(theBlogType == "blogger_com" || theBlogType == "atom_cust" || theBlogType == "livejournal_atom_com" || theBlogType == "s_atom" || theBlogType == "atom" || theBlogType == "__atom_blogger"){
                theAPIURL = gBlogObject[i].url;
            }                                                                                                                 
            
            var theAppKey = gTempBlogObject.appkey;
            
            result = generateXML(theBlogName, theBlogType, theAppKey, theUserName, theAPIURL, theGUID, theURL, theBlogID, theBlogAPI, useBoolean  );
            
            //Now save the username and password based on username and url
            var addedUser = gPerformancingUtil.usermanagment.storeLoginDetails(theUserName, thePassWord, theURL);
        }
        
        if(!result){
            var localeString = performancingUI.getLocaleString('awerrorsavingbloginfo', []);
            alert(localeString);
        }
        
        if(!addedUser){
                var localeString = performancingUI.getLocaleString('awerrorsavinglogininfo', []);
                alert(localeString);
        }
        
        //refresh the opener page
        //window.opener.setTimeout(performancingUI.reLoadBlogs, 1000, true);
        //disable the back button
        document.getElementById('performancing-account-wizard').getButton('back').disabled = true;
    }
}

function generateXML(theBlogName, theBlogType, theAppKey, theUserName, theAPIURL, theGUID, theURL, theBlogID, theBlogAPI, useBoolean ){
    //We need to get this from a file and theBlogXML = new XML(theFilesStringContents);
    var file = getXMLFile();
    var theXMLFile = null;
    var theBlogXML = null;
    //Doesn't exist, so let's create it.
    if(!file.exists()){
        dump('Creating file: ' + bloglistxmlfile + "\n");
        theBlogXML = <bloglist>
                        <defaults>
                            <lastselected></lastselected>
                        </defaults>
                        <blogs></blogs>
                     </bloglist>;
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
        theBlogXML.blogs.blog +=
                                    <blog>
                                        <blogname>{theBlogName}</blogname>
                                        <blogtype>{theBlogType}</blogtype>
                                        <blogapi>{theBlogAPI}</blogapi>
                                        <appkey>{theAppKey}</appkey>
                                        <username>{theUserName}</username>
                                        <apiurl>{theAPIURL}</apiurl>
                                        <GUID>{theGUID}</GUID>
                                        <url>{theURL}</url>
                                        <blogid>{theBlogID}</blogid>
                                        <useboolean>{useBoolean}</useboolean>
                                    </blog>;
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

function deleteBlogEntry(theGUID, theXML){
    var file = getXMLFile();
    var theXMLString = PerFormancingFileIO.read(file, "UTF-8");
    var theBlogXML = new XML(file);
    //delete dude..blog.(GUID == theGUID);
    var entryIndex = theBlogXML.blogs.blog.(GUID == theGUID ).childIndex();
    delete theBlogXML.blogs.blog[entryIndex];
    
}

function getXMLFile(){
    var file = PerFormancingDirIO.get("ProfD");
    file.append("extensions");
    file.append(bloglistxmlfile);
    var theBlogXML = null;
    
    return file;
}

function clearListOut(){
    var list=document.getElementById('performancing-wizard-blog-list');
    while(list.getRowCount() > 0){
        list.removeItemAt( list.getRowCount() - 1);
    }
}

function addItemToList(theBlogName, theURL, number, theGUID, theBlogID){
    var list = document.getElementById('performancing-wizard-blog-list');
    var item = document.createElement('listitem');
    item.setAttribute('id', 'blog-' + number);
    item.setAttribute('blogname', theBlogName);
    item.setAttribute('blogguid', theGUID);
    item.setAttribute('blogurl', theURL);
    item.setAttribute('blogid', theBlogID);
    
    var itemCell = document.createElement('listcell');
    itemCell.setAttribute('label', theBlogName);
    item.appendChild(itemCell);
    
    var itemCell2 = document.createElement('listcell');
    itemCell2.setAttribute('label', theURL);
    item.appendChild(itemCell2);
    
    //Append the elements
    list.appendChild(item);
    //sizeToContent();
}


function onCustomListClick(){
    var customServiceList = document.getElementById('performancing-blogservice-custom-list');
    var aCustomServiceAPI = customServiceList.selectedItem.getAttribute("apiurl");
    var customAPIBox = document.getElementById('custom-apiurl');
    customAPIBox.value = aCustomServiceAPI;
    
    if(customServiceList.selectedItem.value == 'roller_cust'){
        var localeString = performancingUI.getLocaleString('awrollersupport', []);
        alert(localeString);
    }
    if( customServiceList.selectedItem.getAttribute("useBoolean") == 'true'){
        document.getElementById('useBooleanForPublish').checked = true;
    }else{
        document.getElementById('useBooleanForPublish').checked = false;
    }
}

function setLoginTimeOut(){
    gPffAccountTimeOut = window.setTimeout("onLoginTimeOut()", 15000);
}

function clearLoginTimeOut(){
    window.clearTimeout(gPffAccountTimeOut);
}

function onLoginTimeOut(){
    document.getElementById('performancing-account-wizard').advance('login-error');
}

function doServerAPICheck(){
    var theDomain = document.getElementById("blog-url").value;
    
    //Make sure it's a valid URL:
    if( theDomain.search("http://") == "-1" && theDomain.search("https://") == "-1"){
        theDomain = "http://" + theDomain;
    }
    //gMakeXMLCall3(theDomain, "1", "accountw-autodetect", "", "");
    var theCall = new PffXmlHttpReq(theDomain, "GET", null, false, null, null);
    
    theCall.onResult = function( aText, aXML ){
        doProssessAutoDetectPage("1", aText, "1");
    }
    theCall.onError = function (aStatusMsg, Msg) {
        //foo
    }
    theCall.prepCall(); //Set up The call (open connection, etc.)
    theCall.request.setRequestHeader("Content-Type", "text/xml");
    theCall.makeCall(); //Make the call
    theCall.request.overrideMimeType ('text/xml');
}

function doProssessAutoDetectPage(aType, theXMLData, aNum){
    var autoDetectDeck = document.getElementById("autodetect-deck");
    try{
        var theResult = null;
        if(aNum == "1"){
            try{
                //theResult = prossessAutoDetectPage( aType, theXMLData );
                theResult = prossessAutoDetectPageText( aType, theXMLData );
            }catch(e){
                alert("Error, malformed html, cannot auto-detect blog.\nPlease visit the ScribeFire Support Forums for help:\nhttp://performancing.com/forum/firefox/");
            }
        }else{
            theResult = prossessAutoDetectPage2( aType, theXMLData );
        }
        //gTempFeedback = theResult;
        if(theResult[0]){
                var customServiceList = document.getElementById('performancing-blogservice-custom-list');
                var theSelectedBlogIndex = null;
                var theAPI = theResult[1];
                var theURL = theResult[2];
                switch(theAPI){
                    case "wordpress":
                        customServiceList.selectedIndex = "0";
                        //tryServiceLogin(true, theURL, "metaweblog" );
                        break;
                        
                    case "blogger":
                        //customServiceList.selectedIndex = "5";
                        //tryServiceLogin(true, theURL, "atom" );
                        break;
                    
                    case "blogger_beta":
                        customServiceList.selectedIndex = "6";
                        //tryServiceLogin(true, theURL, "atom" );
                        break;
                    
                    case "metaweblog":
                        customServiceList.selectedIndex = "5";
                        //tryServiceLogin(true, theURL, "metaweblog" );
                        break;
                        
                    case "movabletype":
                        customServiceList.selectedIndex = "1";
                        //tryServiceLogin(true, theURL, "mt" );
                        break;
                }
            var serviceList = document.getElementById('performancing-blogservice-list');
            serviceList.selectedItem.value = "_custom"
            onCustomListClick();
            var custAPIURL = document.getElementById('custom-apiurl');
            //var custAPKey = document.getElementById('custom-appkey');
            custAPIURL.value = theURL;
            document.getElementById('performancing-account-wizard').getPageById('start').next = "login-custom";
            document.getElementById('performancing-account-wizard').advance('login-custom');
            document.getElementById('performancing-account-wizard').getPageById('login-custom').back = "start";
            enableNext();
            autoDetectDeck.selectedIndex = "0";
        }else{
            //alert("Result Error");
            autoDetectDeck.selectedIndex = "3";
        }
    }catch(e){
        autoDetectDeck.selectedIndex = "3";
    }
}

// GPL function originally by Flock
// No longer used, now using REGEXP
function prossessAutoDetectPage(aType, theXMLData){
    //alert("Cool : " + aType);
    gPffDebugTemp.push(theXMLData);//isBlogger = gPffDebugTemp[0].match( /(?:href\=\".*)(http\:\/\/\.*.blogger.com\/feeds\/\d+\/posts\/full)/ );
    var autoDetectDeck = document.getElementById("autodetect-deck");
    try{
        
        var properHeader = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">";
        var text = properHeader + "\n" + "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head>\n"
    
        
        var title_html = "";
        if(theXMLData.match(/(<title.*>.+?>)/))
        {
            title_html = RegExp.$1;
        }
        text += title_html;
    
        var R = /<link.+?>/g;
        for(;;)
        {
            var ar = R.exec(theXMLData);
            if(!ar) break;
            var cur = ar[0] + "";
            if(!cur.match(/\/>/))
            {
              cur = cur.replace(/>/,"/>");
            }
            text += cur + "\n";
        }
        text += "</head></html>";
        var parser = new DOMParser();
        var resultDoc = parser.parseFromString(text,"text/xml");        
        //gTempFeedback = resultDoc;
            var linklist = resultDoc.getElementsByTagName("link");
            for(var i=0;i<linklist.length;++i)
            {
                var link = linklist[i]; 
                var url = link.href;
                if(!url) continue;
                
                if(link.type=="application/atom+xml" && link.rel=="service.post")
                {
                    /*
                     * Blogger Atom API, what else
                     */
                     //(blogger.com\/feeds\/\d+\/posts\/full)
                     //var theRegExp = /(blogger.com\/feeds\/\d+\/posts\/)/;
                     //posts/full
                     var theRegExp = /(\/posts\/full)/;
                     if( theRegExp.test(url) ){
                         return [true, "blogger_beta", url];
                     }else{
                        //return [true, "blogger", url]; //Old Blogger
                     }
        
                }
                else if(link.rel=="pingback")
                {
                    /*
                     * Wordpress, what else
                     */
                     return [true, "wordpress", url];
                }
                else if(link.title=="RSD")
                {
                    /*
                     * Blogger xml-rpc service discovery
                     */
                    //inst.doRequest(listener, url, inst.onIntrospect);
                    //if(aType == "1"){
                        doSecondCall(url);
                    //}else{
                    //    return [false, "error"];
                    //}
                }
            }
    }catch(e){
        autoDetectDeck.selectedIndex = "3";
        //alert("Error: " + e);
    }
    return [false, "error"];
}

function prossessAutoDetectPageText(aType, theXMLData){
    gPffDebugTemp.push(theXMLData);
    //Blogger Beta
    //var isBlogger = theXMLData.match( /(?:href\=\".*)(http\:\/\/.*blogger.com\/feeds\/\d+\/posts\/)/ );
    //var isBlogger = theXMLData.match( /(?:\<link\s*rel\=\"service.post\"\s*type\=\"\application\/atom\+xml\"\s*title\=\"\D*\S*\"\s*href=\")(.*posts\/)(?=.*\")/ );
    //var isBloggerBeta = theXMLData.match( /(?:\<link\s*rel\=\"alternate\"\s*type\=\"\application\/atom\+xml\"\s*title\=\"\D*\S*\"\s*href=\")(.*\/feeds\/posts\/\w+)(?=\")/ );
    var isBloggerBeta = theXMLData.match( /(?:\<link\s*rel\=\"alternate\"\s*type\=\"\application\/atom\+xml\"\s*title\=\"\S*\D*\S*\"\s*href=\")(.*\/feeds\/posts\/\w+)(?=\")/ );
    if(isBloggerBeta){
        return [true, "blogger_beta", isBloggerBeta[1]];
    }
    
    var isBlogger = theXMLData.match( /(?:\<link\s*rel\=\"service.post\"\s*type\=\"\application\/atom\+xml\"\s*title\=\"\D*\S*\"\s*href=\")(.*posts\/\w*)(?=.*\")/ );
    if(isBlogger){
        isBlogger[1] = isBlogger[1].replace("summary", "full");
        return [true, "blogger_beta", isBlogger[1]];
    }
    //WordPress
    //(?:\<link\.*\s*rel\=\"pingback\"\s*href=\")(.*)(?=\")
    var isWordPress = theXMLData.match( /(?:\<link[\s*\S*\s*]*rel\=\"pingback\"[\s]*href=\")(.*)(?=\")/ );
    if(isWordPress) return [true, "wordpress", isWordPress[1]];
    
    //RSD
    //(?:title\=\"RSD\"\s*\.*href=\")(.*)(?=\")
    var isRSD = theXMLData.match( /(?:\<link[\s*\S*\s*]*title\=\"RSD\"\s*\.*href=\")(.*)(?=\")/ );
    if(isRSD) doSecondCall(isRSD[1]);
    
    
}

function doSecondCall(aURL){
    //gMakeXMLCall3(aURL, "2", "accountw-autodetect-2", "", "");
    var theCall = new PffXmlHttpReq(aURL, "GET", null, false, null, null);
    
    theCall.onResult = function( aText, aXML ){
        doProssessAutoDetectPage("2", aXML, "2");
    }
    theCall.onError = function (aStatusMsg, Msg) {
        //foo
    }
    theCall.prepCall(); //Set up The call (open connection, etc.)
    theCall.request.setRequestHeader("Content-Type", "text/xml");
    theCall.makeCall(); //Make the call
    theCall.request.overrideMimeType ('text/xml');
    
}

// GPL function originally by Flock
function prossessAutoDetectPage2(aType, theXMLData){
        try{
            //gPffDebugTemp.push(theXMLData);
            var apis = theXMLData.getElementsByTagName("api");
            //gPffDebugTemp.push(apis);
            for(var i=0;i<apis.length;++i)
            {
                var name = apis[i].getAttribute("name").toLowerCase();
                //if(name=="atom") continue;
                //if(name=="atom"){

                    var apiLink = apis[i].getAttribute("apiLink");
                    var preferred = apis[i].getAttribute("preferred");
                    var blogID = apis[i].getAttribute("blogID");
                    var B = null;
                    if(name=="blogger") {
                        return [true, "blogger", apiLink];
                    }
                    if(name=="metaweblog") {
                        return [true, "metaweblog", apiLink];
                    }
                    if(name=="movabletype") {
                        return [true, "movabletype", apiLink];
                    }
                //}
            }
            //listener.onAPI(rval);
            return [false, "error"];
        } 
        catch(e) {
            //alert(e + " " + e.fileName + " " + e.lineNumber);
            return [false, "error"];
        }
}

