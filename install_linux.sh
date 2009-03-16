#!/bin/bash

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
##   2008 by Simon Pecher, JonDos GmbH (simon.pecher@jondos.de) 
##

#global variables - will obtain OS specific values when setVariables is called
FIREFOX_PROFILES_FOLDER=""
JONDOFOX_PROFILE_NAME="profile" #name of the JondoFox profile folder (within firefox_profile_path)
FIREFOX_SETTINGS_PATH=""  #firefox profile folder's path (defaults to Linux)

INSTALL_SOURCE_DIR="."	#the parent path of the installation source folder
INSTALL_BUNDLE_RESOURCES=""	#Resource folder of the installation bundle (Mac OS X)

#the path of the profile folder that shall be installed
INSTALL_PROFILE="${INSTALL_SOURCE_DIR}/${INSTALL_BUNDLE_RESOURCES}${JONDOFOX_PROFILE_NAME}"
DEST_PROFILE=""	#where to install the profile

PROFILES_INI_FILE="" #name of the profiles config file
PROFILES_INI_BACKUP_FILE="" #name for the file profiles.ini backup file

PREFS_FILE_NAME="prefs.js"	#name of the firefox prefernces file
NEW_PREFS="${INSTALL_PROFILE}/${PREFS_FILE_NAME}"
INSTALLED_PREFS=""	#path to the prerference file of the local Firefox installation
	#the prefernces file of the profile that shall be installed

BOOKMARKS_FF3="" #Firefox3 bookmarks file
BOOKMARKS_FF2="" #Firefox2 bookmarks file
SAVED_BOOKMARKS="" #Saved bookmarks

JONDOFOX_PROFILE_ENTRY="" #JonDoFox entry in profiles.ini

COPY_OVERWRITE_OPT=""
COPY_RECURSIVE_OPT=""
ECHO_ESCAPE="-e"
VERBOSE=""

OVERWRITE_DIALOG_TITLE=""
DIALOG_TEXT_SAME_VERSION=""
DIALOG_TEXT_OW_OLDER_VERSION=""
DIALOG_TEXT_OW_NEWER_VERSION=""

OLDER_VERSION="<=2.0.1"

## assign OS specific values for the global variables
variablesOsSpecific()
{	
	if [ -e /usr/bin/osascript ]; then
		#Mac OS X specific settings
		FIREFOX_PROFILES_FOLDER="Profiles/"
		if ! [ "${FIREFOX_SETTINGS_PATH}" ]; then
			FIREFOX_SETTINGS_PATH="${HOME}/Library/Application Support/Firefox"
		fi
		#INSTALL_BUNDLE_RESOURCES="JonDoFox_Install.app/Contents/Resources/"
		INSTALL_BUNDLE_RESOURCES=""
		ECHO_ESCAPE="-e"
		COPY_OVERWRITE_OPT="-f"
		COPY_RECURSIVE_OPT="-R"
	else
		#Linux specific settings
		FIREFOX_PROFILES_FOLDER=""
		if ! [ "${FIREFOX_SETTINGS_PATH}" ]; then
			FIREFOX_SETTINGS_PATH="${HOME}/.mozilla/firefox"
		fi
		INSTALL_BUNDLE_RESOURCES=""
		ECHO_ESCAPE="-e"
		COPY_OVERWRITE_OPT="--remove-destination"
		COPY_RECURSIVE_OPT="-r"
	fi
	
	INSTALL_PROFILE="${INSTALL_SOURCE_DIR}/${INSTALL_BUNDLE_RESOURCES}${JONDOFOX_PROFILE_NAME}"
	DEST_PROFILE="${FIREFOX_SETTINGS_PATH}/${FIREFOX_PROFILES_FOLDER}${JONDOFOX_PROFILE_NAME}"	
	
	PROFILES_INI_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini"
	PROFILES_INI_BACKUP_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini.bak"	
	
	PROFILES_INI_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini"
	PROFILES_INI_BACKUP_FILE="${FIREFOX_SETTINGS_PATH}/profiles.ini.bak"		

	
	INSTALLED_PREFS="${DEST_PROFILE}/${PREFS_FILE_NAME}"
	BOOKMARKS_FF3="${DEST_PROFILE}/places.sqlite"
	BOOKMARKS_FF2="${DEST_PROFILE}/bookmarks.html"

	NEW_PREFS="${INSTALL_PROFILE}/${PREFS_FILE_NAME}"	
		
	#JONDOFOX_PROFILE_ENTRY="[General]\nStartWithLastProfile=0\n\n[Profile0]\nName=JonDoFox\nIsRelative=1\nPath=${FIREFOX_PROFILES_FOLDER}${JONDOFOX_PROFILE_NAME}\nDefault=1"    	
	JONDOFOX_PROFILE_ENTRY="Name=JonDoFox\nIsRelative=1\nPath=${FIREFOX_PROFILES_FOLDER}${JONDOFOX_PROFILE_NAME}\nDefault=1"

	OVERWRITE_DIALOG_TITLE="Overwrite existing JonDoFox"
	DIALOG_TEXT_SAME_VERSION="You already have a JonDoFox installation of the same version ($(getInstalledVersion)). Do you want to overwrite it?\n(Your bookmarks will be kept)"
	DIALOG_TEXT_OW_NEWER_VERSION="WARNING: You have already installed a newer version of JonDoFox ($(getInstalledVersion)). Do you want to overwrite it?\n(Your bookmarks will be kept)"
	DIALOG_TEXT_OW_OLDER_VERSION="You have already installed an older version of JonDoFox ($(getInstalledVersion)). Do you want to overwrite it?\n(Your bookmarks will be kept)"

	if [ "${VERBOSE}" ]; then
		echo "Installing JonDoFox $(getInstalledVersion) with these settings:"
		echo "Firefox settings path: ${FIREFOX_SETTINGS_PATH}"
		echo "Install Destination: ${DEST_PROFILE}"
	fi
}

## store bookmarks of old JonDoFox profile
saveInstalledBookmarks()
{
	SAVED_BOOKMARKS=""
	if [ -e "${BOOKMARKS_FF3}" ]; then
		SAVED_BOOKMARKS="${FIREFOX_SETTINGS_PATH}/places.sqlite"
		cp ${COPY_OVERWRITE_OPT} ${VERBOSE} "${BOOKMARKS_FF3}" "${SAVED_BOOKMARKS}"
	elif [ -e "${BOOKMARKS_FF3}" ]; then
		SAVED_BOOKMARKS="${FIREFOX_SETTINGS_PATH}/bookmarks.html"
		cp ${COPY_OVERWRITE_OPT} ${VERBOSE} "${BOOKMARKS_FF2}" "${SAVED_BOOKMARKS}"
	fi
	return 0
}

## copy saved bookmarks book to the JonDoFox profile folder
restoreBookmarks()
{
	if [ "${SAVED_BOOKMARKS}" ] && [ -e "${SAVED_BOOKMARKS}" ]; then
		mv -f "${SAVED_BOOKMARKS}" "${DEST_PROFILE}"
	fi
}

backupProfilesIni()
{
	if ! [ -e "${PROFILES_INI_FILE}" ]; then
		echo "ERROR: Could not save profiles.ini: not found."
		return 1
	fi
	cp ${COPY_OVERWRITE_OPT} ${VERBOSE} "${PROFILES_INI_FILE}" "${PROFILES_INI_BACKUP_FILE}"

	if [ $? -ne 0 ]; then
		echo "ERROR: Could not save profiles.ini (exit code: $?)."
		return 1
	fi
	return 0;
}

## restores the profiles.ini from the corresponding backup-file
restoreOldSettings()
{
	if [ -e "${PROFILES_INI_BACKUP_FILE}" ]; then
		mv -f  ${VERBOSE} "${PROFILES_INI_BACKUP_FILE}" "${PROFILES_INI_FILE}"
	fi
	return 0;
}

## insert JonDoFox entry in profiles.ini
editProfilesIni()
{
	if  ! [ -e "${PROFILES_INI_FILE}" ]; then
		echo "ERROR: No profiles.ini found. You can specify the path to this file with the option -f"
		return 1
	fi
	backupProfilesIni
	
	if  [ $? -ne 0 ]; then
		return 1
	fi
	
	nextProfileNr=$(grep \\[Profile "${PROFILES_INI_FILE}" | tail -n 1 | xargs -I % expr % : ".*Profile\([0-9]*\).*" | xargs -I % expr % + 1)
	
	#unset default profile and force profile choose dialog at startup.
	sed -e s/StartWithLastProfile=1/StartWithLastProfile=0/ \
		-e s/Default=1// "${PROFILES_INI_BACKUP_FILE}" > "${PROFILES_INI_FILE}"
	
	echo >> "${PROFILES_INI_FILE}"
	echo "[Profile${nextProfileNr}]" >> "${PROFILES_INI_FILE}"
	echo ${ECHO_ESCAPE} ${JONDOFOX_PROFILE_ENTRY} >> "${PROFILES_INI_FILE}"
}

removeOldProfileFolder()
{
	rm -rf ${VERBOSE} "${DEST_PROFILE}"
}

##copies the JonDoFox profile to the corresponding firefox folder 
copyProfileFolder()
{
	if ! [ -d "${FIREFOX_SETTINGS_PATH}" ]; then
		echo "ERROR: Firefox is not installed."
		restoreOldSettings
		return 1
	fi

	if ! [ -d "${INSTALL_PROFILE}" ]; then
		echo "ERROR: Found no JonDoFox profile to install."
		restoreOldSettings
		return 1
	fi
	
	cp ${COPY_RECURSIVE_OPT} ${COPY_OVERWRITE_OPT} ${VERBOSE} "${INSTALL_PROFILE}" "${FIREFOX_SETTINGS_PATH}/${FIREFOX_PROFILES_FOLDER}"
	
	if [ $? -ne 0 ]; then
		echo "Copying of profile folder failed (exit code: $?)."
		restoreOldSettings
		restoreBookmarks
		return 1
	fi
	chmod -fR 755 "${DEST_PROFILE}" >& /dev/null
	restoreBookmarks
	return 0
}

isFirefoxRunning()
{
	if [ "$(ps aux | fgrep -i firefox | fgrep -v grep | fgrep -v install_linux)" ]; then
		return 1
	fi
	return 0
}

isJonDoFoxInstalled()
{
	local ret=$(grep JonDoFox "${PROFILES_INI_FILE}")
	if [ "${ret}" ]; then
		return 1
	else
		return 0
	fi
}

getVersion()
{
	local versionStr="";
	if [ -e "$1" ]; then
		#versionStr=$(grep JonDoFox.*Version "$1")
		#if [$? -ne 0 ]; then
			versionStr=$(fgrep jondofox.profile_version "$1" | xargs -I % expr % : ".*, \([0-9].*[0-9]\).*")
		#else
		#	versionStr=${versionStr##*-}
		#	versionStr=${versionStr%\");} #"
		#fi
	fi
	if [ "${versionStr}" ]; then
		echo ${versionStr}
	else
		echo "${OLDER_VERSION}"
	fi
}

getInstalledVersion()
{
	getVersion "${INSTALLED_PREFS}" 
}

getNewVersion()
{
	getVersion "${NEW_PREFS}"	
}

compareVersions()
{
	if  [ "$1" = "${OLDER_VERSION}" ]; then
		return 2
	elif [ "$2" = "${OLDER_VERSION}" ]; then
		return 1;
	fi
	
	if [ $(expr "$1" \> "$2") = "1" ]; then
		return 1
	elif [ $(expr "$1" \< "$2") = "1" ]; then
		return 2
	else
		return 0
	fi
}

promptOverwrite()
{
	local conf=""
	local dialog_return
	case $1 in
		0) OVERWRITE_DIALOG_TEXT=${DIALOG_TEXT_SAME_VERSION};;
		1) OVERWRITE_DIALOG_TEXT=${DIALOG_TEXT_OW_NEWER_VERSION};;
		2) OVERWRITE_DIALOG_TEXT=${DIALOG_TEXT_OW_OLDER_VERSION};;
	esac

	dialog --version >& /dev/null
	if [ $? -eq 0 ]; then
		dialog --clear --title "${OVERWRITE_DIALOG_TITLE}" --yesno  "${OVERWRITE_DIALOG_TEXT}" 9 50
		dialog_return=$?		
		clear
		return ${dialog_return}
	else
		echo ${ECHO_ESCAPE} "${OVERWRITE_DIALOG_TEXT}\n(y/n) ?\c"
		read conf
		conf=${conf%%"es"}
		if [ "${conf}" = y ]; then	
			return 0
		fi
	fi
	return 1
}

##################### the main installation routine ############################

## handle command line options

OPTSTR="f:vh"	
getopts "${OPTSTR}" CMD_OPT
while [ $? -eq 0 ]; 
do
	case ${CMD_OPT} in
		v) VERBOSE="-v";;
		f) FIREFOX_SETTINGS_PATH="${OPTARG}";;
		h) 
			echo "JonDoFox $(getNewVersion) Installation for Linux (2008 Copyright (c) JonDos GmbH)"
			echo "usage: ./install_linux [options]"
			echo "possible options are:"
			echo "-v prints verbose about the installation progress."
			echo "-f <path to firefox settings> Manually set the path to where the profile shall be installed."
			echo "   (Must be the same one where the profiles.ini can be found)."
			echo "-h prints this help text." 
			echo ""
			exit 0
			;;
		*) ;;
	esac
	getopts "${OPTSTR}" CMD_OPT
done

## set the other global variables depending on the platform or command line options
variablesOsSpecific

isFirefoxRunning
if [ $? -ne 0 ]; then
	echo ${ECHO_ESCAPE} "ERROR: Your Firefox is running.\nPlease quit Firefox before installing JonDoFox."
	exit 1
fi

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
	promptOverwrite $?

	if [ $? -ne 0 ]; then
		echo "Installation aborted"
		exit 1
	fi
	echo "saving bookmarks."
	saveInstalledBookmarks
	removeOldProfileFolder
fi

echo "installing profile."
copyProfileFolder
if [ $? -ne 0 ]; then
	echo "JonDoFox could not be installed"
	exit 1
fi
echo "JonDoFox successfully installed!"
exit 0
