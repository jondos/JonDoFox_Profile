// This code is heavily inspired by Chris Pederick (useragentswitcher) install.js
var contentFlag         = CONTENT | PROFILE_CHROME;
var localeFlag          = LOCALE | PROFILE_CHROME;
var skinFlag            = SKIN | PROFILE_CHROME;

var displayName         = "Mozilla Calculator"; // The name displayed to the user (don't include the version)
var version             = "1.1.12";

var name                = "calculator"; // The leafname of the JAR file (without the .jar part)
var jarName             = name + ".jar";
var jarFolder           = "content/" // + name + "/"

var error               = null;

var folder              = getFolder("Profile", "chrome");
var prefFolder          = getFolder(getFolder("Program", "defaults"), "pref");

var existsInApplication = File.exists(getFolder(getFolder("chrome"), jarName));
var existsInProfile     = File.exists(getFolder(folder, jarName));

var locales             = new Array( "en-US", "it-IT", "fr-FR", "es-ES", "de-DE", "ja-JP", "pl-PL", "nl-NL", "tr-TR", "ru-RU", "sl-SI", "sk-SK", "cs-CZ", "pt-BR", "zh-CN", "az-AZ" );
var skins               = new Array( "classic" );
var prefs               = new Array( "prefs.js" );
var components          = new Array(  );

// Mozilla Suite/Seamonkey stores all pref files in a single directory
// under the application directory.  If the name of the preference file(s)
// is/are not unique enough, you may override other extension preferences.
// set this to true if you need to prevent this.
var disambiguatePrefs   = true;

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
    folder      = getFolder("chrome");
    localeFlag  = LOCALE | DELAYED_CHROME;
    skinFlag    = SKIN | DELAYED_CHROME;
}

initInstall(displayName, name, version);
setPackageFolder(folder);
error = addFile(name, version, "chrome/" + jarName, folder, null);

// If adding the JAR file succeeded
if(error == SUCCESS)
{
    folder = getFolder(folder, jarName);

    registerChrome(contentFlag, folder, jarFolder);
    for (var i = 0; i < locales.length; i++) {
        registerChrome(localeFlag, folder, "locale/" + locales[i] + "/");
    }

    for (var i = 0; i < skins.length; i++) {
        registerChrome(skinFlag, folder, "skin/" + skins[i] + "/");
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
