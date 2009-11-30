// AFM - SeaMonkey support for FoxClocks - thanks to Philip Chee
// =============================================================
//

// This code is heavily inspired by Chris Pederick (useragentswitcher) install.js
// Contributors: Philip Chee, deathburger
//
// Philip Chee: Added installation of prefs, components, and locales.
// deathburger: Refactored to move all changable items to the top of the file.
// Philip Chee: This version is for NON-jar, flat directory structured XPIs.

// Editable Items Begin
var displayName         = "FoxClocks"; // The name displayed to the user (don't include the version)
var version             = "2.5.35"; // AFM - version written in by ant
var name                = "foxclocks"; // The directory name/chrome name to be used

// The following three sets of variables tell this installer script how your
// extension directory structure looks.
// If your jar file contains content/packagename use the second packageDir
// variable. Same rule applies for skinDir and localeDir. I set them up
// independent of each other just in case an extension layout is wacky.
var packageDir           = "/"
//var packageDir           = "/" + name + "/"
var skinDir           = "/"
//var skinDir           = "/" + name + "/"
var localeDir           = "/"
//var localeDir           = "/" + name + "/"

var installDirs         = ["chrome"];
var locales             = ["en-US", "en-GB"];

var skins               = [ "classic" ]; // "modern"
var prefs               = [ "foxclocks-defaults.js" ];
var components          = [
    ["dataupdater.js",      "fcs_dataupdater.js"     ],
    ["engine.js",           "fcs_engine.js"          ],
    ["fcslogger.js",        "fcslogger.js"           ],
    ["prefmanager.js",      "fcs_prefmanager.js"     ],
    ["timeformatter.js",    "fcs_timeformatter.js"   ],
    ["utils.js",            "fcs_utils.js"           ],
    ["watchlistmanager.js", "fcs_watchlistmanager.js"],
    ["zonemanager.js",      "fcs_zonemanager.js"     ]
];

var searchPlugins       = [ ];

 // default data files
var extData             = [ "zones.xml" ];
 // location of these files in the XPI
var extDataSrc          = "data/";
 // Destination for the default data files.
var extDataDest         = getFolder(getFolder(getFolder("Profile", "chrome"), "foxclocks"), "data");

// Mozilla Suite/Seamonkey stores all pref files in a single directory
// under the application directory.  If the name of the preference file(s)
// is/are not unique enough, you may override other extension preferences.
// set this to true if you need to prevent this.
var disambiguatePrefs   = false;

// Editable Items End

var contentFolder       = "content" + packageDir;
var error               = null;

var folder              = getFolder("Profile", "chrome");
var prefFolder          = getFolder(getFolder("Program", "defaults"), "pref");
var compFolder          = getFolder("Components");
var searchFolder        = getFolder("Plugins");

var existsInApplication = File.exists(getFolder(getFolder("Chrome"), name));

// AFM - this will (harmlessly) always return true after install to either
// Chrome or the user's profile, since zones.xml is created under the user
// profile
//
var existsInProfile     = File.exists(getFolder(folder, name));

var contentFlag         = CONTENT | PROFILE_CHROME;
var localeFlag          = LOCALE | PROFILE_CHROME;
var skinFlag            = SKIN | PROFILE_CHROME;

// If the extension exists in the application folder or it doesn't exist
// in the profile folder and the user doesn't want it installed to the
// profile folder
if(existsInApplication ||
    (!existsInProfile &&
      !confirm( "Do you want to install the " + displayName +
                " extension into your profile folder?\n" +
                "(Cancel will install into the application folder)")))
{
    contentFlag = CONTENT | DELAYED_CHROME;
    folder      = getFolder("Chrome");
    localeFlag  = LOCALE | DELAYED_CHROME;
    skinFlag    = SKIN | DELAYED_CHROME;
}

initInstall(displayName, name, version);
setPackageFolder(folder);

for (var i = 0; i < installDirs.length; i++) {
    error = addDirectory ( name , version , installDirs[i] , getFolder(folder , name), null );
    if(error != SUCCESS) {
        displayError(error);
        cancelInstall(error);
    }
}

// If adding the directory succeeded
if(error == SUCCESS)
{
    folder = getFolder(folder, name);
    registerChrome(contentFlag, getFolder(folder, contentFolder));

    for (var i = 0; i < locales.length; i++) {
        registerChrome(localeFlag, getFolder(folder, "locale/" + locales[i] + localeDir));
    }

    for (var i = 0; i < skins.length; i++) {
        registerChrome(skinFlag, getFolder(folder, "skin/" + skins[i] + skinDir));
    }

    for (var i = 0; i < prefs.length; i++) {
        if (!disambiguatePrefs) {
            addFile(name + " Defaults", version, "defaults/preferences/" + prefs[i],
                prefFolder, prefs[i], true);
        } else {
            addFile(name + " Defaults", version, "defaults/preferences/" + prefs[i],
                prefFolder, name + "-" + prefs[i], true);
        }
    }

    for (var i = 0; i < components.length; i++) {
        addFile(name + " Components", version, "components/" + components[i][0],
            compFolder, components[i][1], true);
    }

    for (var i = 0; i < searchPlugins.length; i++) {
        addFile(name + " searchPlugins", version, "searchplugins/" + searchPlugins[i],
            searchFolder, searchPlugins[i], true);
    }

    for (var i = 0; i < extData.length; i++) {
        addFile(name, version, extDataSrc + extData[i],
            extDataDest, extData[i], true);
    }

    error = performInstall();

    // If the install failed
    if(error != SUCCESS && error != REBOOT_NEEDED)
    {
        displayError(error);
    	cancelInstall(error);
    }
    else
    {
        alert("The installation of the " + displayName + " extension succeeded.");
    }
}
else
{
    displayError(error);
    cancelInstall(error);
}

// Displays the error message to the user
function displayError(error)
{
    // If the error code was -215
    if(error == READ_ONLY)
    {
        alert("The installation of " + displayName +
            " failed.\nOne of the files being overwritten is read-only.");
    }
    // If the error code was -235
    else if(error == INSUFFICIENT_DISK_SPACE)
    {
        alert("The installation of " + displayName +
            " failed.\nThere is insufficient disk space.");
    }
    // If the error code was -239
    else if(error == CHROME_REGISTRY_ERROR)
    {
        alert("The installation of " + displayName +
            " failed.\nChrome registration failed.");
    }
    else
    {
        alert("The installation of " + displayName +
            " failed.\nThe error code is: " + error);
    }
}