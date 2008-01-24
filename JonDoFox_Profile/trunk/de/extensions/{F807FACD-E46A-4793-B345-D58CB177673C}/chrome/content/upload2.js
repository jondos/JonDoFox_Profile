/*	  Upload.js
 * *******************
 * A pretty generic FTP uploading library.
 * Used here for Images and any other file (only difference is File Picker filters and strings).
 *
 * Many thanks to Nickolay Ponomarev for his help.
 */
 
var gPffTempUploadObject = [];

//ftp.protocol
var gPFF_MAGIC_NUMBER = 0x804b0000;
var gPFFNetErrorStrings = {
   "1": "Unexpected Error",                    //unexpected
   "2": "User Canceled Upload",                //usercancel
  "13": "FTP Refused Upload",                  //refused
  "14": "Network Timeout",                     //netTimeout
  "16": "Network Appears Offline",             //netOffline
  "21": "Incorrect User or Password",          //ftplogin
  "22": "ftpcwd",                              //ftpcwd
  "23": "ftppasv",                             //ftppasv
  "24": "Incorrect Password",                  //ftppwd
  "25": "ftplist",                             //ftplist
  "30": "Unknown Error"                        //unknown
};
var gPFFCI = Components.interfaces;
var gPFFCC = Components.classes;
var gPFFChannel = null;
var gTheErrorTimer = null;

var gTempObject = [];

var gUploadService = new Object();

gUploadService = {
    serviceType: null,
    //this.CR = Components.results;
    
    // uploads stream (nsIInputStream) to the specified location (nsIURI)
    upload: function(stream, uri) {
      var iosvc = gPFFCC["@mozilla.org/network/io-service;1"].getService(gPFFCI.nsIIOService);
      gPFFChannel = iosvc.newChannelFromURI(uri).QueryInterface(gPFFCI.nsIUploadChannel);
      gPFFChannel.setUploadStream(stream, "", -1);
      gPFFChannel.asyncOpen(gPFFStreamListener, window);
    },
    
    // returns an nsIInputStream suitable for passing to nsIUploadChannel.setUploadStream
    // aFile is the nsILocalFile, whose contents should be uploaded
    getUploadStreamForFile: function(aFile) {
      var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
      fstream.init(aFile, 1, 0, 0);
    
      var bufStream = gPFFCC["@mozilla.org/network/buffered-input-stream;1"].createInstance(gPFFCI.nsIBufferedInputStream);
      bufStream.init(fstream, 8192);
      return bufStream;
    },
    
    getTargetURI: function(aProtocol, aUserName, aPassword, aHost, aPath) {
      var uri = gPFFCC["@mozilla.org/network/standard-url;1"].createInstance(gPFFCI.nsIURI);
      //uri.spec = "ftp://"+aUserName+":"+aPassword+"@"+ftpURi;
      uri.spec = aProtocol + "://" + aUserName + ":" + aPassword + "@" + aHost + "/" + aPath;
      return uri;
    },
    
    sendBinaryImage: function(theFilePath, aProtocol, aUserName, aPassword, aHost, aPath) {
        var myFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        //myFile.initWithPath("C:\\1.txt");
        //myFile.initWithPath(theFilePath);
        myFile = gTempObject; //Use the picked file, not the path from the textbox.
        this.upload(this.getUploadStreamForFile(myFile), this.getTargetURI(aProtocol, aUserName, aPassword, aHost, aPath));
    },
    
    getErrorStr: function(aCode){
      if(aCode == 0) return "done";
      if(aCode < gPFF_MAGIC_NUMBER) return "notneterror";
      aCode %= gPFF_MAGIC_NUMBER;
      //LOG(this.aCode);
      if(aCode in gPFFNetErrorStrings){
        return gPFFNetErrorStrings[aCode];
      }
      return "unexpected";
    },
    
    cancelUpload: function() {
        if(gPFFChannel){
            gPFFChannel.cancel(gPFF_MAGIC_NUMBER + 2);
            //Set Text
            var localeString = performancingUI.getLocaleString('lastuploadecanceled', []);
            if(gUploadService.serviceType == "blogapi"){
                localeString = performancingUI.getLocaleString('cancelapiupload', []);
            }
            gUploadDialogService.setFeedbackText(localeString, true);
            //
        }else{
            var localeString = performancingUI.getLocaleString('nouploadtocancel', []);
            alert(localeString);
        }
    },
    
    onReturn: function(aCode) {
        if(aCode == 0){				 // success
            //setTimeout(onSuccessfulUpload, DELAY);
            //alert("File succesfully uploaded");
            gUploadDialogService.uploadFTPGood();
        }else{ // xxx beep, perhaps?  // failure - don't close
            var theError = this.getErrorStr(aCode);
            //alert("Error uploading: " + theError + "\n The code: " + aCode);
            gUploadDialogService.onUploadError(theError, aCode);
        }
    },
    
    //Prep Binary Data
    prepBinaryToBase64Data: function(aNsiFile) {
        var fileInStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream); 
        fileInStream.init(aNsiFile, 0x01, 0644, false);
        var binaryInStream = Components.classes["@mozilla.org/binaryinputstream;1"] .createInstance(Components.interfaces.nsIBinaryInputStream); 
        binaryInStream.setInputStream(fileInStream); 
        
        var theData = binaryInStream.readBytes( binaryInStream.available() );
        var theBase64Data = btoa(theData);
        return theBase64Data;
    },
    
    //Do newMediaObject File Upload
    //metaWeblog.newMediaObject (blogid, username, password, struct)
    doMediaFileUpload: function(aNsiFile) {
        var theBase64Data = this.prepBinaryToBase64Data(aNsiFile);
        var theGUID = window.opener.gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog");
        //window.opener.
        if(window.opener.gSelectedBlog != null && window.opener.gSelectedBlog != 'null'){
            var theBlogXML = window.opener.gPerformancingUtil.serviceObjectXML;
            var myServiceObject = window.opener.gPerformancingUtil.serviceObject;
            var mimeSvc = Components.classes["@mozilla.org/mime;1"].getService(Components.interfaces.nsIMIMEService);
            var theMimeType = mimeSvc.getTypeFromFile(aNsiFile);
            var myResponse = myServiceObject.fileUpload(aNsiFile.leafName, theMimeType, theBase64Data);
            
            //Do and handle the Post Request
            var theCall = new PffXmlHttpReq(theBlogXML.apiurl.toString(), "POST", myResponse, false, null, null, null);
            theCall.onResult  = function(aText, aXML){
                gUploadService.onBlogApiResponse( aText, aXML, theBlogXML.url.toString() );
            }
            theCall.onError  = function(aText, aXML){
                var localeString = performancingUI.getLocaleString('errorcontactingserver', []);
                gUploadDialogService.onUploadError(localeString,"");
            }
            theCall.prepCall(); //Set up The call (open connection, etc.)
            theCall.request.setRequestHeader("Content-Type", "text/xml");
            theCall.makeCall(); //Make the call
            theCall.request.overrideMimeType ('text/xml');
        }
    },
    
    onBlogApiResponse: function(aResponseText, aResponseXML, aBlogUrl) {
        var re = /(\<\?\xml[0-9A-Za-z\D]*\?\>)/;
        var newstr = aResponseText.replace(re, "");
        var e4xXMLObject = new XML(newstr);
        gPffTempUploadObject.push(e4xXMLObject);
		
        var ourParsedResponse = null; 
        if (e4xXMLObject.params.param.value.length() >= 1){
            ourParsedResponse = window.opener.bfXMLRPC.XMLToObject(e4xXMLObject.params.param.value.children()[0]); 
        }else if (e4xXMLObject.fault.value.length() >= 1){
            ourParsedResponse = window.opener.bfXMLRPC.XMLToObject(e4xXMLObject.fault.value.children()[0]); 
        }
        gPffTempUploadObject.push(ourParsedResponse);
        if(ourParsedResponse.faultString || !ourParsedResponse.url){
            //dump("\nLogin Error: " + theObject.faultString + "\n")
            var localeString = "";
            var localeString2 = performancingUI.getLocaleString('noImageUpload', []);
            var localeString3 = performancingUI.getLocaleString('noImageUpload2', []);
            if(ourParsedResponse.faultString){
                localeString = performancingUI.getLocaleString('requesterror', []) + "\n\"" + ourParsedResponse.faultString + "\"";
            }
            alert(localeString2+"\n\n" + localeString3+"\n\n"+localeString);
            gUploadDialogService.onUploadError(ourParsedResponse.faultString,"");
        }else if(ourParsedResponse.url){
            //Construct the URL
            var theNewURL = "";
            if( /http:/.test(ourParsedResponse.url.toString()) ){
                theNewURL = ourParsedResponse.url;
            }else{
                if(aBlogUrl.charAt(aBlogUrl.length -1) == "/" && ourParsedResponse.url.charAt(0) == "/"){
                    theNewURL = aBlogUrl.substr(0, aBlogUrl.length -1) + ourParsedResponse.url;
                }else{
                    theNewURL = aBlogUrl + ourParsedResponse.url;
                }
            }
            gUploadDialogService.uploadBlogAPIGood(theNewURL);
        }
    }
}

// this object gets progress notifications
var gPFFStreamListener = {
  onDataAvailable: function(aChannel, aCtxt, aInStr, aSourceOffset, aCount) {},
  onStartRequest: function(aChannel, aCtxt) {},
  onStopRequest: function(aChannel, aCtxt, aErrCode) {
    //alert("Error return: " + aErrCode);
    gUploadService.onReturn(aErrCode);
  }
};


//DIALOG SETTINGS, ETC.

gUploadDialogService = new Object();

var gUploadDialogService = {
    onRadioClick: function(theObject, forceMe) {
        var theName = "";
        var isTrue = false;
        if(forceMe == true){
            isTrue = true
        }else{
            try{
                theName = theObject.id;
                isTrue = (theName == "url");
            }catch(e){
                var theSelected = document.getElementById("upload-details").selectedIndex;
                if(theSelected == 0){
                    isTrue = true;
                }else{
                    isTrue = false;
                }
            }
        }
            document.getElementById("upload-url-label").disabled = !isTrue;
            document.getElementById("upload-url").disabled = !isTrue;
            try{
                document.getElementById("upload-url-copy-button").disabled = !isTrue;
            }catch(e){}
            
            document.getElementById("upload-ftp-uri").disabled = isTrue;
            document.getElementById("upload-ftp-uri-label").disabled = isTrue;
            document.getElementById("upload-ftp-uri-button").disabled = isTrue;
            document.getElementById("upload-ftp-upload-button").disabled = isTrue;
            document.getElementById("upload-blogapi-upload-button").disabled = isTrue;
            document.getElementById("upload-ftp-upload-status-label").disabled = isTrue;
            
            if(isTrue){
                document.getElementById("upload-url-box").setAttribute("class", "white");
                document.getElementById("upload-ftp-box").setAttribute("class", "");
                document.getElementById("upload-url").focus();
            }else{
                document.getElementById("upload-ftp-box").setAttribute("class", "white");
                document.getElementById("upload-url-box").setAttribute("class", "");
            }
    },
    saveFtpSettings: function() {
          var prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
          var prefs = prefsService.getBranch("performancing.");// Get the "performancing." branch
          var stringBundle = document.getElementById("performancingstrings");
          var ftpUserName = document.getElementById("username").value;
          var ftpPassword = document.getElementById("password").value;
          var ftpHost = document.getElementById("host").value;
          var theProtocol = document.getElementById("protocol").selectedItem.value;
          try{
            prefs.setCharPref('ftp.host', ftpHost );
            prefs.setCharPref('ftp.username', ftpUserName );
            prefs.setCharPref('ftp.path', document.getElementById("path").value );
            prefs.setCharPref('ftp.url-to-path', document.getElementById("url-to-path").value );
            prefs.setCharPref('ftp.protocol', theProtocol );
            
            if(ftpUserName != ""){
                var addedUser = gPerformancingUtil.usermanagment.storeLoginDetails(ftpUserName, ftpPassword, "-ftp-" + ftpHost);
            }
          }catch (e){
              //var alertText = stringBundle.getString("performancing.imageupload.saveerr");
              //alert(alertText + e);
              //Error saving FTP details
              var localeString = performancingUI.getLocaleString('errorsavingftp', [e]);
              alert(localeString);
          }
    },
    onLoad: function() {
        document.getElementById("upload-url").focus();
        this.loadFtpSettings();
        gUploadDialogService.onRadioClick(null, false);
        var theGUID = false;
        try{
            window.opener.gPerformancingUtil.prefs.getCharPref("settings.lastselected.blog")
        }catch(e){
            document.getElementById("upload-blogapi-upload-button").hidden = true;
        }
    },
    loadFtpSettings: function() {
          loadPerFormancingUtil(true);
          var prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
          var prefs = prefsService.getBranch("performancing.");// Get the "performancing." branch
          var stringBundle = document.getElementById("performancingstrings");
          try{
              var theUserName = prefs.getCharPref('ftp.username');
              document.getElementById("username").value = theUserName;
              var ftpHost = prefs.getCharPref('ftp.host');
              document.getElementById("host").value = ftpHost;
              
              var thePassword = gPerformancingUtil.usermanagment.getPassword(theUserName, "-ftp-" + ftpHost);
              document.getElementById("password").value = thePassword;
              
              document.getElementById("path").value = prefs.getCharPref('ftp.path');
              document.getElementById("path").value = prefs.getCharPref('ftp.path');
              document.getElementById("url-to-path").value = prefs.getCharPref('ftp.url-to-path');
              
              var theProtocol = prefs.getCharPref('ftp.protocol');
              if(theProtocol == "ftp"){
                  document.getElementById("protocol").selectedIndex = 0;
              }else if(theProtocol == "http"){
                  document.getElementById("protocol").selectedIndex = 1;
              }else{
                  document.getElementById("protocol").selectedIndex = 2;
              }
          }catch (e){
              //var alertText = stringBundle.getString("performancing.imageupload.saveerr");
              //alert(alertText + e);
              //alert("Error saving FTP details" + e);
          }
    },
    
    filePicker: function(){
        this.onFilePick(true); //False to filter only images
    },
    
    onFilePick: function(notImage) {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        if(!notImage){
            fp.appendFilters(nsIFilePicker.filterImages);
        }
        var localeString = performancingUI.getLocaleString('selectimagefile', []);
        fp.init(window, localeString, nsIFilePicker.modeOpen);
        var res = fp.show();
        if (res == nsIFilePicker.returnOK){
          var thefile = fp.file;
          gTempObject = thefile;
          document.getElementById("upload-ftp-uri").value = thefile.path;
        }
    },
    
    tryUpload: function() {
        var host = document.getElementById("host").value;
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var path = document.getElementById("path").value;
        var url_to_path = document.getElementById("url-to-path").value;
        var fileName = "";
        
        if(host != "" && username != "" && password != "" ){
            var theFilePath = document.getElementById("upload-ftp-uri").value;
            if(theFilePath != ""){
                this.deckToggle(true);
                var theFileName = gTempObject.leafName;
                var theProtocol = document.getElementById("protocol").selectedItem.value;
                gUploadService.sendBinaryImage(theFilePath, theProtocol, username, password, host, path + theFileName);
            }else{
                var localeString = performancingUI.getLocaleString('selectafile', []);
                alert(localeString);
            }
        }else{
            var localeString = performancingUI.getLocaleString('setupftp', []);
            alert(localeString);
            document.getElementById("tabbox").selectedIndex = 1;
        }
    },
    
    //newMediaObject Blog Api upload
    tryMediaBlogUpload: function() {
		if (window.opener.gPerformancingUtil.serviceObjectXML.blogapi == 'atom_blogger'){
			alert("Blogger does not support uploading images via the API.");
		}
		else {
            var theFilePath = document.getElementById("upload-ftp-uri").value;
            if(theFilePath != ""){
                this.deckToggle(true);
                var theFileName = gTempObject.leafName;
                gUploadService.doMediaFileUpload(gTempObject);
            }else{
                var localeString = performancingUI.getLocaleString('selectafile', []);
                alert(localeString);
            }
		}
    },
    
    //On Upload Start
    onUploadStarted: function() {
        var localeString = performancingUI.getLocaleString('uploading', []);
        document.getElementById("upload-upload-progress-text").setAttribute("value", localeString);
        document.getElementById("upload-url-generated").hidden = true;
        gUploadService.serviceType = "ftp";
        this.tryUpload();
    },
    
    //Start Blog API upload (newMediaObject)
    onBlogApiUploadStarted: function() {
        var localeString = performancingUI.getLocaleString('uploading', []);
        document.getElementById("upload-upload-progress-text").setAttribute("value", localeString);
        document.getElementById("upload-url-generated").hidden = true;
        this.tryMediaBlogUpload();
        gUploadService.serviceType = "blogapi";
    },
    
    uploadFTPGood: function() {
        var localeString = performancingUI.getLocaleString('uploadcanceled', []);
        this.setFeedbackText(localeString, false);
        this.deckToggle();
        this.onFtpUploadDone();
    },
    
    uploadBlogAPIGood: function(aURL) {
        var localeString = performancingUI.getLocaleString('uploadcanceled', []);
        this.setFeedbackText(localeString, false);
        this.deckToggle();
        this.onBlogPIUploadDone(aURL);
    },
    
    //Set upload status here:
    setFeedbackText: function(aText, isError) {
        var theLabel = document.getElementById("upload-ftp-upload-status");
        theLabel.value = aText;
        if(isError){
            theLabel.setAttribute("style", "color: red;");
        }else{
            theLabel.setAttribute("style", "color: blue;");
        }
    },
    
    //On FTP Upload success
    onFtpUploadDone: function() { //gUploadDialogService.uploadFTPGood();
        gUploadDialogService.onRadioClick(null, true);
        document.getElementById("upload-details").selectedIndex = 0;
        var url_to_path = document.getElementById("url-to-path").value;
        document.getElementById("upload-url-generated").hidden = false;
        document.getElementById("upload-url").value = url_to_path + gTempObject.leafName;
    },
    
    onBlogPIUploadDone: function(aURL) { //gUploadDialogService.uploadFTPGood();
        gUploadDialogService.onRadioClick(null, true);
        document.getElementById("upload-details").selectedIndex = 0;
        //var url_to_path = document.getElementById("url-to-path").value;
        document.getElementById("upload-url-generated").hidden = false;
        document.getElementById("upload-url").value = aURL;
    },
    
    onDialogAccept: function() {
          var theImageURL = document.getElementById("upload-url").value;
          if(theImageURL != ""){
              var theURL = window.arguments[1];
              var re = window.arguments[0]; 
              theURL[0] = theImageURL;
              re[0] = true;
              return true;
          }else{
            var localeString = performancingUI.getLocaleString('addurltoinsert', []);
            alert(localeString);
            //return false;
          }
          return false;
    },
    
    setErrorTimer: function(){
        gTheErrorTimer = window.setTimeout('gUploadDialogService.deckToggle()', 1000);
    },
    
    cancelErrorTimer: function(){
        window.clearTimeout(gTheErrorTimer);
    },
    
    onUploadError: function(theError, aCode){
        this.setErrorTimer();
        var localeString = performancingUI.getLocaleString('uploaderror', []);
        var localeString2 = performancingUI.getLocaleString('theerror', [theError]);
        document.getElementById("upload-upload-progress-text").setAttribute("value", localeString);
        if(localeString2.length > 30){
            localeString2 = localeString2.substr(0, 30) + "...";
        }
        this.setFeedbackText(localeString2, true);
    },
    
    //CopyURl to clipboard
    copyURLToClipboard: function(aURL){
        //gContextMenu.getService('@mozilla.org/widget/clipboardhelper;1', Components.interfaces.nsIClipboardHelper).copyString(gContextMenu.linkText())
        if(document.getElementById("upload-url").value != ""){
            try{
                var clipBoard = gPFFCC["@mozilla.org/widget/clipboardhelper;1"].getService(gPFFCI.nsIClipboardHelper);
                //clipBoard.copyString(aURL);
                clipBoard.copyString( document.getElementById("upload-url").value );
            }catch(e){
                var localeString = performancingUI.getLocaleString('cantsaveurltoclip', []);
                alert(localeString);
            }
            return true;
        }else{
            var localeString = performancingUI.getLocaleString('noblankurl', []);
            alert(localeString);
            return false;
        }
    },
    //Return from Error
    deckToggle: function(notError) {
        var theDeck = document.getElementById('upload-ftp-deck');
        if(!notError){
            theDeck.setAttribute('selectedIndex', 0);
        }else{
            theDeck.setAttribute('selectedIndex', 1);
        }
    }
};

