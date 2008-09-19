;Copyright 2007-2008 Jondos GmbH

;Developer Philipp Kaplycz

;p.kaplycz@jondos.de

;Website: http://www.jondos.de/


# Use this for debug:
#
##############################################
# StrCmp $DEBUG 1 0 +3
# StrCpy $DEBUGVALUE YourValue
# Call DebugOutput
##############################################

;=== BEGIN: BASIC INFORMATION
!define NAME "JonDoFox"
!define SHORTNAME "FirefoxPortable"
!define VERSION "2.0.2.0"
!define FILENAME "JonDoFox"
!define CHECKRUNNING "JonDoFoxPortable.exe"
!define CLOSENAME "JonDoFox, Portable Edition"
!define ADDONSDIRECTORYPRESERVE "App\firefox\plugins"
!define INSTALLERVERSION "1.0.0.0"
!define INSTALLERCOMMENTS "For additional details, visit jondos.de" ; changed by JonDos GmbH 2008
!define INSTALLERADDITIONALTRADEMARKS "Firefox is a Trademark of The Mozilla Foundation. " ;end this entry with a period and a space if used
!define INSTALLERLEGALCOPYRIGHT "JonDos GmbH"
!define LICENSEAGREEMENT "eula.rtf"
; NOTE: For no license agreement, comment out the above line by placing a semicolon at the start of it
;=== END: BASIC INFORMATION


Var /GLOBAL FFInstalled
Var /GLOBAL UserAbort
Var /GLOBAL Error
Var /GLOBAL PathSelectionText

Var /GLOBAL ProfilePath
Var /GLOBAL ProfileExtensionPath

Var /GLOBAL ProgramPath

Var /GLOBAL Update
Var /GLOBAL IsJonDoFox
Var /GLOBAL PrefsFileHandle
Var /GLOBAL i


Var /GLOBAL DEBUG          # Set to 1 to get debug messages; see .onInit
Var /GLOBAL DEBUGVALUE     # Set this value and call DebugOutput to get debug-infos

Var /GLOBAL PORTABLEINSTALL
Var /GLOBAL PROGRAMINSTALL

Var /GLOBAL IsRoot
Var /GLOBAL InstDirOkay

Var /GLOBAL ExtensionGUID
Var /GLOBAL ExtensionName

Var /GLOBAL varMakeUserAdministrator

Var /GLOBAL varReload

Var /GLOBAL varSystemTEMP

Var /GLOBAL varPortableAppsPath

Var /GLOBAL varFOUNDPORTABLEAPPSPATH

Var /GLOBAL varAskAgain

;=== Runtime Switches
SetCompress Auto
SetCompressor /SOLID lzma
SetCompressorDictSize 32
#SetCompress Off
SetDatablockOptimize On
CRCCheck on
AutoCloseWindow True
RequestExecutionLevel user


# Installer attributes
XPStyle on
ShowInstDetails show

;=== Program Details
Name "${NAME}"
OutFile "..\..\..\${FILENAME}.paf.exe"
InstallDir "$PROFILE\${SHORTNAME}\"
Caption "${NAME}"
VIProductVersion "${VERSION}"
VIAddVersionKey ProductName "${NAME}"
VIAddVersionKey Comments "${INSTALLERCOMMENTS}"
VIAddVersionKey CompanyName "JonDos GmbH"  ; changed by JonDos GmbH 2008
VIAddVersionKey LegalCopyright "${INSTALLERLEGALCOPYRIGHT}"
VIAddVersionKey FileDescription "${NAME}"
VIAddVersionKey FileVersion "${VERSION}"
VIAddVersionKey ProductVersion "${VERSION}"
VIAddVersionKey InternalName "${NAME}"
VIAddVersionKey LegalTrademarks "${INSTALLERADDITIONALTRADEMARKS}PortableApps.com is a Trademark of Rare Ideas, LLC. JonDo is a trademark of JonDos GmbH."
VIAddVersionKey OriginalFilename "${FILENAME}.paf.exe"
VIAddVersionKey JonDoFoxInstallerVersion "${INSTALLERVERSION}"



# MUI defines
#!define MUI_ICON "..\..\App\AppInfo\appicon.ico"
!define MUI_ICON "appicon.ico"

!define MUI_CUSTOMFUNCTION_GUIINIT CustomGUIInit
!define MUI_COMPONENTSPAGE_SMALLDESC

; MUI Settings / Icons
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\orange-uninstall.ico"

; MUI Settings / Header
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_LEFT
#!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\nsis.bmp"
!define MUI_HEADERIMAGE_BITMAP "blau2.bmp"
!define MUI_HEADERIMAGE_UNBITMAP "${NSISDIR}\Contrib\Graphics\Header\orange-uninstall-r.bmp"

; MUI Settings / Wizard
#!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\blau.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "blau.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange-uninstall.bmp"

# Included files
!include Sections.nsh
!include MUI.nsh
!include FileFunc.nsh
!include UAC.nsh
!include ReplaceSubStr.nsh
!include RemoveFilesAndSubDirs.nsh


!insertmacro GetOptions
!insertmacro GetFileAttributes
!insertmacro GetParent
!insertmacro GetDrives

# Reserved Files
ReserveFile "${NSISDIR}\Plugins\BGImage.dll"

###############################
!macro SecUnSelect SecId
  SectionSetFlags ${SecId} 0
!macroend

!define UnSelectSection '!insertmacro SecUnSelect'
###################################


# Installer pages
!define MUI_PAGE_CUSTOMFUNCTION_PRE WelcomePre
!insertmacro MUI_PAGE_WELCOME

!define MUI_PAGE_CUSTOMFUNCTION_PRE LicencePre
!insertmacro MUI_PAGE_LICENSE EULA.rtf

!define MUI_PAGE_CUSTOMFUNCTION_PRE comPre
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE comPost
!insertmacro MUI_PAGE_COMPONENTS


!define MUI_PAGE_CUSTOMFUNCTION_PRE dirPre
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE dirPost
!define MUI_DIRECTORYPAGE_TEXT_TOP $PathSelectionText
!insertmacro MUI_PAGE_DIRECTORY


#!define MUI_PAGE_CUSTOMFUNCTION_PRE instPre
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE EditProfilesIni
!insertmacro MUI_PAGE_INSTFILES


!define MUI_PAGE_CUSTOMFUNCTION_LEAVE FinishedInstall
!insertmacro MUI_PAGE_FINISH


# Installer languages
!insertmacro MUI_LANGUAGE "German"
!insertmacro MUI_LANGUAGE "English"
!include JonDoFox-Lang-English.nsh
!include JonDoFox-Lang-German.nsh

##======================================================================================================================================================
##                                                                           JFPortable
##======================================================================================================================================================


insttype $(InstTypeComplete)                 # 1
insttype $(InstTypeLite)                     # 2
insttype $(InstTypeProfileComplete)          # 3
insttype $(InstTypeProfileLite)              # 4


Section $(JonDoFox) JFPortable
SectionIn 1 2

        Call CheckUserAbort

        SetOutPath $ProgramPath
        SetOverwrite on

        ############################################################################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "JFPortable$\nPath: $OUTDIR"
        Call DebugOutput
        ############################################################################################

        File /r /x .svn "..\..\*.*"
        
SectionEnd

Section /o -english JFPortableEnglish

        SetOutPath $ProgramPath
        SetOverwrite on

        ############################################################################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "English$\nPath: $OUTDIR"
        Call DebugOutput
        ############################################################################################

        File /r /x .svn "..\..\..\FirefoxByLanguage\enFirefoxPortablePatch\*.*"

SectionEnd

Section /o -german  JFPortableGerman

        SetOutPath $ProgramPath
        SetOverwrite on

        ############################################################################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "German$\nPath: $OUTDIR"
        Call DebugOutput
        ############################################################################################

        File /r /x .svn "..\..\..\FirefoxByLanguage\deFirefoxPortablePatch\*.*"

SectionEnd

##======================================================================================================================================================
##                                                                           Profile
##======================================================================================================================================================


Section - ProfileCore
SectionIn 1 2 3 4

        Call CheckUserAbort

        SetOutPath $ProfilePath
        SetOverwrite on

        ############################################################################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "Core$\nPath: $OUTDIR"
        Call DebugOutput
        ############################################################################################

        File /r /x .svn /x extensions "..\..\..\full\profile\*.*"

SectionEnd


Section /o - ProfileCoreUpdate              #Update

        Call CheckUserAbort

        SetOutPath $ProfilePath
        SetOverwrite on
        
        ############################################################################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "CoreUPDATE$\nPath: $OUTDIR"
        Call DebugOutput
        ############################################################################################

        File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\*.*"

SectionEnd

        
##======================================================================================================================================================
##                                                                           Required Extensions
##======================================================================================================================================================


SectionGroup /e $(JonDoFoxProfile) ProfileGroup

        Section "Adblock Plus" AdblockPlus
        SectionIn 1 2 3 4
                StrCpy $ExtensionGUID "{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}"
                StrCpy $ExtensionName "Adblock Plus"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}\*.*"

        SectionEnd


        Section "Adblock Plus: Element Hiding Helper" AdblockPlusEHH
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "elemhidehelper@adblockplus.org"
                StrCpy $ExtensionName "Adblock Plus: Element Hiding Helper"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\elemhidehelper@adblockplus.org\*.*"
        
        SectionEnd


        Section "CS Lite" CSLite
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{00084897-021a-4361-8423-083407a033e0}"
                StrCpy $ExtensionName "CSLite"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{00084897-021a-4361-8423-083407a033e0}\*.*"

        SectionEnd

        Section "DownloadHelper" DownloadHelper
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{b9db16a4-6edc-47ec-a1f4-b86292ed211d}"
                StrCpy $ExtensionName "DownloadHelper"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{b9db16a4-6edc-47ec-a1f4-b86292ed211d}\*.*"

        SectionEnd


        Section "Dr.Web Anti-Virus" DrWebAntiVirus
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{6614d11d-d21d-b211-ae23-815234e1ebb5}"
                StrCpy $ExtensionName "Dr.Web Anti-Virus"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{6614d11d-d21d-b211-ae23-815234e1ebb5}\*.*"

        SectionEnd

        
        Section "DT Whois" DTWhois
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "beysim@beysim.net"
                StrCpy $ExtensionName "DT Whois"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\beysim@beysim.net\*.*"

        SectionEnd


        Section "JonDoFox" JonDoFox
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{437be45a-4114-11dd-b9ab-71d256d89593}"
                StrCpy $ExtensionName "JonDoFox"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{437be45a-4114-11dd-b9ab-71d256d89593}\*.*"

        SectionEnd


        Section "JSView" JSView
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{cf15270e-cf08-4def-b4ea-6a5ac23f3bca}"
                StrCpy $ExtensionName "JSView"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{cf15270e-cf08-4def-b4ea-6a5ac23f3bca}\*.*"

        SectionEnd
        
        Section "Media Pirate" MediaPirate
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{cc265d3d-3f6f-0170-a78b-bbbaef7a868c}"
                StrCpy $ExtensionName "Media Pirate"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{cc265d3d-3f6f-0170-a78b-bbbaef7a868c}\*.*"

        SectionEnd


        Section "Menu Editor" MenuEditor
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{EDA7B1D7-F793-4e03-B074-E6F303317FB0}"
                StrCpy $ExtensionName "Menu Editor"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{EDA7B1D7-F793-4e03-B074-E6F303317FB0}\*.*"

        SectionEnd


        Section "NoScript" NoScript
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{73a6fe31-595d-460b-a920-fcc0f8843232}"
                StrCpy $ExtensionName "NoScript"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{73a6fe31-595d-460b-a920-fcc0f8843232}\*.*"

        SectionEnd


#        Section "RefControl" RefControl
#        SectionIn 1 2 3 4
#
#                StrCpy $ExtensionGUID "{455D905A-D37C-4643-A9E2-F6FEFAA0424A}"
#                StrCpy $ExtensionName "RefControl"
#
#                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
#                SetOverwrite on
#
#                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{455D905A-D37C-4643-A9E2-F6FEFAA0424A}\*.*"
#
#        SectionEnd


        Section "SafeCache" SafeCache
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{670a77c5-010e-4476-a8ce-d09171318839}"
                StrCpy $ExtensionName "SafeCache"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{670a77c5-010e-4476-a8ce-d09171318839}\*.*"

        SectionEnd


#        Section "SwitchProxy Tool" SwitchProxyTool
#        SectionIn 1 2 3 4
#
#                StrCpy $ExtensionGUID "{27A2FD41-CB23-4518-AB5C-C25BAFFDE531}"
#                StrCpy $ExtensionName "SwitchProxy Tool"
#
#                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
#                SetOverwrite on
#
#                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{27A2FD41-CB23-4518-AB5C-C25BAFFDE531}\*.*"
#
#        SectionEnd


        Section "TabRenamizer" TabRenamizer
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{792BDDFE-2E7C-42ed-B18D-18154D2761BD}"
                StrCpy $ExtensionName "TabRenamizer"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{792BDDFE-2E7C-42ed-B18D-18154D2761BD}\*.*"

        SectionEnd

        Section "Temporary Inbox" TemporaryInbox
        SectionIn 1 2 3 4
        
                StrCpy $ExtensionGUID "{ac1e10b8-206d-4746-a18e-0483852dc20b}"
                StrCpy $ExtensionName "Temporary Inbox"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{ac1e10b8-206d-4746-a18e-0483852dc20b}\*.*"

        SectionEnd


##======================================================================================================================================================
##                                                                           Optional Extensions
##======================================================================================================================================================


        Section /o "Add Bookmark Here" AddBookmarkHere
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "abhere2@moztw.org"
                StrCpy $ExtensionName "Add Bookmark Here"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\abhere2@moztw.org\*.*"

        SectionEnd


        Section /o "CacheIT!" CacheIT
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{98449521-9320-4257-aa35-9e1a39c8cbe0}"
                StrCpy $ExtensionName "CacheIT!"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{98449521-9320-4257-aa35-9e1a39c8cbe0}\*.*"

        SectionEnd


        Section /o "Calculator" Calculator
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{AA052FD6-366A-4771-A591-0D8DC551585D}"
                StrCpy $ExtensionName "Calculator"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{AA052FD6-366A-4771-A591-0D8DC551585D}\*.*"

        SectionEnd


        Section /o "ChatZilla" ChatZilla
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{59c81df5-4b7a-477b-912d-4e0fdf64e5f2}"
                StrCpy $ExtensionName "ChatZilla"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{59c81df5-4b7a-477b-912d-4e0fdf64e5f2}\*.*"

        SectionEnd


        
        Section /o "Copy Plain Text" CopyPlainText
        SectionIn 1 3

                StrCpy $ExtensionGUID "{723AAF16-AF1F-4404-A5D7-0BFE39766605}"
                StrCpy $ExtensionName "Copy Plain Text"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{723AAF16-AF1F-4404-A5D7-0BFE39766605}\*.*"

        SectionEnd


        Section /o "CuteMenus - Crystal SVG" CuteMenusCrystalSVG
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{63df8e21-711c-4074-a257-b065cadc28d8}"
                StrCpy $ExtensionName "CuteMenus - Crystal SVG"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{63df8e21-711c-4074-a257-b065cadc28d8}\*.*"

        SectionEnd


        Section /o "Forecastbar Enhanced" ForecastbarEnhanced
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{3CE993BF-A3D9-4fd2-B3B6-768CBBC337F8}"
                StrCpy $ExtensionName "Forecastbar Enhanced"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{3CE993BF-A3D9-4fd2-B3B6-768CBBC337F8}\*.*"

        SectionEnd


        Section /o "FoxClocks" FoxClocks
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{d37dc5d0-431d-44e5-8c91-49419370caa1}"
                StrCpy $ExtensionName "FoxClocks"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{d37dc5d0-431d-44e5-8c91-49419370caa1}\*.*"

        SectionEnd
        

        Section /o "Groowe Search Toolbar" GrooweSearchToolbar
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{268ad77e-cff8-42d7-b479-da60a7b93305}"
                StrCpy $ExtensionName "Groowe Search Toolbar"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{268ad77e-cff8-42d7-b479-da60a7b93305}\*.*"

        SectionEnd



        Section /o "Image Zoom" ImageZoom
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{1A2D0EC4-75F5-4c91-89C4-3656F6E44B68}"
                StrCpy $ExtensionName "Image Zoom"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{1A2D0EC4-75F5-4c91-89C4-3656F6E44B68}\*.*"

        SectionEnd


        Section /o "MR Tech Toolkit" MRTechToolkit
        SectionIn 1 3

                StrCpy $ExtensionGUID "{9669CC8F-B388-42FE-86F4-CB5E7F5A8BDC}"
                StrCpy $ExtensionName "MR Tech Toolkit"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{9669CC8F-B388-42FE-86F4-CB5E7F5A8BDC}\*.*"

        SectionEnd


        Section /o "Plain Text to Link" PlainTexttoLink
        SectionIn 1 3

                StrCpy $ExtensionGUID "{C90B0826-5A17-4970-A5BF-A43D22452E21}"
                StrCpy $ExtensionName "Plain Text to Link"

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{C90B0826-5A17-4970-A5BF-A43D22452E21}\*.*"

        SectionEnd


        Section /o "Sage" Sage
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{a6ca9b3b-5e52-4f47-85d8-cca35bb57596}"
                StrCpy $ExtensionName "Sage"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{a6ca9b3b-5e52-4f47-85d8-cca35bb57596}\*.*"

        SectionEnd


        Section /o "ScribeFire" ScribeFire
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{F807FACD-E46A-4793-B345-D58CB177673C}"
                StrCpy $ExtensionName "ScribeFire"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{F807FACD-E46A-4793-B345-D58CB177673C}\*.*"

        SectionEnd


        Section /o "TinyUrl Creator" TinyUrlCreator
        SectionIn 1 3
        
                StrCpy $ExtensionGUID "{89736E8E-4B14-4042-8C75-AD00B6BD3900}"
                StrCpy $ExtensionName "TinyUrl Creator"

                ############################################################################################
                StrCmp $DEBUG 1 0 +3
                StrCpy $DEBUGVALUE "ProfileCore$\nPath: $OUTDIR"
                Call DebugOutput
                ############################################################################################

                SetOutPath "$ProfileExtensionPath\$ExtensionGUID"
                SetOverwrite on

                File /r /x .svn /x extensions /x places.sqlite /x bookmarks.html "..\..\..\full\profile\extensions\{89736E8E-4B14-4042-8C75-AD00B6BD3900}\*.*"

        SectionEnd
        





SectionGroupEnd

##===========================================================================
## End sections
##===========================================================================

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${JFPortable} $(DescJFPortable)
  !insertmacro MUI_DESCRIPTION_TEXT ${AdblockPlus} $(DescAdblockPlus)
  !insertmacro MUI_DESCRIPTION_TEXT ${AdblockPlusEHH} $(DescAdblockPlusEHH)
  !insertmacro MUI_DESCRIPTION_TEXT ${CSLite} $(DescCSLite)
  !insertmacro MUI_DESCRIPTION_TEXT ${DownloadHelper} $(DescDownloadHelper)
  !insertmacro MUI_DESCRIPTION_TEXT ${DrWebAntiVirus} $(DescDrWebAntiVirus)
  !insertmacro MUI_DESCRIPTION_TEXT ${DTWhois} $(DescDTWhois)
  !insertmacro MUI_DESCRIPTION_TEXT ${JonDoFox} $(DescJonDoFox)
  !insertmacro MUI_DESCRIPTION_TEXT ${JSView} $(DescJSView)
  !insertmacro MUI_DESCRIPTION_TEXT ${MediaPirate} $(DescMediaPirate)
  !insertmacro MUI_DESCRIPTION_TEXT ${MenuEditor} $(DescMenuEditor)
  !insertmacro MUI_DESCRIPTION_TEXT ${NoScript} $(DescNoScript)
#  !insertmacro MUI_DESCRIPTION_TEXT ${RefControl} $(DescRefControl)
  !insertmacro MUI_DESCRIPTION_TEXT ${SafeCache} $(DescSafeCache)
#  !insertmacro MUI_DESCRIPTION_TEXT ${SwitchProxyTool} $(DescSwitchProxyTool)
  !insertmacro MUI_DESCRIPTION_TEXT ${TabRenamizer} $(DescTabRenamizer)
  !insertmacro MUI_DESCRIPTION_TEXT ${TemporaryInbox} $(DescTemporaryInbox)
  !insertmacro MUI_DESCRIPTION_TEXT ${AddBookmarkHere} $(DescAddBookmarkHere)
  !insertmacro MUI_DESCRIPTION_TEXT ${CacheIT} $(DescCacheIT)
  !insertmacro MUI_DESCRIPTION_TEXT ${Calculator} $(DescCalculator)
  !insertmacro MUI_DESCRIPTION_TEXT ${ChatZilla} $(DescChatZilla)
  !insertmacro MUI_DESCRIPTION_TEXT ${CopyPlainText} $(DescCopyPlainText)
  !insertmacro MUI_DESCRIPTION_TEXT ${CuteMenusCrystalSVG} $(DescCuteMenusCrystalSVG)
  !insertmacro MUI_DESCRIPTION_TEXT ${ForecastbarEnhanced} $(DescForecastbarEnhanced)
  !insertmacro MUI_DESCRIPTION_TEXT ${FoxClocks} $(DescFoxClocks)
  !insertmacro MUI_DESCRIPTION_TEXT ${GrooweSearchToolbar} $(DescGrooweSearchToolbar)
  !insertmacro MUI_DESCRIPTION_TEXT ${ImageZoom} $(DescImageZoom)
  !insertmacro MUI_DESCRIPTION_TEXT ${MRTechToolkit} $(DescMRTechToolkit)
  !insertmacro MUI_DESCRIPTION_TEXT ${PlainTexttoLink} $(DescPlainTexttoLink)
  !insertmacro MUI_DESCRIPTION_TEXT ${Sage} $(DescSage)
  !insertmacro MUI_DESCRIPTION_TEXT ${ScribeFire} $(DescScribeFire)
  !insertmacro MUI_DESCRIPTION_TEXT ${TinyUrlCreator} $(DescTinyUrlCreator)  
!insertmacro MUI_FUNCTION_DESCRIPTION_END





##======================================================================================================================================================
##                                                                           Functions
##======================================================================================================================================================


Function CustomGUIInit
            Push $R1
            Push $R2
            BgImage::SetReturn /NOUNLOAD on
            BgImage::SetBg /NOUNLOAD /GRADIENT 255 255 255 255 255 255
            Pop $R1
            Strcmp $R1 success 0 error
            File /oname=$PLUGINSDIR\bgimage.bmp jondofox.bmp

            System::call "user32::GetSystemMetrics(i 0)i.R1"
            System::call "user32::GetSystemMetrics(i 1)i.R2"
            IntOp $R1 $R1 - 800
            IntOp $R1 $R1 / 2
            IntOp $R2 $R2 - 799
            IntOp $R2 $R2 / 2
            BGImage::AddImage /NOUNLOAD $PLUGINSDIR\bgimage.bmp $R1 $R2
            CreateFont $R1 "Times New Roman" 26 700 /ITALIC
            BGImage::AddText /NOUNLOAD "$(^SetupCaption)" $R1 255 255 255 16 8 500 100
            Pop $R1
            Strcmp $R1 success 0 error
            BGImage::Redraw /NOUNLOAD
            Goto done
        error:
            MessageBox MB_OK|MB_ICONSTOP $R1
        done:
            Pop $R2
            Pop $R1
FunctionEnd

Function .onGUIEnd
    BGImage::Destroy
FunctionEnd


##======================================================================================================================================================
##                                                                           .onInit
##======================================================================================================================================================


Function .onInit
        ##############################################
        StrCpy $DEBUG 0
        ##############################################

        ${GetOptions} "$CMDLINE" "/DESTINATION=" $R0

        Call GetSystemTempPath

        ##############################################
        #StrCmp $DEBUG 1 0 +3
        #StrCpy $DEBUGVALUE ".onInit$\nParameter: $R0"
        #Call DebugOutput
        ##############################################

          StrCpy $PORTABLEINSTALL "false"

          ${If} $R0 != ""
                StrCpy $PORTABLEINSTALL "true"
                StrCpy $INSTDIR "$R0${SHORTNAME}"
          ${Else}
                Call SearchPortableApps
                StrCpy $INSTDIR $varPortableAppsPath
          ${EndIf}

          InitPluginsDir
          StrCpy $Error "false"

          Call CheckIsUserTheAdministrator

          # Maybe its a elevated User-Install
          ${If} $IsRoot == "true"

                    Call LoadOptions

                    Call SectionDebug

          ${EndIf}

        ${If} $varReload == "true"
              Goto Reload
        ${EndIf}

        !insertmacro MUI_LANGDLL_DISPLAY

Reload:
FunctionEnd


Function SearchPortableApps

	ClearErrors
	${GetDrives} "HDD+FDD" GetDrivesCallBack
        StrCmp $varFOUNDPORTABLEAPPSPATH "" DefaultDestination
        StrCpy $varPortableAppsPath "$varFOUNDPORTABLEAPPSPATH\${SHORTNAME}"
        Goto done

	DefaultDestination:
		StrCpy $varPortableAppsPath "$PROFILE\${SHORTNAME}\"
done:

FunctionEnd


Function GetDrivesCallBack
	;=== Skip usual floppy letters
	StrCmp $8 "FDD" "" CheckForPortableAppsPath
	StrCmp $9 "A:\" End
	StrCmp $9 "B:\" End

	CheckForPortableAppsPath:
		IfFileExists "$9PortableApps" "" End
			StrCpy $varFOUNDPORTABLEAPPSPATH "$9PortableApps"

	End:
		Push $0
FunctionEnd

##======================================================================================================================================================
##                                                                           .onSelChange
##======================================================================================================================================================

Function .onSelChange

        Call CheckSelected

        Call UnselectOtherGroups
        
FunctionEnd


Function InitSelection

  SectionSetFlags ${JFPortable} 1

  Call RequiredSelections

FunctionEnd


Function RequiredSelections

         IntOp $0 ${SF_SELECTED} | ${SF_RO}
         SectionSetFlags ${AdblockPlus} $0
         SectionSetFlags ${AdblockPlusEHH} $0
         SectionSetFlags ${CSLite} $0
         SectionSetFlags ${DownloadHelper} $0
         SectionSetFlags ${DrWebAntiVirus} $0
         SectionSetFlags ${DTWhois} $0
         SectionSetFlags ${JonDoFox} $0
         SectionSetFlags ${JSView} $0
         SectionSetFlags ${MediaPirate} $0
         SectionSetFlags ${MenuEditor} $0
#         SectionSetFlags ${MRTechToolkit} $0
         SectionSetFlags ${NoScript} $0
#         SectionSetFlags ${RefControl} $0
         SectionSetFlags ${SafeCache} $0
#         SectionSetFlags ${SwitchProxyTool} $0
         SectionSetFlags ${TabRenamizer} $0
         SectionSetFlags ${TemporaryInbox} $0

FunctionEnd


Function CheckSelected

  ${If} $PORTABLEINSTALL == "true"
        SectionSetFlags ${JFPortable} ${SF_SELECTED}
  ${EndIf}

FunctionEnd


Function UnselectOtherGroups

  SectionGetFlags ${JFPortable} $R0
  
  ${If} $R0 == "0"
        SectionSetFlags ${JFPortableGerman} 0
        SectionSetFlags ${JFPortableEnglish} 0
  ${EndIf}

FunctionEnd


Function LanguageSectionControl

        ${If} $LANGUAGE == "1031"          # german

              SectionSetFlags ${JFPortableGerman} 1
              SectionSetFlags ${JFPortableEnglish} 0

        ${ElseIf} $LANGUAGE == "1033"      # english

              SectionSetFlags ${JFPortableEnglish} 1
              SectionSetFlags ${JFPortableGerman} 0

        ${EndIf}

FunctionEnd

Function SectionDebug

        ${If} $DEBUG == 1

                SectionGetFlags ${JFPortable} $R0
                SectionGetFlags ${JFPortableEnglish} $R1
                SectionGetFlags ${JFPortableGerman} $R2
                SectionGetFlags ${ProfileCore} $R3
                SectionGetFlags ${ProfileCoreUpdate} $R4

                SectionGetFlags ${AddBookmarkHere} $0
                SectionGetFlags ${CacheIT} $1
                SectionGetFlags ${Calculator} $2
                SectionGetFlags ${ChatZilla} $3
                SectionGetFlags ${CuteMenusCrystalSVG} $4
                SectionGetFlags ${ForecastbarEnhanced} $5
                SectionGetFlags ${FoxClocks} $6
                SectionGetFlags ${GrooweSearchToolbar} $7
                SectionGetFlags ${ImageZoom} $8
                SectionGetFlags ${Sage} $9
                SectionGetFlags ${ScribeFire} $R5
                SectionGetFlags ${TinyUrlCreator} $R6
                SectionGetFlags ${MRTechToolkit} $R7
                SectionGetFlags ${PlainTexttoLink} $R8
                SectionGetFlags ${CopyPlainText} $R9
                




                StrCpy $DEBUGVALUE "instPre$\n \
                                   FFInstalled: $FFInstalled$\n \
                                   PROGRAMINSTALL: $PROGRAMINSTALL$\n \
                                   JFPortable: $R0$\n \
                                   JFPortableEnglish: $R1$\n \
                                   JFPortableGerman: $R2$\n \
                                   ProfileCore: $R3$\n \
                                   ProfileCoreUpdate: $R4$\n \
                                   AddBookmarkHere: $0$\n \
                                   CacheIT: $1$\n \
                                   Calculator: $2$\n \
                                   ChatZilla: $3$\n \
                                   CuteMenusCrystalSVG: $4$\n \
                                   ForecastbarEnhanced: $5$\n \
                                   FoxClocks: $6$\n \
                                   GrooweSearchToolbar: $7$\n \
                                   ImageZoom: $8$\n \
                                   Sage: $9$\n \
                                   ScribeFire: $R5$\n \
                                   TinyUrlCreator: $R6$\n \
                                   MRTechToolkit: $R7$\n \
                                   PlainTexttoLink: $R8$\n \
                                   CopyPlainText: $R9"

                Call DebugOutput

        ${EndIf}

FunctionEnd




##======================================================================================================================================================
##                                                                           dirPre
##======================================================================================================================================================


Function dirPre                          # 1

        ${If} $varReload == "true"
              Abort
              Goto Reload
        ${EndIf}


        # Check if Portable is selected

                StrCpy $FFInstalled "false"

                SectionGetFlags ${JFPortable} $R0
                IntOp $R0 $R0 & ${SF_SELECTED}

                ${If} $R0 == ${SF_SELECTED}
                        StrCpy $PROGRAMINSTALL "true"
                        Call LanguageSectionControl

                        Goto goon
                ${EndIf}
                
                # Check if Firefox is installed

                StrCpy $PROGRAMINSTALL "false"

                ${If} $PORTABLEINSTALL == "false"
                      ${If} $varAskAgain == "true"
                            Call CheckFirefoxInstalled     # -> 2
                      ${EndIf}
                ${EndIf}

        goon:

                ${If} $FFInstalled == "false"  # Show MUI_PAGE_DIRECTORY, change text

                      ${If} $Error == "false"

                        StrCpy $PathSelectionText $(SelectFirefoxPortable)

                      ${ElseIf} $Error == "true"

                        StrCpy $PathSelectionText $(SelectedFolderInvalid)
                        
                      ${EndIf}
                      
                ${EndIf}

Reload:
FunctionEnd


##======================================================================================================================================================
##                                                                           dirPost
##======================================================================================================================================================


Function dirPost


        ${If} $PROGRAMINSTALL == "true"

              ${If} $IsRoot == "false"

                      Push $INSTDIR
                      Call CheckFolder                                             # CheckFolder

                      ${If} $InstDirOkay == "Read only"
                            StrCpy $Error "true"

                            # Ask for Admin Rights

                            MessageBox MB_ICONQUESTION|MB_YESNO $(YouNeedAdminRights) IDYES yes IDNO no

                            no:
                            StrCpy $varMakeUserAdministrator "false"
                            
                            StrCpy $R9 "0"
                            Call RelGotoPage
                            Abort

                            Goto next

                            yes:
                            StrCpy $varMakeUserAdministrator "true"

                            next:

                      ${EndIf}

                ${EndIf}

        ${ElseIf} $PROGRAMINSTALL == "false"
        
                ${If} $FFInstalled == "false"  # check user select folder

                      ${If} $IsRoot == "false"

                              Push $INSTDIR
                              Call CheckFolder                                             # CheckFolder

                              ${If} $InstDirOkay == "Read only"
                                    StrCpy $Error "true"

                                    # Ask for Admin Rights

                                    MessageBox MB_ICONQUESTION|MB_YESNO $(YouNeedAdminRights) IDYES yes2 IDNO no2

                                    no2:
                                    StrCpy $varMakeUserAdministrator "false"

                                    StrCpy $R9 "0"
                                    Call RelGotoPage
                                    Abort

                                    Goto next2

                                    yes2:
                                    StrCpy $varMakeUserAdministrator "true"

                                    next2:

                              ${EndIf}

                        ${EndIf}

                ${EndIf}

        ${EndIf}

        
        Call instPre

FunctionEnd

##======================================================================================================================================================
##                                                                           .onVerifyInstDir
##======================================================================================================================================================


Function .onVerifyInstDir


        ${If} $PROGRAMINSTALL == "false"                                            # Profile install:

                ${If} $FFInstalled == "false"  # check user select folder

                      # Check Folder

                      IfFileExists $INSTDIR\App\firefox\firefox.exe okay wrong

                      okay:
                            StrCpy $Error "false"

                             Goto done

                      wrong:                            # Folder invalid, back to Folderselection Window
                      

                            StrCpy $Error "true"
                            Abort

                ${EndIf}
                
        ${EndIf}


        done:
        
FunctionEnd

##======================================================================================================================================================
##                                                                           CheckIsUserTheAdministrator
##======================================================================================================================================================

Function CheckIsUserTheAdministrator

        Push $1
        
        # call userInfo plugin to get user info.  The plugin puts the result in the stack
        userInfo::getAccountType

        # pop the result from the stack into $0
        pop $1

##############################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "CheckIsUserTheAdministrator$\n$1"
        Call DebugOutput
##############################################
        
        ${If} $1 == "Admin"

              StrCpy $IsRoot "true"
              
        ${Else}

              StrCpy $IsRoot "false"

        ${EndIf}

        Pop $1

FunctionEnd


##======================================================================================================================================================
##                                                                           MakeUserAdministrator
##======================================================================================================================================================

Function MakeUserAdministrator

         Call SaveOptions

        UAC_Elevate:
            UAC::RunElevated "test"
            StrCmp 1223 $0 UAC_ElevationAborted ; UAC dialog aborted by user?
            StrCmp 0 $0 0 UAC_Err ; Error?
            StrCmp 1 $1 0 UAC_Success ;Are we the real deal or just the wrapper?
            Quit
        UAC_Err:
            MessageBox mb_iconstop "Unable to elevate, error $0"
            Abort

        UAC_ElevationAborted:
            # elevation was aborted, run as normal?
            MessageBox mb_iconstop "This installer requires admin access, aborting!"
            Abort
        UAC_Success:
            StrCmp 1 $3 +4 ;Admin?
            StrCmp 3 $1 0 UAC_ElevationAborted ;Try again?
            MessageBox mb_iconstop "This installer requires admin access, try again"
            goto UAC_Elevate

FunctionEnd

Function .OnInstFailed
    UAC::Unload ;Must call unload!
FunctionEnd

Function .OnInstSuccess
    UAC::Unload ;Must call unload!
FunctionEnd

##======================================================================================================================================================
##                                                                           LoadOptions
##======================================================================================================================================================

Function LoadOptions

Push $R0
        StrCpy $varReload "false"

        IfFileExists "$varSystemTEMP\SelectedOptions.ini" 0 done

        ReadINIStr $INSTDIR $varSystemTEMP\SelectedOptions.ini SelectedOptions ProgramPath
        

        StrCpy $ProgramPath $INSTDIR

        ReadINIStr $ProfilePath $varSystemTEMP\SelectedOptions.ini SelectedOptions ProfilePath

        StrCpy $ProfileExtensionPath "$ProfilePath\extensions"
        
        Call RequiredSelections
        
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions JFPortable
        SectionSetFlags ${JFPortable} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions JFPortableEnglish
        SectionSetFlags ${JFPortableEnglish} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions JFPortableGerman
        SectionSetFlags ${JFPortableGerman} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions ProfileCore
        SectionSetFlags ${ProfileCore} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions ProfileCoreUpdate
        SectionSetFlags ${ProfileCoreUpdate} $R0

        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions AddBookmarkHere
        SectionSetFlags ${AddBookmarkHere} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions CacheIT
        SectionSetFlags ${CacheIT} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions Calculator
        SectionSetFlags ${Calculator} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions ChatZilla
        SectionSetFlags ${ChatZilla} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions CuteMenusCrystalSVG
        SectionSetFlags ${CuteMenusCrystalSVG} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions ForecastbarEnhanced
        SectionSetFlags ${ForecastbarEnhanced} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions FoxClocks
        SectionSetFlags ${FoxClocks} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions GrooweSearchToolbar
        SectionSetFlags ${GrooweSearchToolbar} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions ImageZoom
        SectionSetFlags ${ImageZoom} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions Sage
        SectionSetFlags ${Sage} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions ScribeFire
        SectionSetFlags ${ScribeFire} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions TinyUrlCreator
        SectionSetFlags ${TinyUrlCreator} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions MRTechToolkit
        SectionSetFlags ${MRTechToolkit} $R0
        
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions PlainTexttoLink
        SectionSetFlags ${PlainTexttoLink} $R0
        ReadINIStr $R0 $varSystemTEMP\SelectedOptions.ini SelectedOptions CopyPlainText
        SectionSetFlags ${CopyPlainText} $R0
        
        StrCpy $varReload "true"
        
        Delete "$varSystemTEMP\SelectedOptions.ini"
        
        done:

        Pop $R0

        Call SectionDebug

FunctionEnd



Function GetSystemTempPath

Push $R0

        ReadRegStr $R0 HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment" TEMP

        Push $R0
        Call ParseTempPath
        Pop $R0

        Push $R0
        Call CheckFolder

        ${If} $InstDirOkay == "okay"
              StrCpy $varSystemTEMP $R0
        ${Else}
              StrCpy $varSystemTEMP $TEMP
        ${EndIf}
        
        # Bugfix !! ignore Code above
        StrCpy $varSystemTEMP $TEMP
        
Pop $R0

FunctionEnd



Function ParseTempPath

        Pop $R0

        # %SystemRoot% = C:\Windows = $WINDIR

        !insertmacro ReplaceSubStr $R0 %SystemRoot% $WINDIR

        Push $MODIFIED_STR

FunctionEnd

##======================================================================================================================================================
##                                                                           SaveOptions
##======================================================================================================================================================

Function SaveOptions

        # Check write permissions first

        Push $varSystemTEMP
        Call CheckFolder

        # Delete SelectedOptions.ini if exists
        
        IfFileExists "$varSystemTEMP\SelectedOptions.ini" 0 +2
        Delete "$varSystemTEMP\SelectedOptions.ini"
        
        # Create SelectedOptions.ini
        
        FileOpen $0 "$varSystemTEMP\SelectedOptions.ini" r
        FileClose $0


        # Write SelectedOptions.ini

        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ProgramPath $INSTDIR
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ProfilePath $ProfilePath

        SectionGetFlags ${JFPortable} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions JFPortable $R0

        SectionGetFlags ${JFPortableEnglish} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions JFPortableEnglish $R0

        SectionGetFlags ${JFPortableGerman} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions JFPortableGerman $R0

        SectionGetFlags ${ProfileCore} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ProfileCore $R0

        SectionGetFlags ${ProfileCoreUpdate} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ProfileCoreUpdate $R0


        
        SectionGetFlags ${AddBookmarkHere} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions AddBookmarkHere $R0

        SectionGetFlags ${CacheIT} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions CacheIT $R0

        SectionGetFlags ${Calculator} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions Calculator $R0

        SectionGetFlags ${ChatZilla} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ChatZilla $R0

        SectionGetFlags ${CuteMenusCrystalSVG} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions CuteMenusCrystalSVG $R0
        
        SectionGetFlags ${ForecastbarEnhanced} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ForecastbarEnhanced $R0

        SectionGetFlags ${FoxClocks} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions FoxClocks $R0

        SectionGetFlags ${GrooweSearchToolbar} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions GrooweSearchToolbar $R0

        SectionGetFlags ${ImageZoom} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ImageZoom $R0

        SectionGetFlags ${Sage} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions Sage $R0

        SectionGetFlags ${ScribeFire} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions ScribeFire $R0

        SectionGetFlags ${TinyUrlCreator} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions TinyUrlCreator $R0

        SectionGetFlags ${MRTechToolkit} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions MRTechToolkit $R0
        
        SectionGetFlags ${PlainTexttoLink} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions PlainTexttoLink $R0

        SectionGetFlags ${CopyPlainText} $R0
        WriteINIStr $varSystemTEMP\SelectedOptions.ini SelectedOptions CopyPlainText $R0

#        LockWindow on
        HideWindow


FunctionEnd


##======================================================================================================================================================
##                                                                           CheckFolder
##======================================================================================================================================================


Function CheckFolder

        Pop $0

        Push $R0
        Push $R1
        Push $R2

        StrCpy $R0 $0
        #StrCpy $R0 "$INSTDIR"
        
        StrCpy $R2 "some_unique_name"

        loop:
          StrLen $R1 "$R0"
          StrCmp $R1 0 pathbad
          IfFileExists "$R0" next 0

          Push $0
          Push $R0
          Call isRoot
          Pop $0

          ${If} $0 == "true"
              Pop $0
              Goto next
          ${ElseIf} $0 == "false"
              Pop $0
              Goto parentLoop
          ${EndIf}

        next:
        ${GetFileAttributes} "$R0" "DIRECTORY" $R1
        StrCmp $R1 0 parentLoop
        ${GetFileAttributes} "$R0" "READONLY" $R1
        StrCmp $R1 1 pathbad
        ClearErrors
        IfFileExists "$R0\$R2" pathgood 0
        CreateDirectory "$R0\$R2"
        IfErrors pathbad 0
        RMDir "$R0\$R2"
        Goto pathgood

        parentLoop:

        Push $0

        StrCpy $0 $R0 1 -1       # Append "\"

        ${If} $0 != "\"
              StrCpy $R0 "$R0\"
        ${EndIf}

        ${GetParent} "$R0" "$R0"
        Goto loop

        pathbad:
        StrCpy $InstDirOkay "Read only"
        Goto done

        pathgood:
        StrCpy $InstDirOkay "okay"
        
        Pop $R2
        Pop $R1
        Pop $R0

done:
FunctionEnd



Function CheckFirefoxInstalled            # 2

# Get Firefox Folder from Registry, just to see if it is installed

        ClearErrors
        ReadRegStr $0  HKLM "SOFTWARE\Mozilla\Mozilla Firefox" 'CurrentVersion'

        StrCmp $0 "" NotInstalled 0

        ClearErrors
        ReadRegStr $0  HKLM "SOFTWARE\Mozilla\Mozilla Firefox\$0\Main" 'Install Directory'

# Debug:
        #StrCpy $0 "" # Simulates Firefox not installed

        StrCmp $0 "" 0 Installed

        NotInstalled:
                  StrCpy $FFInstalled "false"
                  Goto ende

        Installed:
        
                  MessageBox MB_ICONQUESTION|MB_YESNO $(FirefoxInstallationDetected) IDYES yes IDNO no

                  no:
                  StrCpy $FFInstalled "false"
                  Goto next
                  
                  yes:
                  StrCpy $FFInstalled "true"

                  # Check if Firefox is running
                  Call CheckFirefoxRunning        # -> 3

                  Call instPre

                  Abort # Dont show MUI_PAGE_DIRECTORY
                  
                  next:
        ende:
        
FunctionEnd



Function CheckFirefoxRunning                    # 3

Start:

      FindProcDLL::FindProc "firefox.exe"

# 0 = Process was not found
# 1 = Process was found
# 605 = Unable to search for process
# 606 = Unable to identify system type
# 607 = Unsupported OS
# 632 = Process name is invalid

        IntCmp $R0 1 is1 is0 morethan1
        is1:
        # Firefox is running
                 ${If} $Error == "true"
                       MessageBox MB_ICONQUESTION|MB_RETRYCANCEL $(CantKillFirefox) IDCANCEL Exit        # Error
                 ${ElseIf} $Error != "true"
                       MessageBox MB_ICONQUESTION|MB_OKCANCEL $(FirefoxDetected) IDCANCEL Exit
                 ${EndIf}

                     KillProcDLL::KillProc "firefox.exe"
                     Sleep 1000

                     # 0 = Process was successfully terminated
                     # 603 = Process was not currently running
                     # 604 = No permission to terminate process
                     # 605 = Unable to load PSAPI.DLL
                     # 602 = Unable to terminate process for some other reason
                     # 606 = Unable to identify system type
                     # 607 = Unsupported OS
                     # 632 = Invalid process name
                     # 700 = Unable to get procedure address from PSAPI.DLL
                     # 701 = Unable to get process list, EnumProcesses failed
                     # 702 = Unable to load KERNEL32.DLL
                     # 703 = Unable to get procedure address from KERNEL32.DLL
                     # 704 = CreateToolhelp32Snapshot failed

                     StrCmp $R0 "1" dead notdead

                     dead:
                          StrCpy $Error "false"
                          Goto Start

                     notdead:
                          StrCpy $Error "true"
          Goto Start
        is0:
        # Everything is fine
          Goto done
        morethan1:
        # System Error, abort
          MessageBox MB_ICONEXCLAMATION|MB_ICONSTOP $(FirefoxDetectedErrorOccured)
          Quit
          
        Exit:
             StrCpy $UserAbort "true"
             Abort

        done:

FunctionEnd


##======================================================================================================================================================
##                                                                           SearchProfileFolder
##======================================================================================================================================================


Function SearchProfileFolder


    IfFileExists $INSTDIR\Data\settings\FirefoxPortableSettings.ini exists 0      # exists ini?


##############################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "SearchProfileFolder$\nexists not$\n$INSTDIR\Data\settings\FirefoxPortableSettings.ini"
        Call DebugOutput
##############################################

    # NO
                 StrCpy $Error ""
                 IfFileExists $INSTDIR\Data\*.* +3 0        # Create Data
                 StrCpy $Error "$INSTDIR\Data\"
                 CreateDirectory $INSTDIR\Data
                 IfErrors createerror

                 StrCpy $Error ""
                 IfFileExists $INSTDIR\Data\settings\*.* +3 0        # Create Data\settings
                 StrCpy $Error "$INSTDIR\Data\settings\"
                 CreateDirectory $INSTDIR\Data\settings
                 IfErrors createerror

                 StrCpy $Error "$INSTDIR\Data\settings\FirefoxPortableSettings.ini"
                 FileOpen $0 $INSTDIR\Data\settings\FirefoxPortableSettings.ini w   # create File
                 FileClose $0
                 IfErrors createerror

                 StrCpy $Error "$INSTDIR\Data\settings\FirefoxPortableSettings.ini" # write profile to ini
                 WriteINIStr $INSTDIR\Data\settings\FirefoxPortableSettings.ini FirefoxPortableSettings LastProfileDirectory $INSTDIR\Data\profile
                 IfErrors writeerror

exists:

##############################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "SearchProfileFolder$\nexists$\n$INSTDIR\Data\settings\FirefoxPortableSettings.ini"
        Call DebugOutput
##############################################

                 StrCpy $Error "$INSTDIR\Data\settings\FirefoxPortableSettings.ini"
                 ReadINIStr $0 $INSTDIR\Data\settings\FirefoxPortableSettings.ini FirefoxPortableSettings LastProfileDirectory          # Get profile directory

##############################################
        StrCmp $DEBUG 1 0 +3
        StrCpy $DEBUGVALUE "SearchProfileFolder$\nLastProfileDirectory:$\n$0"
        Call DebugOutput
##############################################

                 IfErrors INIreaderror INIreadokay

                 INIreaderror:         # This could happen if Firefox-Portable is installed, but never started !!!

                 WriteINIStr $INSTDIR\Data\settings\FirefoxPortableSettings.ini FirefoxPortableSettings LastProfileDirectory $INSTDIR\Data\profile
                 IfErrors writeerror
                 ReadINIStr $0 $INSTDIR\Data\settings\FirefoxPortableSettings.ini FirefoxPortableSettings LastProfileDirectory          # Get profile directory again
                 IfErrors readerror

                 INIreadokay:

                 StrCpy $ProfilePath $0     # Save Profilepath
                 StrCpy $ProfileExtensionPath "$ProfilePath\extensions"
                 StrCpy $Error "false"

                 Goto done

createerror:

                 MessageBox MB_ICONEXCLAMATION|MB_ICONSTOP "Error, Can not create:$\n$Error"
                 Goto done

writeerror:

                 MessageBox MB_ICONEXCLAMATION|MB_ICONSTOP "Error, Can not write:$\n$Error"
                 Goto done

readerror:

                 MessageBox MB_ICONEXCLAMATION|MB_ICONSTOP "Error, Can not read:$\n$Error"
                 Goto done

done:

FunctionEnd


##======================================================================================================================================================
##                                                                           SearchProfileFolderWithoutPermissions
##======================================================================================================================================================


Function SearchProfileFolderWithoutPermissions

         # If writing is denied

    IfFileExists $INSTDIR\Data\settings\FirefoxPortableSettings.ini 0 INIreaderror      # exists ini?
    ReadINIStr $0 $INSTDIR\Data\settings\FirefoxPortableSettings.ini FirefoxPortableSettings LastProfileDirectory          # Get profile directory
    IfErrors INIreaderror INIreadokay
    
    INIreaderror:
    StrCpy $0 $INSTDIR\Data\profile
    
    INIreadokay:
    
    StrCpy $ProfilePath $0     # Save Profilepath
    StrCpy $ProfileExtensionPath "$ProfilePath\extensions"
    StrCpy $Error "false"

FunctionEnd

##======================================================================================================================================================
##                                                                           instPre
##======================================================================================================================================================


Function instPre

        StrCpy $Update "false"

        # Check if Profile exists -> then update only

          ${If} $PROGRAMINSTALL == "false"    # only profile

                  ${If} $FFInstalled == "true"

                        # Check if folder "JonDoFox" exists
                        # if yes, update only
                        # else normal install

                        StrCpy $ProfilePath "$APPDATA\Mozilla\Firefox\Profiles\JonDoFox"
                        StrCpy $ProfileExtensionPath "$APPDATA\Mozilla\Firefox\Profiles\JonDoFox\extensions"

                        IfFileExists $ProfilePath\*.* update create

                  ${ElseIf} $FFInstalled == "false"

                        ${If} $varMakeUserAdministrator == "true"
                              Call SearchProfileFolderWithoutPermissions
                              Goto done
                        ${Else}
                              Call SearchProfileFolder
                        ${EndIf}

                        IfFileExists $ProfilePath\*.* 0 create

                        # selected firefox is a JonDoFox
                        StrCmp $IsJonDoFox "true" update 0
                        
                        Call Update

                        Goto done

                  ${EndIf}


                  update:

                          StrCpy $Update "true"
                          
                          Call Update
                          
                          Goto done

                  create:

                          CreateDirectory $ProfilePath
                          IfErrors 0 +3
                          MessageBox MB_ICONEXCLAMATION|MB_OK $(CreateFolderError)
                          Quit



        ${ElseIf} $PROGRAMINSTALL == "true"


                  IfFileExists $INSTDIR\App\firefox\firefox.exe update2 install

                  update2:

                         Call SearchProfileFolder

                         StrCpy $ProgramPath $INSTDIR

                         Call Update

                         StrCmp $IsJonDoFox "true" 0 install
                         StrCpy $Update "true"
                         
                         Goto done

                  install:

                          StrCpy $ProgramPath $INSTDIR
                          StrCpy $ProfilePath $INSTDIR\Data\profile
                          StrCpy $ProfileExtensionPath "$ProfilePath\extensions"
                          
        ${EndIF}

done:


        ${If} $Update == "true"
                SectionSetFlags ${ProfileCoreUpdate} 1
                SectionSetFlags ${ProfileCore} 0
        ${Else}
                SectionSetFlags ${ProfileCoreUpdate} 0
                SectionSetFlags ${ProfileCore} 1
        ${EndIf}
        
        Call SectionDebug

        ${If} $varMakeUserAdministrator == "true"
                    Call MakeUserAdministrator
        ${EndIf}

FunctionEnd

##======================================================================================================================================================
##                                                                           Update
##======================================================================================================================================================


Function Update

        Call ParsePrefsJS

        # selected firefox is a JonDoFox
        # StrCmp $IsJonDoFox "true" done BackupBookmarks

        # BackupBookmarks:

        MessageBox MB_ICONINFORMATION|MB_OKCANCEL $(OverwriteProfile) IDCANCEL Exit

        MSIBanner::Show /NOUNLOAD "Backup"

        IfFileExists $ProfilePath\BookmarkBackup\*.* +5
        CreateDirectory $ProfilePath\BookmarkBackup
        IfErrors Error
        CreateDirectory $ProfilePath\BookmarkBackup\bookmarkbackups
        IfErrors Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $ProfilePath\BookmarkBackup\bookmarkbackups\*.* +3
        CreateDirectory $ProfilePath\BookmarkBackup\bookmarkbackups
        IfErrors Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $ProfilePath\BookmarkBackup\bookmarkbackups\bookmarks.html 0 +2
        Goto Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $ProfilePath\BookmarkBackup\bookmarkbackups\places.sqlite 0 +2
        Goto Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $ProfilePath\bookmarks.html 0 +3
        CopyFiles $ProfilePath\bookmarks.html $ProfilePath\BookmarkBackup
        IfErrors Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $ProfilePath\places.sqlite 0 +3
        CopyFiles $ProfilePath\places.sqlite $ProfilePath\BookmarkBackup
        IfErrors Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $ProfilePath\bookmarkbackups\*.* 0 +3
        CopyFiles $ProfilePath\bookmarkbackups\*.* $ProfilePath\BookmarkBackup\bookmarkbackups
        IfErrors Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $varSystemTEMP\BookmarkBackup\*.* +3
        CreateDirectory $varSystemTEMP\BookmarkBackup
        IfErrors Error

        MSIBanner::Move /NOUNLOAD 10 "Backup"

        IfFileExists $ProfilePath\BookmarkBackup\*.* 0 +3
        CopyFiles $ProfilePath\BookmarkBackup\*.* $varSystemTEMP\BookmarkBackup
        IfErrors Error

        MSIBanner::Move /NOUNLOAD 20 "Backup"
        
        MSIBanner::Destroy
        
        Call DeleteProfile

        Goto done

          Error:
          
                  MSIBanner::Destroy

                  MessageBox MB_ICONEXCLAMATION|MB_OK $(BackupError)

                  Quit

          Exit:

                  # Back to folder-selection page

                            StrCpy $varAskAgain "false"
                            StrCpy $R9 "0"
                            Call RelGotoPage
                            Abort
                  
done:

FunctionEnd

##======================================================================================================================================================
##                                                                           DeleteProfile
##======================================================================================================================================================

Function DeleteProfile

         !insertmacro RemoveFilesAndSubDirs "$ProfilePath\"

FunctionEnd

##======================================================================================================================================================
##                                                                           RestoreBackup
##======================================================================================================================================================


Function RestoreBackup
ClearErrors

           CopyFiles "$varSystemTEMP\BookmarkBackup\*.*" $ProfilePath
           IfErrors 0 done

           ##############################################
           StrCmp $DEBUG 1 0 +3
           StrCpy $DEBUGVALUE "RestoreBackup Error"
           Call DebugOutput
          ##############################################

           done:
        
FunctionEnd



Function ParsePrefsJS

        # prefs.js
        # search JonDoFox

        StrCpy $IsJonDoFox "false"

        FileOpen $PrefsFileHandle $ProfilePath\prefs.js r
        Push $PrefsFileHandle
        Push ''
        Push 'JonDoFox'
        Push 'anywhere'
        Call SearchInFile
        Pop $0
        FileClose $PrefsFileHandle


        StrCmp $0 yes 0 +3
        StrCpy $IsJonDoFox "true"
        Goto done

        StrCpy $IsJonDoFox "false"

        done:

FunctionEnd



Function EditProfilesIni

##############################################
          StrCmp $DEBUG 1 0 +3
          StrCpy $DEBUGVALUE "EditProfilesIni$\nFFInstalled: $FFInstalled$\nUpdate: $Update"
          Call DebugOutput
##############################################


        ${If} $FFInstalled == "true"

              StrCmp $Update "false" 0 done

              Call GetLastProfilCounter

              Pop $i

        #insert:

              WriteINIStr $APPDATA\Mozilla\Firefox\profiles.ini General StartWithLastProfile 0
              IfErrors writeerror

        
              WriteINIStr $APPDATA\Mozilla\Firefox\profiles.ini Profile$i Name JonDoFox
              IfErrors writeerror
              WriteINIStr $APPDATA\Mozilla\Firefox\profiles.ini Profile$i IsRelative 1
              IfErrors writeerror
              WriteINIStr $APPDATA\Mozilla\Firefox\profiles.ini Profile$i Path Profiles/JonDoFox
              IfErrors writeerror

              writeerror:

        ${EndIf}

        done:

        StrCpy $FFInstalled "done"

FunctionEnd



Function GetLastProfilCounter

        StrCpy $i 0

        start:

        FileOpen $PrefsFileHandle $APPDATA\Mozilla\Firefox\profiles.ini r
        Push $PrefsFileHandle
        Push ''
        Push '[Profile$i]'
        Push 'begin'
        Call SearchInFile
        Pop $0
        FileClose $PrefsFileHandle

        StrCmp $0 yes 0 +5
        StrCpy $0 $i
        IntOp $0 $0 + 1
        StrCpy $i $0
        Goto start

        Push $i

FunctionEnd

Function WelcomePre
        ${If} $varReload == "true"
              Abort
              Goto Reload
        ${EndIf}

Reload:
FunctionEnd

Function LicencePre
        ${If} $varReload == "true"
              Abort
              Goto Reload
        ${EndIf}

Reload:
FunctionEnd

Function comPre         # Reset wrong path error

        ${If} $varReload == "true"

        SectionGetFlags ${JFPortable} $R0

        ${If} $R0 == 1
                StrCpy $PROGRAMINSTALL "true"
        ${EndIf}

              Abort
              Goto Reload
        ${EndIf}

         Call InitSelection
         
         StrCpy $Error "false"
         StrCpy $varAskAgain "true"
         

Reload:
FunctionEnd

Function comPost

         StrCpy $varAskAgain "true"

FunctionEnd

Function CheckUserAbort
        ${If} $UserAbort == "true"
              SetErrors
              Abort
        ${EndIf}
FunctionEnd

Function RelGotoPage
          IntCmp $R9 0 0 Move Move
            StrCmp $R9 "X" 0 Move
              StrCpy $R9 "120"

          Move:
          SendMessage $HWNDPARENT "0x408" "$R9" ""
FunctionEnd


Function FinishedInstall

        ${If} $Update == "true"
              Call RestoreBackup
        ${EndIf}

        ${If} $PROGRAMINSTALL == "true"
                ExecShell "open" $INSTDIR
        ${EndIf}
        
FunctionEnd


Function SearchInFile

        ; HOW USE
        ; FileOpen $1 'C:\WINNT\system32\drivers\etc\services' r
        ; Push $handle  ; handle of file (open in 'a' or 'r' mode)
        ; Push '#'      ; comments delimiter (All symbols more to the right
        ;               ; are ignored)
        ; Push 'gds_db' ; sample of search
        ;               ; push '' if comment_symbol are not defined
        ; Push 'no'     ; search mode. If 'begin' to search only from the
        ;               ; beginning of string
        ; Call SearchInFile
        ; Pop $0        ; Result of search: yes/no
        ;

        Exch $3 ; search mode
        Exch 3
        Exch $2 ; file handle
        Exch 2
        Exch $1 ; comments delimiter
        Exch
        Exch $0 ; search sample
        Exch 3
        Exch
        Exch 2
        Exch

        Push $4 ; string from file
        Push $5	; length of string
        Push $6 ; not used
        Push $7 ; search result
        Push $8 ; not used
        Push $9 ; not used
        Push $R0 ;length of the search sample
        Push $R1 ;length of the comment symbol
        Push $R2 ;tmp

        ClearErrors
        StrLen $5 $0
        StrCpy $7 no

        StrLen $R0 $0
        StrLen $R1 $1

        lbl_SearchInFile_loop:
        FileRead $2 $4
        IfErrors lbl_SearchInFile_done

        StrCmp $3 'begin' lbl_SearchFromBeginOnly lbl_SearchInString_loop

        lbl_SearchFromBeginOnly:
        StrLen $5 $4
        StrCpy $R2 $4 $R0
        StrCmp $R2 $0 lbl_SampleIsFound lbl_SearchInFile_loop

        lbl_SearchInString_loop:
        StrCmp "" $4  lbl_SearchInFile_loop
        StrLen $5 $4
        StrCmp "" $1  lbl_SearchSampleCont  ; search for the comments delimiter
        StrCpy $R2 $4 $R1
        StrCmp $R2 $1 lbl_SearchInFile_loop

        lbl_SearchSampleCont:
        StrCpy $R2 $4 $R0	                  ; search as such the sample
        StrCmp $R2 $0 lbl_SampleIsFound
        IntOp $5 $5 - 1 	 ; cut a char at the left and continue search
        StrCpy $4 $4 $5 1
        Goto lbl_SearchInString_loop

        lbl_SampleIsFound:
        StrCpy $7 yes

        lbl_SearchInFile_done:
          StrCpy $0 $7

        Pop $R2
        Pop $R1
        Pop $R0
        Pop $9
        Pop $8
        Pop $7
        Pop $6
        Pop $5
        Pop $4
        Pop $3
        Pop $2
        Pop $1
        Exch $0 ;output yes/no

FunctionEnd



Function DebugOutput

             MessageBox MB_ICONINFORMATION|MB_OKCANCEL $DEBUGVALUE IDOK done IDCANCEL Exit

        Exit:
             Quit

        done:
FunctionEnd


Function isRoot
  Exch $0

  # get rid of leading/trailing spaces
  Push $1
  _loop_left:
    StrCpy $1 "$0" 1
    StrCmp "$1" " " _left
    goto _loop_right
  _left:
    StrCpy $0 "$0" "" 1
    goto _loop_left

  _loop_right:
    StrCpy $1 "$0" 1 -1
    StrCmp "$1" " " _right
    goto _loop_end
  _right:
    StrCpy $0 "$0" -1
    goto _loop_right

  _loop_end:
  Pop $1

  # check whether the path is (now) an empty string
  StrCmp $0 "" _root

  # get rid of any trailing backslashes.  If the path were "c:\", it'll now be "c:"
  Push $0
    Exch $EXEDIR
    Exch $EXEDIR
  Pop $0

  # check whether the last char is a colon.  If it is, then we're looking at a root dir.
  StrCpy $0 $0 1 -1
  StrCmp $0 ":" _root _not_root

  _root:
    StrCpy $0 "true"
    goto _end

  _not_root:
    StrCpy $0 "false"
    goto _end

  _end:
    Exch $0
FunctionEnd
