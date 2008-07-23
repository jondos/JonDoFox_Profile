// FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
// Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com
// For licensing terms, please refer to readme.txt in this extension's '.xpi'
// package or its installation directory on your computer.

pref("foxclocks.watchlist", '<Watchlist xmlns="http://www.stemhaus.com/firefox/foxclocks/prefs"><WatchlistItem><Location><Zone id="Europe/London"/><Coordinates latitude="51.475" longitude="-0.3125"/></Location><Style><Statusbar visible="true" showflag="true"><UsualState colour="" bold="false" italic="false" underline="false"/><AlternateState enabled="true" colour="#660000" starttime="1020" endtime="540"/></Statusbar><StatusbarTooltip visible="false"/></Style></WatchlistItem><WatchlistItem><Location><Zone id="America/Los_Angeles"/><Coordinates latitude="34.05222" longitude="-118.24278"/></Location><Style><Statusbar visible="true" showflag="true"><UsualState colour="" bold="false" italic="false" underline="false"/><AlternateState enabled="true" colour="#660000" starttime="1020" endtime="540"/></Statusbar><StatusbarTooltip visible="false"/></Style></WatchlistItem><WatchlistItem><Location><Zone id="Asia/Hong_Kong"/><Coordinates latitude="22.28333" longitude="114.15"/></Location><Style><Statusbar visible="true" showflag="true"><UsualState colour="" bold="false" italic="false" underline="false"/><AlternateState enabled="true" colour="#660000" starttime="1020" endtime="540"/></Statusbar><StatusbarTooltip visible="false"/></Style></WatchlistItem><WatchlistItem><Location><Zone id="Etc/UTC"/></Location><Style><Statusbar visible="true" showflag="false"><UsualState colour="" bold="false" italic="false" underline="true"/><AlternateState enabled="false" colour="" starttime="540" endtime="1020"/></Statusbar><StatusbarTooltip visible="false"/></Style></WatchlistItem><WatchlistItem><Location><Zone id="Africa/Windhoek"/><Coordinates latitude="-22.56667" longitude="17.1"/></Location><Style><Statusbar visible="false" showflag="false"><UsualState colour="" bold="false" italic="false" underline="false"/><AlternateState enabled="false" colour="" starttime="540" endtime="1020"/></Statusbar><StatusbarTooltip visible="true"/></Style></WatchlistItem><WatchlistItem><Location><Zone id="America/Santiago"/><Coordinates latitude="-33.45" longitude="-70.66667"/></Location><Style><Statusbar visible="false" showflag="false"><UsualState colour="" bold="false" italic="false" underline="false"/><AlternateState enabled="false" colour="" starttime="540" endtime="1020"/></Statusbar><StatusbarTooltip visible="true"/></Style></WatchlistItem><WatchlistItem><Location><Zone id="Australia/Perth"/><Coordinates latitude="-31.95" longitude="115.85"/></Location><Style><Statusbar visible="false" showflag="false"><UsualState colour="" bold="false" italic="false" underline="false"/><AlternateState enabled="false" colour="" starttime="540" endtime="1020"/></Statusbar><StatusbarTooltip visible="true"/></Style></WatchlistItem></Watchlist>');

pref("foxclocks.format.clock.standard", "chrome://foxclocks/locale/defaults.properties");
pref("foxclocks.format.clock.custom", "chrome://foxclocks/locale/defaults.properties");
pref("foxclocks.format.tooltip.standard", "chrome://foxclocks/locale/defaults.properties");
pref("foxclocks.format.tooltip.custom", "chrome://foxclocks/locale/defaults.properties");
pref("foxclocks.format.foxclocks.standard", "chrome://foxclocks/locale/defaults.properties");
pref("foxclocks.format.foxclocks.custom", "chrome://foxclocks/locale/defaults.properties");

pref("foxclocks.clock.containertype", "fc-clock-containertype-statusbar");
pref("foxclocks.clock.style", "fc-clock-style-clocks");

// AFM - these two preferences are actually statusbar-specific
//
pref("foxclocks.clock.position.relative", "fc-clock-position-left");
pref("foxclocks.clock.position.specific.hidden", true); // AFM - no UI

// AFM - global clock preferences: fc-per-clock, fc-all-clocks, fc-no-clocks
//
pref("foxclocks.clock.bar.clock.global.showflag", "fc-per-clock"); // AFM - no UI
pref("foxclocks.clock.tooltip.clock.global.showflag", "fc-all-clocks");

pref("foxclocks.clock.bar.clock.new.visible", true);
pref("foxclocks.clock.bar.clock.new.showflag", false);
pref("foxclocks.clock.tooltip.clock.new.visible", true);
pref("foxclocks.clock.tooltip.clock.new.showflag", false); // AFM - no UI

pref("foxclocks.data.update.auto.enabled", false);
pref("foxclocks.data.update.auto.interval", 604800); // AFM - no UI
pref("foxclocks.data.update.auto.alert.enabled", true);
pref("foxclocks.data.update.noserver.updateurl", ""); // AFM - no UI

pref("foxclocks.googleearth.lookat.range", 1000000); // AFM - no UI
pref("foxclocks.logging.tmpfile.enabled", false); // AFM - no UI
pref("foxclocks.logging.level", 1); // AFM - no UI
pref("foxclocks.zonepicker.dataurl", "fc-zonepicker-dataurl-builtin"); // AFM - no UI
pref("foxclocks.toolbar.menuitem.hidden", false);
pref("foxclocks.watchlist.remove.confirm.enabled", true);
pref("foxclocks.sync_xmlhttprequest", false); // AFM - no UI

// AFM - internal prefs - no UI
//
pref("extensions.{d37dc5d0-431d-44e5-8c91-49419370caa1}.description", "chrome://foxclocks/locale/defaults.properties");
pref("extensions.{d37dc5d0-431d-44e5-8c91-49419370caa1}.prevrun.version", "");
pref("extensions.{d37dc5d0-431d-44e5-8c91-49419370caa1}.data.update.prevupdate", 0);