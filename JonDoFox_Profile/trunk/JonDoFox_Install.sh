#!/bin/sh

## Copyright (c) The JAP-Team, JonDos GmbH
##
## All rights reserved.
## 
## Redistribution and use in source and binary forms, with or without modification, 
## are permitted provided that the following conditions are met:
## 
##     * Redistributions of source code must retain the above copyright notice, this list 
## 	 of conditions and the following disclaimer.
##     * Redistributions in binary form must reproduce the above copyright notice,
##       this list of conditions and the following disclaimer in the documentation and/or
##       other materials provided with the distribution.
##     * Neither the name of the University of Technology Dresden, Germany, nor the name of
##       the JonDos GmbH, nor the names of their contributors may be used to endorse or
##       promote products derived from this software without specific prior written permission.
## 
## THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
## "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
## LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
## A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR
## CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
## EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
## PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
## PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
## LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
## NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
## SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
##    
##   JonDoFox profile bash installation script
##   2008 by Simon Pecher, JonDos GmbH 
##

#global variables - will obtain OS specific values when setVariables is called
FIREFOX_PROFILES_FOLDER=""
JONDOFOX_PROFILE_NAME="profile" #name of the JondoFox profile folder (within firefox_profile_path)
FIREFOX_SETTINGS_PATH=""  #firefox profile folder's path (defaults to Linux)

INSTALL_SOURCE_DIR=""	#the parent path of the installation source folder
INSTALL_BUNDLE_RESOURCES=""	#Resource folder of the installation bundle (Mac OS X)
INSTALL_PROFILE=""	#the path of the profile folder that shall be installed
DEST_PROFILE=""	#where to install the profile

PROFILES_INI_FILE="" #name of the profiles config file
PROFILES_INI_BACKUP_FILE="" #name for the file profiles.ini backup file

PREFS_FILE_NAME="prefs.js"	#name of the firefox prefernces file
INSTALLED_PREFS=""	#path to the prerference file of the local Firefox installation
NEW_PREFS=""	#the prefernces file of the profile that shall be installed

BOOKMARKS_FF3="" #Firefox3 bookmarks file
BOOKMARKS_FF2="" #Firefox2 bookmarks file
SAVED_BOOKMARKS="" #Saved bookmarks

JONDOFOX_PROFILE_ENTRY="" #JonDoFox entry in profiles.ini

COPY_OVERWRITE_OPT="--remove-destination"
ECHO_ESCAPE="-e"
VERBOSE=""

OVERWRITE_DIALOG_TITLE=""
DIALOG_TEXT_SAME_VERSION=""
DIALOG_TEXT_OW_OLDER_VERSION=""
DIALOG_TEXT_OW_NEWER_VERSION=""

## assign OS specific values for the global variables
function setVariables()
{
	if [ -e /usr/bin/osascript ]; then
		#Mac OS X specific settings
		FIREFOX_PROFILES_FOLDER="Profiles/"
		FIREFOX_SETTINGS_PATH="${HOME}/Library/Application\ Support/Firefox"
		INSTALL_BUNDLE_RESOURCES="JonDoFox_Install.app/Contents/Resources/"
		ECHO_ESCAPE=""
	else
		#Linux specific settings
		FIREFOX_PROFILES_FOLDER=""
		FIREFOX_SETTINGS_PATH="${HOME}/.mozilla/firefox"
		INSTALL_BUNDLE_RESOURCES=""
		ECHO_ESCAPE="-e"
	fi
    
	INSTALL_PROFILE="${INSTALL_SOURCE_DIR}/${INSTALL_BUNDLE_RESOURCES}${JONDOFOX_PROFILE_NAME}"
	DEST_PROFILE="${FIREFOX_SETTINGS_PATH}/${FIREFOX_PROFILES_FOLDER}${JONDOFOX_PROFILE_NAME}"
	
	PROFILES_INI_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini"
	PROFILES_INI_BACKUP_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini.bak"	

	INSTALLED_PREFS="${DEST_PROFILE}/${PREFS_FILE_NAME}"
	NEW_PREFS="${INSTALL_PROFILE}/${PREFS_FILE_NAME}"	
	
	BOOKMARKS_FF3="${DEST_PROFILE}/places.sqlite"
	BOOKMARKS_FF2="${DEST_PROFILE}/bookmarks.html"
	
	JONDOFOX_PROFILE_ENTRY="[General]\nStartWithLastProfile=0\n\n[Profile0]\nName=JonDoFox\nIsRelative=1\nPath=${FIREFOX_PROFILES_FOLDER}${JONDOFOX_PROFILE_NAME}\nDefault=1"    	

	OVERWRITE_DIALOG_TITLE="Overwrite existing JonDoFox"
	DIALOG_TEXT_SAME_VERSION="You already have a JonDoFox installation of the same version ($(getInstalledVersion)). Do you want to overwrite it?\n(Your bookmarks will be kept)"
	DIALOG_TEXT_OW_NEWER_VERSION="WARNING: You have already installed a newer version of JonDoFox ($(getInstalledVersion)). Do you want to overwrite it?\n(Your bookmarks will be kept)"
	DIALOG_TEXT_OW_OLDER_VERSION="You have already installed an older version of JonDoFox ($(getInstalledVersion)). Do you want to overwrite it?\n(Your bookmarks will be kept)"

	if [ "${VERBOSE}" ]; then
		echo "Firefox settings path: ${FIREFOX_SETTINGS_PATH}"
		echo "Install source: ${INSTALL_PROFILE}"
		echo "Destination: ${DEST_PROFILE}"
		echo "profiles.ini: ${PROFILES_INI_FILE}"
		echo "profiles.ini.bak: ${PROFILES_INI_BACKUP_FILE}"
		echo "Installed preferences: ${INSTALLED_PREFS}"
		echo "New preferences: ${NEW_PREFS}"
		echo "FF3 bookmarks: ${BOOKMARKS_FF3}"
		echo "FF2 bookmarks: ${BOOKMARKS_FF2}"
		echo ${ECHO_ESCAPE} "Profile Entry:\n${JONDOFOX_PROFILE_ENTRY}"
	fi
}

## modifies each line of the profiles.ini
function profilesIniModifications()
{
	local i=1
	echo ${ECHO_ESCAPE} ${JONDOFOX_PROFILE_ENTRY}
	while [ ${i} -le $1 ];
	do
		modFilter $(head -n ${i} ${PROFILES_INI_BACKUP_FILE} | tail -n 1)
		i=$[$i+1]
	done
	
}

## filter for profiles.ini modifications 
function modFilter()
{
	local newProfileNr
	local line=$1
	case "$line" in
		"StartWithLastProfile"*) ;;
		"[General]") ;;
		"Default=1") ;;
		"[Profile"*) 
			newProfileNr=${line##"[Profile"}
			newProfileNr=${newProfileNr%%"]"}
			newProfileNr=$[$newProfileNr+1]
			echo "[Profile${newProfileNr}]";;
		*) echo "$1";;
	esac
}

## store bookmarks of old JonDoFox profile
function saveInstalledBookmarks()
{
	SAVED_BOOKMARKS=""
	if [ -e ${BOOKMARKS_FF3} ]; then
		SAVED_BOOKMARKS="${FIREFOX_SETTINGS_PATH}/places.sqlite"
		cp -r ${COPY_OVERWRITE_OPT} ${BOOKMARKS_FF3} ${SAVED_BOOKMARKS}
	elif [ -e ${BOOKMARKS_FF3} ]; then
		SAVED_BOOKMARKS="${FIREFOX_SETTINGS_PATH}/bookmarks.html"
		cp -r ${COPY_OVERWRITE_OPT} ${BOOKMARKS_FF2} ${SAVED_BOOKMARKS}
	fi
	return 0
}

## copy saved bookmarks book to the JonDoFox profile folder
function restoreBookmarks()
{
	if [ "${SAVED_BOOKMARKS}" ] && [ -e ${SAVED_BOOKMARKS} ]; then
		mv -f ${SAVED_BOOKMARKS} ${DEST_PROFILE}
	fi
}

function backupProfilesIni()
{
	if ! [ -e ${PROFILES_INI_FILE} ]; then
		echo "ERROR: Could not save profiles.ini: not found."
		return 1
	fi
	cp ${COPY_OVERWRITE_OPT} ${PROFILES_INI_FILE} ${PROFILES_INI_BACKUP_FILE}

	if [ $? -ne 0 ]; then
		echo "ERROR: Could not save profiles.ini (exit code: $?)."
		return 1
	fi
	return 0;
}

## restores the profiles.ini from the corresponding backup-file
function restoreOldSettings()
{
	if [ -e ${PROFILES_INI_BACKUP_FILE} ]; then
		mv -f ${PROFILES_INI_BACKUP_FILE} ${PROFILES_INI_FILE}
	fi
	return 0;
}

## insert JonDoFox entry in profiles.ini
function editProfilesIni()
{
	if  ! [ -e ${PROFILES_INI_FILE} ]; then
		echo "ERROR: No profiles.ini found."
		return 1
	fi
	backupProfilesIni
	
	if  [ $? -ne 0 ]; then
		return 1
	fi
	
	lastLineStr=$(cat ${PROFILES_INI_BACKUP_FILE} | tail -n 1)
	lastLineNr=$(cat -n ${PROFILES_INI_BACKUP_FILE} | tail -n 1)
	lastLineNr=${lastLineNr%${lastLineStr}}
	
	profilesIniModifications ${lastLineNr} > ${PROFILES_INI_FILE}
}

##copies the JonDoFox profile to the corresponding firefox folder 
function copyProfileFolder()
{
	if ! [ -d ${FIREFOX_SETTINGS_PATH} ]; then
		echo "ERROR: Firefox is not installed."
		restoreOldSettings
		return 1
	fi

	if ! [ -d ${INSTALL_PROFILE} ]; then
		echo "ERROR: Found no JonDoFox profile to install."
		restoreOldSettings
		return 1
	fi
	
	cp -r ${COPY_OVERWRITE_OPT} ${INSTALL_PROFILE} "${FIREFOX_SETTINGS_PATH}/${FIREFOX_PROFILES_FOLDER}"
	
	if [ $? -ne 0 ]; then
		echo "Copying of profile folder failed (exit code: $?)."
		restoreOldSettings
		restoreBookmarks
		return 1
	fi
	chmod -fR 755 ${DEST_PROFILE}
	restoreBookmarks
	return 0
}

function isFirefoxRunning()
{
	if [ "$(ps aux | fgrep -i firefox | fgrep -v grep)" ]; then
		return 1
	fi
	return 0
}

function isJonDoFoxInstalled()
{
	if [ "$(grep JonDoFox ${PROFILES_INI_FILE})" ]; then
		return 1
	else
		return 0
	fi
}

function getVersion()
{
	local versionStr="";
	if [ -e $1 ]; then
		versionStr=$(grep JonDoFox.*Version $1)
		versionStr=${versionStr##*-}
		versionStr=${versionStr%\");} #"
	fi
	echo ${versionStr}
}

function getInstalledVersion()
{
	getVersion ${INSTALLED_PREFS} 
}

function getNewVersion()
{
	getVersion ${NEW_PREFS}	
}

function compareVersions()
{
	if [ $(expr "$1" \> "$2") = "1" ]; then
		return 1
	elif [ $(expr "$1" \< "$2") = "1" ]; then
		return 2
	else
		return 0
	fi
}

##################### the main installation routine ############################

isFirefoxRunning
if [ $? -ne 0 ]; then
	echo ${ECHO_ESCAPE} "ERROR: Your Firefox is running.\nPlease quit Firefox before installing JonDoFox."
	exit 1
fi

## handle command line options
while [ "$1" ]; 
do
	case $1 in
		-v) VERBOSE="VERBOSE";;
		*) ;;
	esac
	shift
done

setVariables
isJonDoFoxInstalled
if [ $? -eq 0 ]; then
	editProfilesIni
	if [ $? -ne 0 ]; then
		echo "...Could not edit profiles.ini: Restoring old settings and abort installation!"
		restoreOldSettings
		exit 1
	fi
else
	compareVersions $(getInstalledVersion) $(getNewVersion)
	case $? in
		0) OVERWRITE_DIALOG_TEXT=${DIALOG_TEXT_SAME_VERSION};;
		1) OVERWRITE_DIALOG_TEXT=${DIALOG_TEXT_OW_NEWER_VERSION};;
		2) OVERWRITE_DIALOG_TEXT=${DIALOG_TEXT_OW_OLDER_VERSION};;
	esac
	
	dialog --clear --title "${OVERWRITE_DIALOG_TITLE}" --yesno  "${OVERWRITE_DIALOG_TEXT}" 9 50
	if [ $? -ne 0 ]; then
		clear
		echo "Installation aborted"
		exit 1
	fi
	clear
	echo -n "saving bookmarks."
	saveInstalledBookmarks
	echo ".......finished"
fi

echo -n "installing profile."
copyProfileFolder
if [ $? -ne 0 ]; then
	echo "JonDoFox could not be installed"
	exit 1
fi
echo ".......finished"
echo "JonDoFox successfully installed!"
exit 0