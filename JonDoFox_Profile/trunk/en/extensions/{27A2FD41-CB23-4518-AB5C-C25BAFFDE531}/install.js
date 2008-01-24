
const gName			= "Switch Proxies";
const gAuthor		= "Jeremy Gillick";
const gRegKey		= "/JeremyGillick/SwitchProxies";
const gVersion		= "1.4.1";
const gJar			= "switchproxy.jar";

var	error 			= null;
var oFolder			= getFolder("Current User", "chrome");
var iContentFlag	= CONTENT | PROFILE_CHROME;
var iLocaleFlag		= LOCALE | PROFILE_CHROME;

//Install in App or Profile?
var existsInApplication = File.exists(getFolder(getFolder("chrome"), gJar));
var existsInProfile     = File.exists(getFolder(oFolder, gJar));
if(existsInApplication || (!existsInProfile && !confirm("Do you want to install the extension into your profile folder?\n(Cancel will install into the application folder)")))
{
    iContentFlag	= CONTENT | DELAYED_CHROME;
	iLocaleFlag		= LOCALE | DELAYED_CHROME;
    oFolder     	= getFolder("chrome");
}

//Uninstall Existing
if(existsInApplication || existsInProfile)
	uninstall(gRegKey);

//Init
initInstall(gName, gRegKey, gVersion);
setPackageFolder(oFolder);
error = addFile(gAuthor, gVersion, "chrome/"+ gJar, oFolder, null);

//Register
if(error == SUCCESS){

	registerChrome(iContentFlag, getFolder(oFolder, gJar), "content/");
	registerChrome(iLocaleFlag, getFolder(oFolder, gJar), 'locale/cs-CZ/');
	registerChrome(iLocaleFlag, getFolder(oFolder, gJar), 'locale/en-US/');
	registerChrome(iLocaleFlag, getFolder(oFolder, gJar), 'locale/fr-FR/');
	registerChrome(iLocaleFlag, getFolder(oFolder, gJar), 'locale/it-IT/');
	registerChrome(iLocaleFlag, getFolder(oFolder, gJar), 'locale/is-IS/');
	registerChrome(iLocaleFlag, getFolder(oFolder, gJar), 'locale/ja-JP/');
	
	error = performInstall(); //Install
	
	if(error != SUCCESS && error != 999){
		switch(error){
			case -215:
	    	    alert("The installation of the extension failed.\nOne of the files being overwritten is read-only.");
				break;
			case -235:
    	   		alert("The installation of the extension failed.\nThere is insufficient disk space.");
				break;
			default: 
				alert("The installation of the extension failed.\nThe error code is: " + error);
		}
    	cancelInstall(error);
	}
}
else{
	alert("The installation failed.\n" + error);
	cancelInstall(error);
}
