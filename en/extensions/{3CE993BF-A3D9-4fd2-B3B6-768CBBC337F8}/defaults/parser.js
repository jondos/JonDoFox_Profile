({
  targets: {
    "global-0": {name: "global", index: 0, group: "local", path: "./adc:local"},
    "swa-0": {name: "swa", index: 0, group: "swa", path: "./adc:watchwarnareas"},
    "radar-0": {name: "radar", index: 0, group: "radar", path: "."},
    "current-0": {name: "current", index: 0, group: "current", path: "./adc:currentconditions"},
    "days-0": {name: "days", index: 0, group: "forecast", path: "./adc:forecast/adc:day[@number='1']/adc:daytime"},
    "days-1": {name: "days", index: 1, group: "forecast", path: "./adc:forecast/adc:day[@number='2']/adc:daytime"},
    "days-2": {name: "days", index: 2, group: "forecast", path: "./adc:forecast/adc:day[@number='3']/adc:daytime"},
    "days-3": {name: "days", index: 3, group: "forecast", path: "./adc:forecast/adc:day[@number='4']/adc:daytime"},  
    "days-4": {name: "days", index: 4, group: "forecast", path: "./adc:forecast/adc:day[@number='5']/adc:daytime"},
    "days-5": {name: "days", index: 5, group: "forecast", path: "./adc:forecast/adc:day[@number='6']/adc:daytime"},
    "days-6": {name: "days", index: 6, group: "forecast", path: "./adc:forecast/adc:day[@number='7']/adc:daytime"},
    "days-7": {name: "days", index: 7, group: "forecast", path: "./adc:forecast/adc:day[@number='8']/adc:daytime"},
    "days-8": {name: "days", index: 8, group: "forecast", path: "./adc:forecast/adc:day[@number='9']/adc:daytime"}, 
    "nights-0": {name: "nights", index: 0, group: "forecast", path: "./adc:forecast/adc:day[@number='1']/adc:nighttime"},
    "nights-1": {name: "nights", index: 1, group: "forecast", path: "./adc:forecast/adc:day[@number='2']/adc:nighttime"},
    "nights-2": {name: "nights", index: 2, group: "forecast", path: "./adc:forecast/adc:day[@number='3']/adc:nighttime"},
    "nights-3": {name: "nights", index: 3, group: "forecast", path: "./adc:forecast/adc:day[@number='4']/adc:nighttime"},  
    "nights-4": {name: "nights", index: 4, group: "forecast", path: "./adc:forecast/adc:day[@number='5']/adc:nighttime"},
    "nights-5": {name: "nights", index: 5, group: "forecast", path: "./adc:forecast/adc:day[@number='6']/adc:nighttime"},
    "nights-6": {name: "nights", index: 6, group: "forecast", path: "./adc:forecast/adc:day[@number='7']/adc:nighttime"},
    "nights-7": {name: "nights", index: 7, group: "forecast", path: "./adc:forecast/adc:day[@number='8']/adc:nighttime"},
    "nights-8": {name: "nights", index: 8, group: "forecast", path: "./adc:forecast/adc:day[@number='9']/adc:nighttime"}
  },
 
  groups: {
    local: { 
      nl: {name: "nl", type: "Char", calc: "'/n'"},
      prof: {name: "prof", type: "Char", calc: "comp._prfSvc.current.name;"},
      ufdb: {name: "ufdb", type: "Char", path: "./adc:ufdb"},
      city: {name: "city", type: "Char", path: "./adc:city"},
      state: {name: "state", type: "Char", path: "./adc:state"},
      dnam: {name: "dnam", type: "Char", calc: "comp.getValue(aTarget, aIndex, 'city', aConverter) + ', ' + comp.getValue(aTarget, aIndex, 'state', aConverter);"},
      lat: {name: "lat", type: "Int", path: "./adc:lat", conversion: "degrees"},
      lon: {name: "lon", type: "Int", path: "./adc:lon", conversion: "degrees"},
      tm: {name: "tm", type: "Char", path: "./adc:time"},
      dls: {name: "dls", type: "Bool", path: "./adc:gmtdiff/@daylightsavings"},
      gmt: {name: "gmt", type: "Char", path: "./adc:gmtdiff"}    
    },
    swa: {
      icon: {name: "icon", type: "Char", calc: "'swa'", hidden: "true"},
      zone: {name: "zone", type: "Char", path: "@zone"},
      county: {name: "county", type: "Char", path: "@county"},
      active: {name: "active", type: "Bool", path: "@isactive"},
      url: {name: "url", type: "Char", path: "./adc:url", hidden: "true"}
    },
    radar: {
      icon: {name: "icon", type: "Char", calc: "'radar'", hidden: "true"},
      image: {name: "image", type: "Char", path: "./adc:images/adc:radar", hidden: "true"},
      url: {name: "url", type: "Char", path: "./adc:currentconditions/adc:radurl", hidden: "true"}
    },
    current: {
      url: {name: "url", type: "Char", path: "./adc:url", hidden: "true"},
      barr: {name: "barr", type: "Int", path: "./adc:pressure", conversion: "pressure"},
      bardcode: {name: "bardcode", type: "Char", path: "./adc:pressure/@state", hidden: "true" },
      bard: {name: "bard", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);"},
      tmp: {name: "tmp", type: "Int", path: "./adc:temperature", conversion: "temp"},
      flik: {name: "flik", type: "Int", path: "./adc:realfeel", conversion: "temp"},
      hmid: {name: "hmid", type: "Char", path: "./adc:humidity"},
      sunr: {name: "sunr", type: "Char", path: "/adc:adc_database/adc:planets/adc:sun/@rise"},
      suns: {name: "suns", type: "Char", path: "/adc:adc_database/adc:planets/adc:sun/@set"},
      t_en: {name: "t_en", type: "Char", path: "./adc:weathertext", hidden: "true"},
      t: {name: "t", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);"},
      icon: {name: "icon", type: "Char", path: "./adc:weathericon", hidden: "true"},
      windgust: {name: "windgust", type: "Int", path: "./adc:windgusts", conversion: "speed"},
      winds: {name: "winds", type: "Int", path: "./adc:windspeed", conversion: "speed"},
      windt: {name: "windt", type: "Char", path: "./adc:winddirection"},
      vis: {name: "vis", type: "Int", path: "./adc:visibility", conversion: "dist"},
      precip: {name: "precip", type: "Int", path: "./adc:precip", conversion: "precip"},
      uvi: {name: "uvi", type: "Int", path: "./adc:uvindex/@index"},
      uvt: {name: "uvt", type: "Char", path: "./adc:uvindex"},
      moon: {name: "moon", type: "Char", path: "/adc:adc_database/adc:moon/adc:phase[position()=1]"},   
      moontcode: {name: "moontcode", type: "Char", path: "/adc:adc_database/adc:moon/adc:phase[position()=1]/@text", hidden: "true"},         
      moont: {name: "moont", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);"},
      moond: {name: "moond", type: "Char", path: "/adc:adc_database/adc:moon/adc:phase[position()=1]/@date"}, 
      moonr: {name: "moonr", type: "Char", path: "/adc:adc_database/adc:planets/adc:moon/@rise"},
      moons: {name: "moons", type: "Char", path: "/adc:adc_database/adc:planets/adc:moon/@set"},
      tree: {name: "tree", type: "Char", path: "/adc:adc_database/adc:airandpollen/adc:tree"},
      weed: {name: "weed", type: "Char", path: "/adc:adc_database/adc:airandpollen/adc:weed"},
      grass: {name: "grass", type: "Char", path: "/adc:adc_database/adc:airandpollen/adc:grass"},
      mold: {name: "mold", type: "Char", path: "/adc:adc_database/adc:airandpollen/adc:mold"},
      airq: {name: "airq", type: "Char", path: "/adc:adc_database/adc:airandpollen/adc:airquality"},
      airt: {name: "airt", type: "Int", path: "/adc:adc_database/adc:airandpollen/adc:airqualitytype"}
    },
    forecast: {
      tmp: {name: "tmp", alias: "tmp2", type: "Int", calc: "(aTarget == 'days') ? comp.getValue(aTarget, aIndex, 'hi', aConverter) : comp.getValue(aTarget, aIndex, 'low', aConverter);", conversion: "temp"},
      flik: {name: "flik", alias: "flik2", type: "Int", calc: "(aTarget == 'days') ? comp.getValue(aTarget, aIndex, 'rlfeelhi', aConverter) : comp.getValue(aTarget, aIndex, 'rlfeellow', aConverter);", conversion: "temp"},
      part: {name: "part", type: "Char", calc: "(aTarget == 'days') ? comp.bundle.GetStringFromName('ff.parser.part.daytime') : comp.bundle.GetStringFromName('ff.parser.part.nighttime');"},
      partn: {name: "partn", type: "Char", calc: "(aTarget == 'days') ? '' : comp.bundle.GetStringFromName('ff.parser.part.nighttime') + ' ';"},
      url: {name: "url", type: "Char", path: "ancestor::adc:day/adc:url", hidden: "true"},
      numb: {name: "numb", type: "Int", path: "ancestor::adc:day/@number"},
      obsd: {name: "obsd", type: "Char", path: "ancestor::adc:day/adc:obsdate"},
      daycode: {name: "daycode", type: "Char", path: "ancestor::adc:day/adc:daycode", hidden: "true"},
      day: {name: "day", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);" },
      sdaycode: {name: "sdaycode", type: "Char", path: "ancestor::adc:day/adc:daycode", hidden: "true"},
      sday: {name: "sday", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);"},
      sunr: {name: "sunr", type: "Char", path: "ancestor::adc:day/adc:sunrise"},
      suns: {name: "suns", type: "Char", path: "ancestor::adc:day/adc:sunset"},
      t_en: {name: "t_en", type: "Char", path: "./adc:txtshort", hidden: "true"},
      tlong_en: {name: "tlong_en", type: "Char", path: "./adc:txtlong", hidden: "true"},
      t: {name: "t", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);"},
      tlong: {name: "tlong", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);"},
      icon: {name: "icon", type: "Char", path: "./adc:weathericon", hidden: "true"},
      hi: {name: "hi", type: "Int", path: "./adc:hightemperature", conversion: "temp"},
      low: {name: "low", type: "Int", path: "./adc:lowtemperature", conversion: "temp"},
      rlfeelhi: {name: "rlfeelhi", type: "Int", path: "./adc:realfeelhigh", conversion: "temp"},
      rlfeellow: {name: "rlfeellow", type: "Int", path: "./adc:realfeellow", conversion: "temp"},
      windgust: {name: "windgust", type: "Int", path: "./adc:windgust", conversion: "speed"},
      winds: {name: "winds", type: "Int", path: "./adc:windspeed", conversion: "speed"},
      windt: {name: "windt", type: "Char", path: "./adc:winddirection"},
      maxuv: {name: "maxuv", type: "Int", path: "./adc:maxuv"},
      rainamnt: {name: "rainamnt", type: "Int", path: "./adc:rainamount", conversion: "precip"},
      snowamnt: {name: "snowamnt", type: "Int", path: "./adc:snowamount", conversion: "precip"},
      precip: {name: "precip", type: "Int", path: "./adc:precipamount", conversion: "precip"},
      tstorm: {name: "tstorm", type: "Int", path: "./adc:tstormprob", conversion: "percent"},
      moon: {name: "moon", type: "Char", prepath: "ancestor::adc:day/@number", path: "/adc:adc_database/adc:moon/adc:phase[position()=number($PRE)]"},   
      moontcode: {name: "moontcode", type: "Char", prepath: "ancestor::adc:day/@number", path: "/adc:adc_database/adc:moon/adc:phase[position()=number($PRE)]/@text", hidden: "true"},
      moont: {name: "moont", type: "Char", calc: "comp._translate(aTarget, aIndex, aName, aConverter);"},
      moond: {name: "moond", type: "Char", prepath: "ancestor::adc:day/@number", path: "/adc:adc_database/adc:moon/adc:phase[position()=number($PRE)]/@date"}         
    }
  }
});