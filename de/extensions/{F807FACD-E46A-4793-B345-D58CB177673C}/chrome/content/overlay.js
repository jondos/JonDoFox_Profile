/* ===================================================================
// All code unless otherwise posted is licensed under the GPL as specified in license.txt
// ===================================================================*/
var gPerFormancingFirstStart = false;
var gPerformancingVersion = "1.4.2";
var gPerformancingVersionUA = "1.4.2";
var gPFFBlogThisText = [false];

function performancing() {
    //Prefs System | http://www.xulplanet.com/references/xpcomref/comps/c_preferencesservice1.html
    // usage: this.prefs.getBoolPref('somevalue') which in prefs will be performancing.somevalue;
    this.prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    this.prefs = this.prefsService.getBranch("performancing.");// Get the "performancing." branch
    
    //Pref obvserver, so any change to a pref will cause a live change. | http://www.xulplanet.com/references/xpcomref/ifaces/nsIPrefBranchInternal.html
    //This will call the 'observe' function below everytime a pref changes.
    this.pbiPref = this.prefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal);
    this.pbiPref.addObserver("", this, false); //Pref Change Observer
    
    //Get Elements
    //We get them here, once, to improve performance
    this.performancing_statusbar_panel = document.getElementById("performancing-statusbar-panel");
    this.performancing_sb_button = document.getElementById("performancing-sb-button");
    
    //Localization Strings
    // All ours strings are localizable, strings used in javascript are found here
    this.stringBundle = document.getElementById("performancingstrings");
    
    //Observers
    this._observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    //this._observerService.addObserver(this, PERFORMANCING_STATE_CHANGED_TOPIC, false);
    /*this._observerService.notifyObservers(null, 
                                                PERFORMANCING_STATE_CHANGED_TOPIC, 
                                                PERFORMANCING_STATE_LOADBLOGS);
    */
    
}

//This is where all the good stuff goes!
performancing.prototype = {
  
  //First thing we do is load prefs.
  init: function() {
    //Get the pref and set defaults
    this.getPrefs();
    this.loadPositionPrefs();
    performancingSetPerFormancingPosition();
    this.logError('Done Loading PerFormancing ')
    //window.setTimeout('gperformancing.silentOpenBottomBar()', 8000, true);
    this.showHideCM();
    
    var appcontent = window.document.getElementById("appcontent");
    if (appcontent) {
        if (!appcontent.performancing) {
            appcontent.performancing = true;
            appcontent.addEventListener("DOMContentLoaded", gperformancing.onPageDomLoad, false);
        }
    }
    
    //gperformancing.openBottomBar()
  },
  
  getLocaleString: function(strName, formattingValues) {
        var str = null;
        try {
            var strbundle = document.getElementById("performancingstrings");
            var strbundleFallback = document.getElementById("performancingstrings-fallback");
            if (formattingValues === undefined) {
                try {
                    str = strbundle.getString(strName);
                } catch(e) {
                    str = strbundleFallback.getString(strName);
                }
            } else {
                try {
                    str = strbundle.getFormattedString(strName, formattingValues);
                } catch(e) {
                    str = strbundleFallback.getFormattedString(strName, formattingValues);
                }
            }
        } catch (err) {
            //this.printLine("Couldn't get string: " + strName);
        }
        return str;
    },
  
  //Get prefs and set UI values 
  getPrefs: function() {
          this.performancing_sb_button.setAttribute('changed', this.prefs.getBoolPref('changed') );
  },
  
  launchSettings: function() {
          window.openDialog('chrome://performancing/content/settings.xul', '_blank', 'chrome,centerscreen,resizable=no,dependent=yes')
  },
  
  launchWindow: function(xulDoc) {
          window.open(xulDoc, '_blank', 'chrome,centerscreen,resizable=yes,titlebar=yes,dependent=no')
  },
  
  launchWindowInTab: function(xulDoc) {
          //window.open(xulDoc, '_blank', 'chrome,centerscreen,resizable=yes,titlebar=yes,dependent=no')
          var editorInTab = gBrowser.addTab(xulDoc);
          getBrowser().selectedTab = editorInTab;
  },
  
  isOpen: function() {
      var theSRC = document.getElementById("perFormancingMidasFrame").getAttribute("src");
      if(theSRC == "chrome://performancing/content/editor.xul"){
          return true;
      }else{
          return false
      }
  },
  
  openBottomBar: function(doOpen) {
          var bottomBar = document.getElementById("performancing-outerbox");
          var performancingSplinter = document.getElementById("performancingSplit");
          //document.getElementById("performancing-topeditor-bar").setAttribute('collapsed', true );
          //document.getElementById("performancing-navbar").setAttribute('collapsed', true );
          //performancing-navbuttons-small
          var isOnBottom = this.prefs.getBoolPref("display.onbottom");
          var isOnRight = false; //Add a pref here
          if(isOnBottom && !gPerFormancingFirstStart && !isOnRight){
              var theContent = document.getElementById("appcontent");
              theContent.appendChild(performancingSplinter);
              theContent.appendChild(bottomBar);
              gPerFormancingFirstStart = true;
              //bottomBar.setAttribute('insertafter', 'content' );
              //performancingSplinter.setAttribute('insertafter', 'content' );
          }else if(isOnRight){ // Prototype Right Side PFF
              var theGrippy = document.getElementById("performancing-grippy");
              theGrippy.setAttribute("style", "");
              bottomBar.setAttribute("width", "200px");
              var theContent = document.getElementById("browser");
              theContent.appendChild(performancingSplinter);
              theContent.appendChild(bottomBar);
              gPerFormancingFirstStart = true;
          }
          
          if(doOpen){
              bottomBar.setAttribute('collapsed', false );
              performancingSplinter.setAttribute('collapsed', false );
          }else{
              bottomBar.setAttribute('collapsed', !bottomBar.collapsed );
              performancingSplinter.setAttribute('collapsed', !performancingSplinter.collapsed );
          }
          document.getElementById("perFormancingMidasFrame").setAttribute("src", "chrome://performancing/content/editor.xul");
          //document.getElementById("performancing-editor-tab").setAttribute('class', 'performancing-navbuttons-small' );
          //document.getElementById("performancing-pageinfo-tab").setAttribute('class', 'performancing-navbuttons-small' );
          //document.getElementById("performancing-notes-tab").setAttribute('class', 'performancing-navbuttons-small' );
          //To access inside of the iframe: document.getElementById("perFormancingMidasFrame").contentDocument
          // i.e: document.getElementById("perFormancingMidasFrame").contentDocument.getElementById("messagesource").value
  },
  
  silentOpenBottomBar: function(){
      var bottomBar = document.getElementById("performancing-outerbox");
      var performancingSplinter = document.getElementById("performancingSplit");
      var isOnBottom = this.prefs.getBoolPref("display.onbottom");
      if(isOnBottom && !gPerFormancingFirstStart){
              var theContent = document.getElementById("appcontent");
              theContent.appendChild(performancingSplinter);
              theContent.appendChild(bottomBar);
              gPerFormancingFirstStart = true;
              //bottomBar.setAttribute('insertafter', 'content' );
              //performancingSplinter.setAttribute('insertafter', 'content' );
              //alert("Dude");
      }
      document.getElementById("perFormancingMidasFrame").setAttribute("src", "chrome://performancing/content/editor.xul");
  },
  
  //performancing-technorati-tab
  onPageDomLoad: function() {
    //Get the pref and set defaults
    try{
        var myIframeWindow = document.getElementById('perFormancingMidasFrame').contentWindow;
        var myIframeWindowDoc = document.getElementById('perFormancingMidasFrame').contentDocument;
        if( myIframeWindowDoc.getElementById('performancing-technorati-tab').getAttribute('selected') == 'true' ){
            myIframeWindow.setTimeout("performancingUI.getPageInfo('technorati')", 1000, true);
        }else if( myIframeWindowDoc.getElementById('performancing-delicious-tab').getAttribute('selected') == 'true' ){
            myIframeWindow.setTimeout("performancingUI.getPageInfo('delicious')", 1000, true);
        }
    }catch(e){
        //foo
    }
  },
  
  someAction: function() {
    //Get the pref and set defaults
    var alertText = this.stringBundle.getString("performancing.someaction");
    alert(alertText);
  },
  
  //Show or hide the Context Menu depending on pref
  showHideCM: function() {
    try{ //Do 'try' in odd case where XUL hasn't initialized yet
        if(this.prefs.getBoolPref('display.hideContextMenu')){ //
            document.getElementById("context-performancing-sep").hidden = true;
            document.getElementById("context-performancing").hidden = true;
        }else{
            document.getElementById("context-performancing-sep").hidden = false;
            document.getElementById("context-performancing").hidden = false;
        }
    }catch(e){
        
    }
  },
  
  /*Observe function, currently only observes changes to preferences*/
  observe: function(aSubject, aTopic, aData) {
        if(aTopic == "nsPref:changed"){//If Pref changes (performancing.*), do something
             this.getPrefs();//Make our changes live
        }else if(aTopic == PERFORMANCING_STATE_CHANGED_TOPIC){
            //this.reloadBlogs();
        }
        
    },
    
  onMenuItemCommand: function() {
       var alertText = this.stringBundle.getString("performancing.someaction");
       alert(alertText);
  },
  
  reloadBlogs: function() {
       var alertText = this.stringBundle.getString("performancing.someaction");
       alert(alertText);
  },
  
  logError: function(amsg) {
       dump(amsg + "\n" );
  },
  
  savePositionPrefs: function( ) {
     // Foo
         try {
           this.prefs.setCharPref("position.parent_element_id", gPerFormancingParentElementID);
           this.makeToolbarItem(gPerFormancingParentElementID);
         } 
         catch (err) {
           this.printLog("\nSetting preference for parent_element_id failed: " + err + "\n");
         }
      
         try {
           this.prefs.setCharPref("position.insert_before_element_id", gPerFormancingInsertBeforeElementId);
         } 
         catch (err) {
           this.printLog("\nSetting preference for insert_before_element_id failed: " + err + "\n");
         }
      
         try {
           this.prefs.setCharPref("position.insert_after_element_id", gPerFormancingInsertAfterElementId);
         } 
         catch (err) {
           this.printLog("\nSetting preference for insert_after_element_id failed: " + err + "\n");
         }
    },
    
    makeToolbarItem: function( aElement ) {
     var pffStatusBar = document.getElementById("performancing-sb-button");
     if(aElement == "nav-bar" || aElement == "mail-bar" ){
         pffStatusBar.setAttribute("label", "ScribeFire");
         pffStatusBar.setAttribute("class", "performancing-statusbar-button toolbarbutton-1");
      }else{
         pffStatusBar.setAttribute("label", "");
         pffStatusBar.setAttribute("class", "performancing-statusbar-button");
      }
    },
    
    loadPositionPrefs: function() {
         try {
           gPerFormancingParentElementID = this.prefs.getCharPref("position.parent_element_id");
           this.makeToolbarItem(gPerFormancingParentElementID);
         } 
         catch (err) {
           gPerFormancingParentElementID = '';
         }
      
         try {
           gPerFormancingInsertBeforeElementId = this.prefs.getCharPref("position.insert_before_element_id");
         } 
         catch (err) {
           gPerFormancingInsertBeforeElementId = '';
         }
      
         try {
           gPerFormancingInsertAfterElementId = this.prefs.getCharPref("position.insert_after_element_id");
         } 
         catch (err) {
           gPerFormancingInsertAfterElementId = '';
         }
    }
  
}

//Initialize our object.
var gperformancing = null;
function onPerFormancingLoad() {
    try {
        gperformancing = new performancing();
        gperformancing.logError('Loading PerFormancing'); //Debuging window, see kb.mozilla.org on how to set up firefox for debug windows.
    } catch(e) { alert(e); }
    gperformancing.init();//Load Prefs
}


//STATUSBUTTON POSITION
// ***Declare Globar Variables for Drag and Drop***
var gPerFormancingCurrentDropTarget = null;
// the id of the DOM element to position PerFormancing at:
var gPerFormancingParentElementID = "";

// the id of the DOM element to insert PerFormancing before
// if equals to the parent ID, insert as the last child:
var gPerFormancingInsertBeforeElementId = "";
// if the insert before fails, try inserting after this one:
var gPerFormancingInsertAfterElementId = "";


//Make sure we load on start-up of browser.
window.addEventListener('load', onPerFormancingLoad, false); 
