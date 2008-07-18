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

#global variables (Linux default values)
FIREFOX_PROFILES_FOLDER=""
JONDOFOX_PROFILE_NAME="profile" #name of the JondoFox profile folder (within firefox_profile_path)
FIREFOX_SETTINGS_PATH="${HOME}/.mozilla/firefox"  #firefox profile folder's path (defaults to Linux)

INSTALL_SOURCE_DIR="."
INSTALL_BUNDLE_RESOURCES=""
INSTALL_PROFILE="${INSTALL_SOURCE_DIR}/${INSTALL_BUNDLE_RESOURCES}/${JONDOFOX_PROFILE_NAME}"
DEST_PROFILE="${FIREFOX_SETTINGS_PATH}/${FIREFOX_PROFILES_FOLDER}/${JONDOFOX_PROFILE_NAME}"

PROFILES_INI_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini" #name of the profiles config file
PROFILES_INI_BACKUP_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini.bak" #name for the file profiles.ini backup file

PREFS_FILE_NAME="prefs.js"
INSTALLED_PREFS="${FIREFOX_SETTINGS_PATH}/${JONDOFOX_PROFILE_NAME}/${PREFS_FILE_NAME}"
NEW_PREFS="${INSTALL_PROFILE}/${PREFS_FILE_NAME}"

BOOKMARKS_FF3="${DEST_PROFILE}/places.sqlite"
BOOKMARKS_FF2="${DEST_PROFILE}/bookmarks.html"
SAVED_BOOKMARKS=""

JONDOFOX_PROFILE_ENTRY="[General]\nStartWithLastProfile=0\n\n[Profile0]\nName=JonDoFox\nIsRelative=1\nPath=${FIREFOX_PROFILES_FOLDER}${JONDOFOX_PROFILE_NAME}\nDefault=1"

COPY_OVERWRITE_OPT="--remove-destination"
ECHO_ESCAPE="-e"
VERBOSE=""

OVERWRITE_DIALOG_TITLE=""
DIALOG_TEXT_SAME_VERSION=""
DIALOG_TEXT_OW_OLDER_VERSION=""
DIALOG_TEXT_OW_NEWER_VERSION=""

function setVariables()
{
	if [ -e /usr/bin/osascript ]; then
		FIREFOX_PROFILES_FOLDER="Profiles/"
		FIREFOX_SETTINGS_PATH="${HOME}/Library/Application\ Support/Firefox"
		INSTALL_BUNDLE_RESOURCES="JonDoFox_Install.app/Contents/Resources/"
		ECHO_ESCAPE=""
	else
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

function restoreBookmarks()
{
	if [ "${SAVED_BOOKMARKS}" ] && [ -e ${SAVED_BOOKMARKS} ]; then
		mv -f ${SAVED_BOOKMARKS} ${DEST_PROFILE}
	fi
}

function backupProfilesIni()
{
	if ! [ -e ${PROFILES_INI_FILE} ]; then
		echo "Could not save profiles.ini: not found"
		return 1
	fi
	cp ${COPY_OVERWRITE_OPT} ${PROFILES_INI_FILE} ${PROFILES_INI_BACKUP_FILE}

	if [ $? -ne 0 ]; then
		echo "Could not save profiles.ini"
		return 1
	fi
	return 0;
}

function restoreOldSettings()
{
	if [ -e ${PROFILES_INI_BACKUP_FILE} ]; then
		mv -f ${PROFILES_INI_BACKUP_FILE} ${PROFILES_INI_FILE}
	fi
	return 0;
}

function editProfilesIni()
{
	if  ! [ -e ${PROFILES_INI_FILE} ]; then
		echo "No profiles.ini found"
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

function copyProfileFolder()
{
	if ! [ -d ${FIREFOX_SETTINGS_PATH} ]; then
		echo "No Firefox setting found"
		restoreOldSettings
		return 1
	fi

	if ! [ -d ${INSTALL_PROFILE} ]; then
		echo "Found no JonDoFox profile to install"
		restoreOldSettings
		return 1
	fi
	
	cp -r ${COPY_OVERWRITE_OPT} ${INSTALL_PROFILE} "${FIREFOX_SETTINGS_PATH}/${FIREFOX_PROFILES_FOLDER}"
	
	if [ $? -ne 0 ]; then
		echo "Copying of profile folder failed"
		restoreOldSettings
		restoreBookmarks
		return 1
	fi
	chmod -fR 755 ${DEST_PROFILE}
	restoreBookmarks
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

function cmpVersions()
{
	if [ $(expr "$1" \> "$2") = "1" ]; then
		return 1
	elif [ $(expr "$1" \< "$2") = "1" ]; then
		return 2
	else
		return 0
	fi
}

## the main installation routine


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
		echo "Could not edit profiles.ini: Restoring old settings and abort installation!"
		restoreOldSettings
		exit 1
	fi
else
	cmpVersions $(getInstalledVersion) $(getNewVersion)
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
	##TODO: Ask if user wants to continue
	##if yes: save bookmarks
	echo "saving bookmarks."
	saveInstalledBookmarks
fi

echo "installing profile"
copyProfileFolder
if [ $? -ne 0 ]; then
	echo "JonDoFox could not be installed"
	exit 1
fi
echo "JonDoFox successfully installed"
exit 0