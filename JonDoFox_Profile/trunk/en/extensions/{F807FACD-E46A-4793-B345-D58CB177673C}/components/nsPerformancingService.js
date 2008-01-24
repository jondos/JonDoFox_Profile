 /* 
 Performancing for Firefox
 XPCOM JS Implementation
 ---------------
 
 TODO:
 Slowly move code here to gain performance and modulation
 REMOVE IDL and use wrappedJSObject
 
 See IDL for current features
*/

//Addon Topics
const PERFORMANCING_ADDON_PFFSTART_TOPIC = "performancing-addon-pffstart-topic";
const PERFORMANCING_ADDON_PFFENABLE_TOPIC = "performancing-addon-pffenable-topic";
const PERFORMANCING_ADDON_PFFDISABLE_TOPIC = "performancing-addon-pffdisable-topic";
const PERFORMANCING_ADDON_PFFTABCLICK_TOPIC = "performancing-addon-pfftabclick-topic";

function nsPerformancingService() {
    this.wrappedJSObject = this;
    this._bInited = false;
    this.updateTimer = null;
    this.checkTime = 600000; // to 10 mins
    //this.checkTime = 60000; // 60 seconds (temp, for testing)
}

nsPerformancingService.prototype = {
    // ** START Public Functions **
    init: function(aWebService) {
        this.printLog("The Init Service ");
        if (this._bInited) { //Check if we are already initialized
            return true;
        }
        try{
          //xmlhttprequest service
          this.req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
          
          //Timer service
          this._checkTimer = Components.classes["@mozilla.org/timer;1"];
          this._checkTimer = this._checkTimer.createInstance(Components.interfaces.nsITimer);
          //Observer Service
          
          //For launching a prompt from xpcom
          this.promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
          
          //Get the last used window so we can call openDialog gBrowser, etc. from there.
          this._windowManager = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
          this._window = this._windowManager.getMostRecentWindow("navigator:browser"); //Get's the last browser window
          
          //Pref System
          this.prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
          this.prefs = this.prefsService.getBranch("performancing.");// Get the "performancing." branch
          
          //Pref Observers
          this.pbiPref = this.prefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal);
          this.pbiPref.addObserver("", this, false);//Pref Change Observer
          
          this._observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
          
        } catch (e){
          this.printLog("Could note initialize Components. Error: " + e);
          //Notify the UI there was an error
        }
        //this._observerService.addObserver(this, PERFORMANCING_ADDON_PFFSTART_TOPIC, false);
        this._bInited = true;
        //Do a one time call
        this._checkTimer.initWithCallback(this, this.checkTime, Components.interfaces.nsITimer.TYPE_ONE_SHOT);// TYPE_ONE_SHOT | TYPE_REPEATING_SLACK
        
        return true;
    },
    
    createTempObject: function(){
        var doc = Components.classes["@mozilla.org/xul/xul-document;1"].createInstance(Components.interfaces.nsIDOMDocument);
        var dude = doc.createElement("button");
        dude.setAttribute("id", "temp-button");
        dude.setAttribute("label", "Dude Man");
        return dude;
    },
    
    printLog: function(msg) {//Dump to -console.
        dump("ScribeFire =>: " + msg +"\n");
    },
    
    callNotification: function (aTopic, aData) {
      this.performancingSendUpdateNotifications(aTopic, aData);
    },
    
    onLastPFFClose: function () {
      //Do something on browser close
    },
    
    pffXmlHttpReq: {
        request: Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest),
        
        prepCall: function (aUrl, aType, aContent, aDoAuthBool, aUser, aPass) {
            this.url = aUrl;
            this.posttype = aType;
            this.content = aContent;
            this.username = aUser;
            this.password = aPass;
            this.doAuth = aDoAuthBool;
            this.callback = aCallBackFunc;
            if(this.doAuth){
                this.request.open(this.posttype, this.url, true, this.username, this.password);
                
                //Keeps stupid Authentication window from poping up
                this.request.channel.notificationCallbacks = {
                    QueryInterface: function (iid) { // nsISupports
                        if (iid.equals (Components.interfaces.nsISupports) ||
                            iid.equals (Components.interfaces.nsIAuthPrompt) ||
                            iid.equals (Components.interfaces.nsIInterfaceRequestor)) {
                                return this;
                        }
                        throw Components.results.NS_ERROR_NO_INTERFACE;
                    },
                    getInterface: function (iid, result) { // nsIInterfaceRequestor
                        if (iid.equals (Components.interfaces.nsIAuthPrompt)) {
                            return this;
                        }
                        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
                        return null;
                    },
                    prompt: function (dialogTitle, text, passwordRealm, savePAssword, 
                            defaultText, result) { // nsIAuthPromptInterface
                        return false;
                    },
                    promptUsernameAndPassword: function (dialogTitle, text, 
                            passwordRealm, savePassword, user, pwd) {
                                  //Didn't work, asking for password again
                        return false;
                    },
                    promptPassword: function (dialogTitle, text, passwordRealm, savePassword, user) {
                        return false;
                    }
                }
            }else{
                this.request.open(this.posttype, this.url, true);
            }
            
            if(this.posttype.toLowerCase() == "post"){
                this.request.setRequestHeader('Content-Length', this.content.length );
            }
            
        },
        
        makeCall: function () {
		this.request.setRequestHeader("User-Agent","Mozilla/5.0 (compatible; ScribeFire; http://www.scribefire.com/)");
            this.request.send(this.content)
        },
        
        requestComplete: function () {
            if(theCall.request.readyState == 4){ 
                if (theCall.request.status == 200){ 
                    theCall.onResult(theCall.request.responseText, theCall.request.responseXML); 
                }else{
                    try{
                        theCall.onError(theCall.request.statusMessage, theCall.request.responseXML);
                    }catch(e){}
                } 
            }
        }
    },
    
    
    // ************************ START Private Functions ************************ **
    
    onAppClose: function () {
      //Do something on browser close
    },

    // nsISupports
    QueryInterface: function (iid) {
        if (!iid.equals(Components.interfaces.nsIPerformancingService) && !iid.equals(Components.interfaces.nsISupports) && !iid.equals(Components.interfaces.nsIAlertListener))
               throw Components.results.NS_ERROR_NO_INTERFACE;

       return this;
    },

    // nsITimerCallback
    notify: function(aTimer) {
      this.printLog("Timer Called");
      var isTrue = true;
      if(isTrue){
          this.printLog("Start 10min Timer Call again");
          this._checkTimer.initWithCallback(this, this.checkTime - 1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);// TYPE_ONE_SHOT | TYPE_REPEATING_SLACK
      }else{
          //Start small timer again
          //this.printLog("Start small Timer Call again");
          //this._checkTimer.initWithCallback(this, this.checkTime, Components.interfaces.nsITimer.TYPE_ONE_SHOT);// TYPE_ONE_SHOT | TYPE_REPEATING_SLACK
      }
    },
    
    //Windows Specific A'La MSN Messenger Notification Window
    notifyWindows: function (numberNew) {
        var title = "This is the Title"; //Needs to be localized
        var msg = "This is the Message";//Needs to be localized
      try {
        this.alertService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
        //void showAlertNotification(in AString  imageUrl, in AString  title, in AString  text, in boolean  textClickable, in AString  cookie, in nsIObserver alertListener);
        this.alertService.showAlertNotification("chrome://performancing/skin/scribefire-icon-32x32.png", title, msg, true, "", this);
      }catch (e){}
      this.playNotifySounds();
    },
    
    //See: http://lxr.mozilla.org/aviary101branch/source/mail/components/prefwindow/content/pref-mailnews.js#162
    playNotifySounds: function () {
        try{
          this.printLog("Play a Sound?!");
          // sound notifications -Not Finished
          var soundEnabled = false;
          //soundEnabled = this.prefs.getBoolPref("soundnotif.enabled");
          if (soundEnabled) {
              this.printLog("Yes Sound is enabled!!");
              var soundUrl =  this.prefs.getCharPref("soundnotif.uri");
              var soundComponent = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
              if (soundUrl.indexOf("file://") == -1) {// Not on file system, so must be a system sound.
                  this.printLog("Play a SYSTEM Sound?!");
                  soundComponent.playSystemSound(soundUrl);
              } else {
                  this.printLog("Play a NORMAL Sound!");
                  /*soundUrl = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURL);
                  soundUrl.spec = this.soundUri;
                  soundComponent.play(soundUrl)*/
                  var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                  var soundUrl = ioService.newURI(soundUrl, null, null);
                  soundComponent.play(soundUrl)
              }
           }
        }catch(e){
            this.printLog("Failed to play sound: "+ soundUrl);
        }
    },
    
    performancingSendUpdateNotifications: function (aTopic, aData) {
        //Here we call the observers to update the UI
        this.printLog("Do Notification aTopic: " + aTopic + " aData: " + aData);
        this._observerService.notifyObservers(null,
                                              aTopic,
                                              aData);
    },
    
    observe: function(aSubject, aTopic, aData) {
        if(aTopic == "nsPref:changed"){//If Pref changes (performancing.*), do something
             //this.printLog("A Pref has changed");
             
        }else if(aTopic == "xpcom-startup"){
            this._observerService.addObserver(this, "quit-application", false);
        }else if(aTopic == "quit-application"){
            //Application is quitting baby
            this.onAppClose();
        }
    }
    // ** END Private Functions **
    
}

//********************* Module code *************************

var gPerformancingModule = {
    CID: Components.ID("{f1ef9251-84a0-4d52-8e57-50e3c4a01a69}"),
    contractID: "@performancing.com/performancing/PerformancingService;1",
    className: "ScribeFire Service",

    firstTime: true,

    registerSelf: function (aCompMgr, aFileSpec, aLocation, aType) {
        if (this.firstTime) {
            this.firstTime = false;
            throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
        }
    
        aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        aCompMgr.registerFactoryLocation(this.CID, this.className, this.contractID,
                                       aFileSpec, aLocation, aType);
    },
    
    unregisterSelf: function (aCompMgr, aFileSpec, aLocation) {
    
        aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        aCompMgr.unregisterFactoryLocation(this.CID, this.className);
    },
    
    getClassObject: function (aCompMgr, aCID, aIID) {
        if (!aIID.equals(Components.interfaces.nsIFactory))
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

        if (!aCID.equals(this.CID)) 
            throw Components.results.NS_ERROR_NO_INTERFACE;

        return this.factory;
    },

    factory: {
        createInstance: function (outer, iid) {
            if (outer != null)
                throw Components.results.NS_ERROR_NO_AGGREGATION;

            return (new nsPerformancingService()).QueryInterface(iid);
        }
    },
 
    canUnload: function(compMgr) {
      return true;
    }
};

function NSGetModule(compMgr, fileSpec) { 
    return gPerformancingModule; 
}
