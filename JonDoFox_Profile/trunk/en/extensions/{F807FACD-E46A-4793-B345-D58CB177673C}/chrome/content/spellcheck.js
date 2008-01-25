/*
    Performancing for Firefox Spell Check for Firefox 2.0beta1
    
    A modified version of the JS from textbox.xml since editor's do not inherite spellchecking (why?)
    This spell checking code only works in Firefox 2.0RC1
*/
var gSpelltest = null;

function pffSpellCheck() {
    this.isFx2orGreater = false;
    this.prefs = null;
}

pffSpellCheck.prototype.init = function() {
    var isFX2 = this.isFX2OrGreater();
    if(isFX2){
        var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
        loader.loadSubScript("chrome://global/content/inlineSpellCheckUI.js", this);
    }
}

pffSpellCheck.prototype.isPrefSet = function() {
    var ifPrefTrue = false;
      try{
          return gPerformancingUtil.prefs.getBoolPref("extra.doSpellCheck");
      }catch(e){}
      return true;
}

pffSpellCheck.prototype.isFX2OrGreater = function() {
      var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                        .getService(Components.interfaces.nsIXULAppInfo);
      var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                                   .getService(Components.interfaces.nsIVersionComparator);
      if(versionChecker.compare(appInfo.version, "2.0") >= 0) {
        this.isFx2orGreater = true;
        return true;
      }else{
          this.isFx2orGreater = false;
      }
      return false;
}

pffSpellCheck.prototype.setupTextBoxSpellCheck = function() {
      try{
          this.init();
          if(this.isFx2orGreater && this.isPrefSet() ){
              //Enable spellcheck for the source editor
              var theSourceInput = document.getElementById("performancing-message-source");
              var theEditor = theSourceInput.inputField.QueryInterface(Components.interfaces.nsIDOMNSEditableElement).editor;
              this.InlineSpellCheckerUI.init(theEditor);
              
              this.InlineSpellCheckerUI.mEditor = theEditor;
              this.InlineSpellCheckerUI.mInlineSpellChecker = this.InlineSpellCheckerUI.mEditor.inlineSpellChecker;
              this.InlineSpellCheckerUI.enabled = true;
          }else{
              this._setNoSpellCheckingAllowed();
          }
      }catch(e){}
}

pffSpellCheck.prototype.setupEditorSpellCheck = function() {
    try{
          this.init();
          if(this.isFx2orGreater && this.isPrefSet() ){
              //Enable spellcheck for the rich editor
              if( gTheTabHTMLEditor.isDocumentEditable ){
                  this.InlineSpellCheckerUI.mEditor = gTheTabHTMLEditor;
                  this.InlineSpellCheckerUI.mInlineSpellChecker = this.InlineSpellCheckerUI.mEditor.inlineSpellChecker;
                  this.InlineSpellCheckerUI.enabled = true;
              }
        }else{
            //Hide the menu stuff
            this._setNoSpellCheckingAllowed();
        }
    }catch(e){
    }
}

pffSpellCheck.prototype._delayedInitSpellCheck = function(popupNode){
    
}
    
pffSpellCheck.prototype._doPopupItemEnabling = function(popupNode){
    if(this.isFx2orGreater){
    // -- spell checking --

            // try to find the outer textbox for this box, don't search
            // up too far.
            gSpelltest = popupNode;
            /*
            var textboxElt = popupNode;
            for (var i = 0; i < 5; i ++) {
              if (textboxElt.localName == "editor")
                break;
              textboxElt = textboxElt.parentNode;
            }
            if (textboxElt.tagName != "editor") {
              // can't find it, give up
              this._setNoSpellCheckingAllowed();
              return;
            }
            */
            //var spellui = textboxElt.spellCheckerUI;
            var spellui = this.InlineSpellCheckerUI;
            this.spellui = spellui;

            if (! spellui.canSpellCheck)
            {
              this._setNoSpellCheckingAllowed();
              return;
            }
            
            spellui.initFromEvent(document.popupRangeParent, document.popupRangeOffset);

            var enabled = spellui.enabled;
            document.getElementById("spell-check-enabled").setAttribute("checked", enabled);

            var overMisspelling = spellui.overMisspelling;
            this._setMenuItemVisibility("spell-add-to-dictionary", overMisspelling);
            this._setMenuItemVisibility("spell-suggestions-separator", overMisspelling);

            // suggestion list
            var spellSeparator = document.getElementById("spell-suggestions-separator");
            var numsug = spellui.addSuggestionsToMenu(popupNode, spellSeparator, 5);
            this._setMenuItemVisibility("spell-no-suggestions", overMisspelling && numsug == 0);

            // dictionary list
            var dictmenu = document.getElementById("spell-dictionaries-menu");
            //var dictmenu = document.getElementById("spell-dictionaries");
            var numdicts = spellui.addDictionaryListToMenu(dictmenu, null);
            this._setMenuItemVisibility("spell-dictionaries", enabled && numdicts > 1);
    }
}

pffSpellCheck.prototype._doPopupItemDisabling = function(popupNode){
    if (this.isFx2orGreater && this.spellui) {
            this.spellui.clearSuggestionsFromMenu();
            this.spellui.clearDictionaryListFromMenu();
    }
}

pffSpellCheck.prototype._setMenuItemVisibility = function(anonid, visible){
    try{
        document.getElementById(anonid).hidden = !visible;
    }catch(e){}
}

pffSpellCheck.prototype._setNoSpellCheckingAllowed = function(){
    this._setMenuItemVisibility("spell-no-suggestions", false);
    this._setMenuItemVisibility("spell-check-enabled", false);
    this._setMenuItemVisibility("spell-check-separator", false);
    this._setMenuItemVisibility("spell-add-to-dictionary", false);
    this._setMenuItemVisibility("spell-suggestions-separator", false);
    this._setMenuItemVisibility("spell-dictionaries", false);
}

pffSpellCheck.prototype.addToDictionary = function(){
    try{
        this.spellui.addToDictionary();
    }catch(e){}
}

pffSpellCheck.prototype.toggleEnabled = function(){
    try{
        this.spellui.toggleEnabled();
    }catch(e){}
}

pffSpellCheck.prototype.spellCheckNow = function(){
    this.spellui.mInlineSpellChecker.enableRealTimeSpell = true;
}
pffSpellCheck.prototype.addDictionaries = function(){
    if(!this.prefs){
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    }
    
    var formatter = Components.classes["@mozilla.org/toolkit/URLFormatterService;1"].getService(Components.interfaces.nsIURLFormatter);
    var uri = formatter.formatURLPref("browser.dictionaries.download.url");
    
    var locale = "-";
    try {
      locale = this.prefs.getComplexValue("intl.accept_languages",
                             Components.interfaces.nsIPrefLocalizedString).data;
    }
    catch (e) { }
    
    var version = "-";
    try {
      version = Components.classes["@mozilla.org/xre/app-info;1"]
                         .getService(Components.interfaces.nsIXULAppInfo)
                         .version;
    }
    catch (e) { }
    
    uri = uri.replace(/%LOCALE%/, escape(locale));
    uri = uri.replace(/%VERSION%/, version);
    
    var newWindowPref = this.prefs.getIntPref("browser.link.open_newwindow");
    var where = newWindowPref == 3 ? "tab" : "window";
    
    openUILinkIn(uri, where);
}

pffSpellCheck.prototype.dummy = function(){
    //foo
}



