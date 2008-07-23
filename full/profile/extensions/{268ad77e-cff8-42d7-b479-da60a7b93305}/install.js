const myProductName = "Groowe Search Toolbar";const myChromeName = "groowebar";const myOrgHandle = "groowebar";const myProductRegName = "groowebar";const myProductRegVersion = "1.6.5";const myJarFileName = "groowebar.jar";const mySuccessMessage = "The " + myProductName + " has been successfully installed.\n\nRestart your browser for changes to take effect.";const myErrorMessage = "Install failed!  You probably don't have appropriate permissions (write access to the mozilla/chrome directory)";
// Installation Script
var err = initInstall(myProductName, myProductRegName, myProductRegVersion);logComment("initInstall: " + err);
// fChrome = getFolder("Profile","chrome");
fChrome = getFolder("Chrome");setPackageFolder(fChrome);err = addFile("chrome/" + myJarFileName)
logComment("addFile() returned: " + err);
regErr = registerChrome(PACKAGE | DELAYED_CHROME, getFolder(fChrome, myJarFileName), "content/");regErr = registerChrome(SKIN | DELAYED_CHROME, getFolder(fChrome, myJarFileName), "skin/");regErr = registerChrome(LOCALE | DELAYED_CHROME, getFolder(fChrome, myJarFileName), "locale/en-US/");logComment("regChrome returned: " + regErr);var err = getLastError();
if (err == SUCCESS){  err = performInstall();  if (err == SUCCESS)  {    alert(mySuccessMessage);  }  else  {    // alert(myErrorMessage);    cancelInstall(err)  }}else  cancelInstall(err);