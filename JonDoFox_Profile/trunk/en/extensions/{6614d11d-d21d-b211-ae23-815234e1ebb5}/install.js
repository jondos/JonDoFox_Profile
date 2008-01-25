

const APP_DISPLAY_NAME    = "Dr.Web anti-virus link checker";
const APP_NAME            = "drweb";
const APP_PACKAGE         = "/drwebltd/drweb";
const APP_VERSION         = "1.0.15";

const localeList =  new Array( "en-US", "fr-FR", "lt-LT", "pl-PL", "pt-PT", "ru-RU", "sk-SK", "de-DE", "it-IT", "ja-JP", "ua-UA" );

const APP_JAR_FILE        = "drweb.jar";
const APP_CONTENT_FOLDER  = "content/";

const APP_SUCCESS_MESSAGE = "New menu item will appear in the link context menu.\n\n";

var chromef, chromeFlag;

initInstall(APP_NAME, APP_PACKAGE, APP_VERSION);

chromef = getFolder("Profile", "chrome");
chromeFlag = PROFILE_CHROME;

setPackageFolder(chromef);
var err = addFile("Doctor Web, Ltd.", APP_VERSION, "chrome/" + APP_JAR_FILE, chromef, null);

if (err == SUCCESS) 
{ 
	var jar = getFolder(chromef, APP_JAR_FILE);

	registerChrome(CONTENT | chromeFlag, jar, APP_CONTENT_FOLDER);

	for ( var i = 0; i < localeList.length; ++i)
	{
		var localeFolder = "locale/" + localeList[i] + "/drweb/";
		var rcres = registerChrome(Install.LOCALE  | chromeFlag, jar, localeFolder);
	}	

	err = performInstall();

	if(err == SUCCESS || err == 999) 
	{
		alert(APP_NAME + " " + APP_VERSION + " has been succesfully installed.\n"
			+APP_SUCCESS_MESSAGE
			+"Please restart your browser before continuing.");
	} 
	else 
   	{ 
		alert("Install failed. Error code:" + err);
		cancelInstall(err);
	}
} 
else 
{
	alert("Failed to create " +APP_JAR_FILE +"\n"
		+"You probably don't have appropriate permissions \n"
		+"(write access to phoenix/chrome directory). \n");
	cancelInstall(err);
}


