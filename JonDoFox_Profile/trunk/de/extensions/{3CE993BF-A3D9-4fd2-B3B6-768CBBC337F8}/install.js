/**
 * See license.txt
 */
 
/******************************************************************************
 * Package Constants
 *****************************************************************************/ 
const NAME = "forecastfox";  
const PKG_NAME = "Forecastfox Enhanced";
const PKG_KEY = "/weather/" + NAME;
const PKG_VERSION = "0.9.5.2";

/******************************************************************************
 * Chrome Constants
 *****************************************************************************/
const CHROME_SPACE = 400;
const CHROME_LOCALES = ['en-US', 'bg-BG', 'ca-AD', 'cs-CZ', 'da-DK', 'de-DE', 'es-ES', 'fi-FI', 'fr-FR', 'hu-HU', 'it-IT', 'ko-KR', 'nb-NO', 'nl-NL', 'pl-PL', 'pt-BR', 'ro-RO', 'ru-RU', 'sk-SK', 'sv-SE', 'tr-TR', 'uk-UA', 'zh-CN'];
const CHROME_FOLDER = "chrome";
const CHROME_JAR = NAME + ".jar";
const CHROME_JARFOLDER = "chrome/" + CHROME_JAR;
const CHROME_CONTENT = "content/" + NAME + "/";
const CHROME_SKIN = "skin/classic/" + NAME + "/";
const CHROME_FLAGS = PROFILE_CHROME | DELAYED_CHROME;

/******************************************************************************
 * Defaults Constants
 *****************************************************************************/   
const DEFAULTS_SPACE = 50;
const DEFAULTS_FOLDER = "defaults";
const DEFAULTS_PREFS = "defaults/preferences/" + NAME + ".js"; 

/******************************************************************************
 * XPCOM Constants
 *****************************************************************************/   
const XPCOM_SPACE = 150;
const XPCOM_FOLDER = "components/";
const XPCOM_FILES = ["nsForecastfox.js", "nsForecastfox.xpt"];   
const XPCOM_REG = "defaults/.autoreg";
    
/******************************************************************************
 * Main installation process
 *****************************************************************************/   
var success = performAll();
if (success) {
  Install.performInstall();
  alert(PKG_NAME + " " + PKG_VERSION + " has been installed successfully!\nPlease restart to enable the extension.");  
} else
  Install.cancelInstall();
      
/******************************************************************************
 * Function to do the install processing.
 *
 * @return    SUCCESS if install is successful.
 *****************************************************************************/   
function performAll()
{
  //initialize the install
  var code = Install.initInstall(PKG_NAME, PKG_KEY, PKG_VERSION);
  if (!verifyCode(code))
    return false;
 
  //get the main install folder
  var folder = Install.getFolder("Profile", "extensions/" + "{3CE993BF-A3D9-4fd2-B3B6-768CBBC337F8}");
  
  //install the chrome
  code = performChrome(folder);
  if (!verifyCode(code))
    return false;
    
  //install the defaults
  code = performDefaults(folder);
  if (!verifyCode(code))
    return false;
    
  //install the components
  code = performXPCOM(folder);
  if (!verifyCode(code))
    return false;
    
  //install successful  
  return true;
}
  
/******************************************************************************
 * Function installs the chrome files and registers them.
 * 
 * @param   The main profile folder.
 * @return  SUCCESS if chrome installed.
 *****************************************************************************/   
function performChrome(aFolder)
{
  logComment("Perform Chrome Install: " + aFolder);
    
  //get the chrome folder
  var folder = Install.getFolder(aFolder, CHROME_FOLDER);
  
  //verify the disk space
  var code = verifySpace(folder, DEFAULTS_SPACE);
  if (!verifyCode(code))
    return(code);

  //add the jar file
  code = Install.addFile(PKG_KEY, PKG_VERSION, CHROME_JARFOLDER, folder, null); 
  if (!verifyCode(code))
    return(code);
    
  //register the content url
  folder = Install.getFolder(folder, CHROME_JAR);
  code = Install.registerChrome(CONTENT | CHROME_FLAGS, folder, CHROME_CONTENT);
  if (!verifyCode(code))
    return(code);
    
  //register the skin url
  code = Install.registerChrome(SKIN | CHROME_FLAGS, folder, CHROME_SKIN);
  if (!verifyCode(code))
    return(code);
    
  //register the locale urls
  for (var i=0; i<CHROME_LOCALES.length; i++) {
    var url = "locale/" + CHROME_LOCALES[i] + "/" + NAME + "/";
    code = Install.registerChrome(LOCALE | CHROME_FLAGS, folder, url); 
    if (!verifyCode(code))
      return(code);
  }
  
  return(SUCCESS);
}
  
/******************************************************************************
 * Function installs the defaults.
 * 
 * @param   The main profile folder.
 * @return  SUCCESS if defaults installed.
 *****************************************************************************/   
function performDefaults(aFolder)
{
  logComment("Perform Defaults Install: " + aFolder);
  
  //get the defaults folder
  var folder = Install.getFolder(aFolder, DEFAULTS_FOLDER);
  
  //verify the disk space
  var code = verifySpace(folder, DEFAULTS_SPACE);
  if (!verifyCode(code))
    return(code);
  
  //install the directory
  code = Install.addDirectory(PKG_KEY, PKG_VERSION, DEFAULTS_FOLDER, 
                              folder, null);
  if (!verifyCode(code))
    return(code);
    
  //get the prefs folder
  folder = Install.getFolder("Program", DEFAULTS_FOLDER);
  folder = Install.getFolder(folder, "pref");
  
  //verify the disk space
  code = verifySpace(folder, DEFAULTS_SPACE);
  if (!verifyCode(code))
    return(code);
  
  //install the prefs
  code = Install.addFile(PKG_KEY, PKG_VERSION, DEFAULTS_PREFS, folder, null);
  if (!verifyCode(code))
    return(code);
    
  return(SUCCESS);
}
  
/******************************************************************************
 * Function installs the xpcom components.
 * 
 * @param   The main profile folder.
 * @return  SUCCESS if components installed.
 *****************************************************************************/   
function performXPCOM(aFolder)
{
  logComment("Perform XPCOM Install: " + aFolder);
  
  //get the xpcom folder
  var folder = Install.getFolder("Components");
    
  //verify the disk space
  var code = verifySpace(folder, XPCOM_SPACE);
  if (!verifyCode(code))
    return(code);

  //loop through the components
  for (var i=0; i<XPCOM_FILES.length; i++) {
    
    //install the component
    code = Install.addFile(PKG_KEY, PKG_VERSION, 
                           XPCOM_FOLDER + XPCOM_FILES[i], 
                           folder, null);
    if (!verifyCode(code))
      return(code);
  }
    
  //hack to make sure we register the component
  folder = Install.getFolder("Program");   
  code = Install.addFile(PKG_KEY, PKG_VERSION, XPCOM_REG, folder, null);
  if (!verifyCode(code))
    return(code);
        
  return(SUCCESS);
}

/******************************************************************************
 * Function verifies the operation return code
 * 
 * @param   The return code.
 * @return  True if return code is SUCCESS or REBOOT_NEEDED.
 *****************************************************************************/   
function verifyCode(aCode)
{
  //success code
  if (aCode == SUCCESS)
    return true;
  
  //reboot code
  if (aCode == REBOOT_NEEDED)
    return true;
    
  //error code
  return false; 
}

/******************************************************************************
 * Function verifies disk space in kilobytes.
 * 
 * @param   The directory to verify.
 * @param   The space required in kilobytes.
 * @return  INSUFFICIENT_DISK_SPACE if space is not available else 
 *          SUCCESS is returned
 *****************************************************************************/   
function verifySpace(aFolder, aRequired)
{
  //get the available disk space on the given path
  var available = File.diskSpaceAvailable(aFolder);
  
  //convert the available disk space into kilobytes
  available = parseInt(available / 1024);
  
  // do the verification
  if(available < aRequired) {
    logComment("Insufficient disk space: " + aFolder);
    logComment("  required : " + aRequired + " K");
    logComment("  available: " + available + " K");
    return(INSUFFICIENT_DISK_SPACE);
  }
  return(SUCCESS);
}
