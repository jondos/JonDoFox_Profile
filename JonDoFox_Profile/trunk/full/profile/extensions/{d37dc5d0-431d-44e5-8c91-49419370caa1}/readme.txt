LICENCE
=======
FoxClocks extension for Mozilla Firefox/Thunderbird/Sunbird
Copyright (C) 2005-2008 Andy McDonald / www.stemhaus.com

This program is free software; you can redistribute it and/or modify it under 
the terms of the GNU General Public License as published by the Free Software 
Foundation; either version 2 of the License, or (at your option) any later 
version.

This program is distributed in the hope that it will be useful, but WITHOUT 
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should be able to obtain a copy of the GNU General Public License from 
http://www.gnu.org/licenses/gpl.txt; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA


FLAG IMAGES
===========
The flag images in FoxClocks were created by Mark James (famfamfam.com). They are in the public domain.

 
NOTES FOR TRANSLATORS
=====================
GENERAL
Please note that some properties' values have changed from FoxClocks 1.2.xx to FoxClocks 2.0.

FOXCLOCKS.DTD
A few long entity values have pipes ('|') in them - these will be treated as newlines by FoxClocks. Feel
free to move the pipes wherever you like to achieve a reasonable line length.

FOXCLOCKS.PROPERTIES
The options.format.standard.* values determine the formats available in the standard formats dropdown menu in the
options window. Feel free to add or remove any number of standard formats, but make sure the numbers at the
end of the property names are continuous and start from 0 (eg options.format.standard.0, options.format.standard.1,
options.format.standard.3 is not ok).

The options.format.custom.*.value properties determine the 'special' values that can be entered as part of a custom
format (e.g. in English, <d-s> will expand to the short form of the current day). Feel free to translate these
however you like (in French the the corresponding property is <j-ab>), but make sure to use these values in the
options.format.standard.* properties and in the properties in defaults.properties.

DEFAULTS.PROPERTIES
defaults.properties contains localised default parameters.extensions.{d37dc5d0-431d-44e5-8c91-49419370caa1}.description
is the extension description appearing in the application's Extensions/Add-ons window The foxclocks.format.* values
determine the default format parameters for the statusbar clock, statusbar clock tooltip etc. They also determine
the initial set-up of the drop-down menus in the options window: please make sure that the foxclocks.format.*.standard
values correspond to one of the options.format.standard.* values in foxclocks.properties; but note that FoxClocks will
prepend the location placeholder, a colon and a space ('<l>: ' in English) to standard formats when applied to the
statusbar/toolbar clocks

ZONEPICKER.XML
Hopefully zonepicker.xml is self-explanatory. zonepicker.xml describes the *shape* of the zonepicker. NB do NOT translate
the value of the attribute zone_id (eg "Europe/London")

TESTING
Please test every window:
	main FoxClocks window
	about window
	options window
	welcome window (set the param extensions.{d37dc5d0-431d-44e5-8c91-49419370caa1}.prevrun.version
		to the default value (empty string) and restart)
	update window (set the param extensions.{d37dc5d0-431d-44e5-8c91-49419370caa1}.prevrun.version
		to e.g. 1.0 and restart)
	zoneinfo window (double-click on a location in the watchlist or a zone in the zone picker)
	various alerts (import/export, etc)

PROBLEMS
FoxClocks logs to the Error Console (called JavaScript Console prior to Firefox 2), under the 'Messages' category.
You can increase the amount of logging by setting the (hidden) parameter foxclocks.logging.level to 0 (DEBUG). Also,
don't hesitate to contact us: see http://www.stemhaus.com/firefox/foxclocks/#Contact

OTHER 
I'd really appreciate it if translated files could retain the copyright notice and spacing of the originals, but
I realise this isn't always possible.

Thanks,
Andy McDonald