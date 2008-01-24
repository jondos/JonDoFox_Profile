({
  "0.7": function upgrade_0_7_0() { return "0.7.1"; },
  "0.7.1": function upgrade_0_7_1() {
   
    //loop through the items
    for (var id in comp._items) {
      var item = comp._items[id]; 
      
      //add new prefs
      item.setProperty("radar.cache", "");
      item.setProperty("radar.panel.enabled", true);
      item.setProperty("radar.panel.display", 0);
      item.setProperty("radar.panel.label", "chrome://forecastfox/locale/forecastfox.properties"); 
      item.setProperty("radar.tooltip.enabled", true);
      item.setProperty("radar.tooltip.display", 0);
      item.setProperty("radar.tooltip.label", "chrome://forecastfox/locale/forecastfox.properties"); 
      item.setProperty("swa.panel.enabled", true);
      item.setProperty("swa.panel.display", 0);
      item.setProperty("swa.panel.label", "chrome://forecastfox/locale/forecastfox.properties"); 
      item.setProperty("swa.tooltip.enabled", true);
      item.setProperty("swa.tooltip.display", 2);
      item.setProperty("swa.tooltip.label", "chrome://forecastfox/locale/forecastfox.properties");             
      item.setProperty("swa.slider.enabled", true);
      item.setProperty("swa.slider.display", 1);
      item.setProperty("swa.slider.title", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("swa.slider.label", "chrome://forecastfox/locale/forecastfox.properties");  
      
      //reset location pref
      var value = item.getProperty("general.locid");
      if (value.length != 5)
        item.setProperty("general.locid", "00000");
        
      //delete old prefs
      item.deleteProperty("links.last");
      item.deleteProperty("links.cache");
        
      var properties = item.properties;
      while (properties.hasMore()) {
        var property = properties.getNext();
        
        //clear cache prefs
        if (property.match("cache"))
          item.setProperty(property, "");
        if (property.match("last"))
          item.setProperty(property, "");
        
        //convert label prefs  
        if (property.match("label") || property.match("title")) {
          value = item.getProperty(property);
          if (value.substring(0,3) == "ff.")
            item.setProperty(property, "chrome://forecastfox/locale/forecastfox.properties");
          if (value.substring(0,3) == "wf.")
            item.setProperty(property, "chrome://forecastfox/locale/forecastfox.properties");
        }
      }       
    }
    
    return "0.7.5"; 
  },  
  "0.7.5": function upgrade_0_7_5() { return "0.7.6"; },  
  "0.7.6": function upgrade_0_7_6() { return "0.7.7"; },  
  "0.7.7": function upgrade_0_7_7() { return "0.7.8"; },    
  "0.7.8": function upgrade_0_7_8() { return "0.7.9"; },        
  "0.7.9": function upgrade_0_7_9() {
  
    //loop through the items
    for (var id in comp._items) {
      var item = comp._items[id]; 
      
      //add new prefs 
      item.setProperty("swa.slider.freq", 2);
      item.setProperty("swa.slider.count", 1);
      item.setProperty("general.last", "0");
      item.setProperty("general.cache", "");
      item.setProperty("general.freq", 30);
      
      //delete old prefs
      item.deleteProperty("cc.last");
      item.deleteProperty("cc.cache");
      item.deleteProperty("dayf.last");
      item.deleteProperty("dayf.cache");             
    }
    return "0.8"; 
  },    
  "0.8": function upgrade_0_8_0() { return "0.8.1"; },        
  "0.8.1": function upgrade_0_8_1() { 
  
    //loop through the items
    for (var id in comp._items) {
      var item = comp._items[id]; 
      
      //add new prefs 
      item.setProperty("swa.tooltip.title", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("radar.tooltip.title", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("cc.tooltip.title", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("dayt.tooltip.title", "chrome://forecastfox/locale/forecastfox.properties");    
      item.setProperty("dayf.tooltip.title", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("icons.current", "default");  
    }
    return "0.8.2"; 
  },    
  "0.8.2": function upgrade_0_8_2() {
   
    //loop through the items
    for (var id in comp._items) {
      var item = comp._items[id];
      
      //add new prefs 
      item.setProperty("units.degrees.0", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.degrees.1", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.pressure.0", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.pressure.1", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.temp.0", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.temp.1", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.speed.0", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.speed.1", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.dist.0", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.dist.1", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.precip.0", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.precip.1", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.percent.0", "chrome://forecastfox/locale/forecastfox.properties");
      item.setProperty("units.percent.1", "chrome://forecastfox/locale/forecastfox.properties");
      
      //convert unit prefs   
      item.setProperty("units.current", item.getProperty("units"));
      item.deleteProperty("units");
    }
    return "0.8.5"; 
  },    
  "0.8.5": function upgrade_0_8_5() { 
  
    //clear icons
    comp._dskSvc.clear(TYPE_ICONS, false);
    
    //loop through the items
    for (var id in comp._items) {
      var item = comp._items[id];
      
      //add new prefs 
      item.setProperty("name", id);
      
      //delete old prefs
      item.deleteProperty("profile.switch.delay");
      item.deleteProperty("profile.switch.enabled");
    }
    return "0.9"; 
  },    
  "0.9": function upgrade_0_9_0() { return "0.9.2"; },
  "0.9.2": function upgrade_0_9_2() { return "0.9.3"; },        
  "0.9.3": function upgrade_0_9_3() { 
    
    //clear cache files from the profile directory
    comp._dskSvc.clear(TYPE_PROFILE, true);
    
    //loop through the items
    for (var id in comp._items) {
      var item = comp._items[id];
      
      //remove preference that should have been excluded
      item.deleteProperty("migrated.prefs");
      item.deleteProperty("links.alert");
      item.deleteProperty("links.dialog");
      item.deleteProperty("links.panel");
      item.deleteProperty("links.context");
  
      //remove unused pref
      item.deleteProperty("radar.cache");
      item.deleteProperty("general.cache");
      
      //move delay to its new pref
      item.setProperty("general.delay", item.getProperty("general.freq"));
      item.deleteProperty("general.freq");
      
      //convert uom prefs to label changes 
      
      //function to lookup a converter for a given variable
      function lookupOld(aText) { 
        var converters = { 
          "degrees": ["lat", "lon"],
          "pressure": ["barr"],
          "temp": ["tmp", "flik", "hi", "low", "rlfeelhi", "rlfeellow"],
          "speed": ["windgust", "winds"],
          "dist": ["vis"],
          "precip": ["precip", "rainamnt", "snowamnt"],
          "percent": ["tstorm"]
        }
        for (var converter in converters){
          if (converters[converter].indexOf(aText) != -1)
            return converter;
        }
        return null;
      }
            
      //function to replace a variable with a combined variable uom                
      function replace(aContent) {
      
        //get the current uom
        var units = item.getProperty("units.current");
        if (units.match("chrome://"))
          units = getBundle().GetStringFromName("forecastfox.units.current");
          
        //get the converter for the variable text
        var text = aContent.substring(1, aContent.length -1);          
        var converter = lookupOld(text);
        if (converter == null)
          return aContent;
          
        //get the user setting for the uom & converter
        var setting = item.getProperty("units." + converter + "." + units);
        if (!setting || setting == "none" || setting.match("chrome://"))
          return aContent;
          
        //return combined variable & uom  
        return ("[" + text + "+" + setting.toLowerCase().replace("/", "") + "]");
      }
      
      //looop through the label values
      var names = ["radar.panel.label", "radar.tooltip.title", 
                   "radar.tooltip.label", "swa.panel.label",
                   "swa.tooltip.title", "swa.tooltip.label",
                   "swa.slider.title", "swa.slider.label",
                   "cc.panel.label",  "cc.tooltip.title", 
                   "cc.tooltip.label", "cc.slider.title", 
                   "cc.slider.label", "dayt.panel.label",
                   "dayt.tooltip.title", "dayt.tooltip.label",
                   "dayf.panel.label", "dayf.tooltip.title", 
                   "dayf.tooltip.label" ];
      for (var i=0; i<names.length; i++) {
      
        //get the label
        var label = item.getProperty(names[i]);
        if (label.match("chrome://"))
          label = getBundle().GetStringFromName("forecastfox." + names[i]);
          
        //replace the variables
        label = label.replace(/\[[^\[\]]+\]/g, replace);
        
        //set the property back
        item.setProperty(names[i], label);
      }
          
      //remove the uom prefs
      item.deleteProperty("units.degrees.0");
      item.deleteProperty("units.degrees.1");
      item.deleteProperty("units.pressure.0");
      item.deleteProperty("units.pressure.1");
      item.deleteProperty("units.temp.0");
      item.deleteProperty("units.temp.1");
      item.deleteProperty("units.speed.0");
      item.deleteProperty("units.speed.1");
      item.deleteProperty("units.dist.0");
      item.deleteProperty("units.dist.1");
      item.deleteProperty("units.precip.0");
      item.deleteProperty("units.precip.1");
      item.deleteProperty("units.percent.0");
      item.deleteProperty("units.percent.1");
    }
    
    /**
     * NEEDED FOR NETSCAPE
     * remove the transforms directory
     */ 
    var dir = comp._dskSvc.get("", TYPE_DEFAULTS);
    var file = dir.clone();
    file.append("transforms");
    if (file.exists()) {
      try {
        removeFile(file);
      } catch(e) {}
    }
    
    /**
     * NEEDED FOR NETSCAPE, SEAMONKEY, SUITE
     * remove the components
     */ 
         
    //get the components directory
    dir = getInstallDirectory(["components"]);
    if (!dir.exists())
      dir = getKeyedDirectory("XCurProcD", ["components"], false);
      
    //loop through components
    var comps = ["ffError", "ffParser", "ffPing", "ffProfiles", "ffDisk", 
                 "ffResolver", "ffIconPack", "ffIIconManager", "ffWeb"];    
    for (i=0; i<comps.length; i++) {
      
      //loop through file extensions
      var ext = [".js", ".xpt"];
      for (var j=0; j<ext.length; j++) {
      
        //remove the file
        file = dir.clone();
        file.append(comps[i] + ext[j]);
        if (file.exists()) {
          try {
            removeFile(file);
          } catch(e) {}
        }
      }
    }
    
    /**
     * NEEDED FOR NETSCAPE, SEAMONKEY, SUITE
     * remove the icons directory
     */ 
    dir = comp._dskSvc.get("", TYPE_DEFAULTS);
    file = dir.clone();
    file.append("icons");
    if (file.exists()) {
      try {
        removeFile(file);
      } catch(e) {}
    }
       
    return "0.9.5"; 
  }        
});