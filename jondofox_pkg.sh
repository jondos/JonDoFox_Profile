#/bin/sh

####################################################################################################
#                                                                                                  #
#  Copyright (c) The JAP-Team, JonDos GmbH                                                         #
#  All rights reserved.                                                                            #
#  Redistribution and use in source and binary forms, with or without modification, are permitted  #
#  provided that the following conditions are met:                                                 #
#	*	Redistributions of source code must retain the above copyright notice, this list of        #
#		conditions and the following disclaimer.                                                   #
#	*	Redistributions in binary form must reproduce the above copyright notice,                  #
#		this list of conditions and the following disclaimer in the documentation and/or           #
#		other materials provided with the distribution.                                            #
#	*	Neither the name of the University of Technology Dresden, Germany, nor the name of         #
#  the JonDos GmbH, nor the names of their contributors may be used to endorse or                  # 
#  promote products derived from this software without specific prior written permission.          #
#                                                                                                  #
#  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                             #
#  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                               #
#  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR                           #
#  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR                           #
#  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,                           #
#  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,                             #
#  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR                              #
#  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF                          #
#  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING                            #
#  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS                              #
#  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.                                    #
#                                                                                                  #
####################################################################################################

## basch script for creating JonDoFox packages for each platform
## NOTE: Mac OS X package creation only works with Mac OS X builtin tools.
## It's STRONGLY RECOMMENDED NOT to RUN this script IN YOUR SVN WORKING COPY FOLDER because 
## of the (really necessary) cleanups after packages are created! If you do so DON'T COMMIT ANY 
## DELETIONS IN THE SUBVERSION REPOSITORY !!!!!!!!!

VERBOSE=""

OS_X_INSTALLER_NAME="Install_OSX"
OS_X_INSTALLER_BUNDLE="${OS_X_INSTALLER_NAME}.app"
OS_X_INSTALLER_SRC="${OS_X_INSTALLER_NAME}.applescript"
OS_X_INSTALLER_PKG_NAME="JonDoFox_OS_X"
OS_X_INSTALLER_PKG=""
OS_X_INSTALLER_ICON="applet.icns"
OS_X_INSTALER_ICON_SVN_PATH="icons/macosx"
OS_X_INSTALLER_ICON_SRC="${OS_X_INSTALER_ICON_SVN_PATH}/jondofox_std.icns"

LINUX_PKG="profile.zip"
BASH_INSTALLER_SCRIPT="install_linux.sh"
VB_INSTALLER_SCRIPT="install_win.vbs"
INSTALLER_HELP_NAME="INSTALL"
INSTALLER_HELP_SUFFIX=".txt"
INSTALLER_HELP_FILE="${INSTALLER_HELP_NAME}${INSTALLER_HELP_SUFFIX}"

SRC_LOCAL=""

BUNDLE_RESOURCES="Contents/Resources"

JONDOFOX_PROFILE="profile"

JONDOFOX_PROFILE_TYPES=""
JONDOFOX_PROFILE_LANGS=""
BUILD_PLATFORMS=""

ALL_TYPES="full lite"
ALL_LANGS="de en"
ALL_PLATFORMS="mac linux win"

BOOKMARKS_FF3_NAME="places"
BOOKMARKS_FF3_SUFFIX=".sqlite"
BOOKMARKS_FF3="${BOOKMARKS_FF3_NAME}${BOOKMARKS_FF3_SUFFIX}"

BOOKMARKS_FF2_NAME="bookmarks"
BOOKMARKS_FF2_SUFFIX=".html"
BOOKMARKS_FF2="${BOOKMARKS_FF2_NAME}${BOOKMARKS_FF2_SUFFIX}"

SVN_MODULE="https://svn.jondos.de/svnpub/JonDoFox_Profile/trunk"

createOSXBundle()
{
	local type=""
	local lang=""
	
	#first prepare the applet bundle
	
	echo "Preparing Mac OS X installer bundle"
	if [ "${SRC_LOCAL}" ]; then
		
		verboseMessage "compiling from local script source."
		
		if ! [ -e "${OS_X_INSTALLER_SRC}" ]; then
			
			verboseMessage "script source not found: will get it from ${SVN_MODULE}/${OS_X_INSTALLER_SRC}"
			svn cat "${SVN_MODULE}/${OS_X_INSTALLER_SRC}" > "${OS_X_INSTALLER_SRC}"
			if [ $? -ne 0 ]; then
				echo "Error: could not check out Mac OS X script source"
				return 1
			fi
		fi
		osacompile -o "${OS_X_INSTALLER_BUNDLE}" "${OS_X_INSTALLER_SRC}"
		if [ $? -ne 0 ]; then
			echo "Error: could not compile Mac OS X script source"
			return 1
		fi
	else
		svn cat "${SVN_MODULE}/${OS_X_INSTALLER_SRC}" | osacompile -o "${OS_X_INSTALLER_BUNDLE}"
		if [ $? -ne 0 ]; then
			echo "Error: could not compile Mac OS X script source from SVN"
			return 1
		fi
	fi
	
	if ! [ -e  "${OS_X_INSTALLER_BUNDLE}" ]; then
		echo "Error: Mac OS X installer bundle could not be created."
		return 1
	fi
	
	#fetch the icon for the applet bundle
	if [ "${SRC_LOCAL}" ]; then
		if ! [ -e "${OS_X_INSTALLER_ICON}" ]; then
			svn cat "${SVN_MODULE}/${OS_X_INSTALLER_ICON_SRC}" > "${OS_X_INSTALLER_ICON}"
			if [ $? -ne 0 ]; then
				echo "Error: could not fetch Mac OS X installer icon"
			fi
			cp -f ${VERBOSE} "${OS_X_INSTALLER_ICON}" "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${OS_X_INSTALLER_ICON}" >& /dev/null
		fi
	else
		svn cat "${SVN_MODULE}/${OS_X_INSTALLER_ICON_SRC}" > "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${OS_X_INSTALLER_ICON}"
		if [ $? -ne 0 ]; then
			echo "Error: could not fetch Mac OS X installer icon"
		fi
	fi
	
	for type in ${JONDOFOX_PROFILE_TYPES}; do
	
		#checkType "${type}"
		#if [ $? -ne 0 ]; then
		#	continue
		#fi
		
		getProfileFolder "${type}"
		
		if [ $? -ne 0 ] || ! [ -e "${JONDOFOX_PROFILE}_${type}" ]; then
			continue
		fi
		
		for lang in ${JONDOFOX_PROFILE_LANGS}; do
			
			checkLang "${lang}"
			if [ $? -ne 0 ]; then
				continue
			fi
			
			setLanguageBookmarks "${lang}" "${type}"
			if [ $? -ne 0 ]; then
				continue
			fi
			
			rm -rf ${VERBOSE} "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${JONDOFOX_PROFILE}"
			echo "Copy profile to Install Bundle."
			cp -fR ${VERBOSE} "${JONDOFOX_PROFILE}_${type}" "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${JONDOFOX_PROFILE}"
	
			OS_X_INSTALLER_PKG="${OS_X_INSTALLER_PKG_NAME}_${type}_${lang}.dmg"
	
			if [ -e "${OS_X_INSTALLER_PKG}" ]; then
				verboseMessage "Warning old installer package ${OS_X_INSTALLER_PKG} exists: will remove it."
				rm -f ${VERBOSE} "${OS_X_INSTALLER_PKG}"
			fi
			echo "Creating dmg file '${OS_X_INSTALLER_PKG}'"
			hdiutil create -srcfolder "${OS_X_INSTALLER_BUNDLE}" "${OS_X_INSTALLER_PKG}"
		done
	done
	
	cleanupOSX
	return 0
}

cleanupOSX()
{
	local type=""
	echo "Cleaning up Mac OS X package components."
	cleanupProfileFolders
	
	if ! [ "${SRC_LOCAL}" ]; then
		rm -f ${VERBOSE} "${OS_X_INSTALLER_SRC}"
		rm -f ${VERBOSE} "${OS_X_INSTALLER_ICON}"
	fi
	
	rm -rf ${VERBOSE} ${OS_X_INSTALLER_BUNDLE}
}

# creates a generic packages with install autmation supporting all os's
createLinuxPackage()
{
	
	local lang=""
	local type=""
	local installer_help_file=""
	
	
	if ! [ "${SRC_LOCAL}" ] || ! [ -e "${BASH_INSTALLER_SCRIPT}" ]; then
		echo "Fetching Installer scripts from Subversion"
		svn cat "${SVN_MODULE}/${BASH_INSTALLER_SCRIPT}" > "${BASH_INSTALLER_SCRIPT}"
		if [ $? -ne 0 ]; then
			echo "Error: cannot load bash install script from subversion."
			return 1
		fi
	fi
			
	if ! [ "${SRC_LOCAL}" ] || ! [ -e "${VB_INSTALLER_SCRIPT}" ]; then
		svn cat "${SVN_MODULE}/${VB_INSTALLER_SCRIPT}" > "${VB_INSTALLER_SCRIPT}"
		if [ $? -ne 0 ]; then
			echo "Error: cannot load vb install script from subversion."
			return 1
		fi
	fi
	
	chmod -f 755 "${BASH_INSTALLER_SCRIPT}"
	
	for type in ${JONDOFOX_PROFILE_TYPES}; do
		
		getProfileFolder "${type}"
		if [ $? -ne 0 ] || ! [ -e "${JONDOFOX_PROFILE}_${type}" ]; then
			continue
		fi
		
		rm -rf ${VERBOSE} "${JONDOFOX_PROFILE}"
		cp -Rf ${VERBOSE} "${JONDOFOX_PROFILE}_${type}" "${JONDOFOX_PROFILE}"
	
		for lang in ${JONDOFOX_PROFILE_LANGS}; do
			
			checkLang "${lang}"
			if [ $? -ne 0 ]; then
				continue
			fi
		
			installer_help_file="${INSTALLER_HELP_NAME}_${lang}${INSTALLER_HELP_SUFFIX}"
		
			if ! [ "${SRC_LOCAL}" ] || 
			   ! [ -e "${installer_help_file}" ]; then
			
				svn cat "${SVN_MODULE}/${installer_help_file}" > "${installer_help_file}"
				if [ $? -ne 0 ]; then
					echo "Error: cannot load install help file for '${lang}'."
					continue
				fi
			fi
			
			if ! [ -e "${installer_help_file}" ]; then
				echo "Error: no installer help file found for '${lang}'."
				continue
			fi
			
			cp -f "${installer_help_file}" "${INSTALLER_HELP_FILE}"
			setLanguageBookmarks "${lang}"
			
			echo "Creating zip file '${JONDOFOX_PROFILE}_${type}_${lang}.zip'"
			if [ "${VERBOSE}" ]; then
				zip -r "${JONDOFOX_PROFILE}_${type}_${lang}.zip" "${JONDOFOX_PROFILE}" "${INSTALLER_HELP_FILE}" \
							"${VB_INSTALLER_SCRIPT}" "${BASH_INSTALLER_SCRIPT}"
			else
				zip -qr "${JONDOFOX_PROFILE}_${type}_${lang}.zip" "${JONDOFOX_PROFILE}" "${INSTALLER_HELP_FILE}" \
							"${VB_INSTALLER_SCRIPT}" "${BASH_INSTALLER_SCRIPT}"
			fi
		done
	done
	
	cleanupLinux
	return 0
}

cleanupLinux()
{
	echo "Cleaning up Linux package components."
	rm -rf ${VERBOSE} "${JONDOFOX_PROFILE}"
	rm -f "${INSTALLER_HELP_FILE}"
	
	if ! [ "${SRC_LOCAL}" ]; then
		rm -f ${VERBOSE} "${VB_INSTALLER_SCRIPT}"
		rm -f ${VERBOSE} "${BASH_INSTALLER_SCRIPT}"
		
		cleanupProfileFolders

		for lang in ${JONDOFOX_PROFILE_LANGS}; do
			rm -f ${VERBOSE} "${INSTALLER_HELP_NAME}_${lang}${INSTALLER_HELP_SUFFIX}"
		done
		
	fi
}

createWindowsPackage()
{
	return 0
}

###################################### Helper functions ############################################

## try to fetch profile folder 
getProfileFolder()
{
	local type=$1
	
	checkType "${type}"
	if [ $? -ne 0 ]; then
		return 1
	fi
	
	if ! [ "${SRC_LOCAL}" ] || ! [ -e "${JONDOFOX_PROFILE}_${type}" ]; then
		echo "Checking out JonDoFox profile type '${type}'."
		#if [ "${VERBOSE}" ]; then
			svn export "${SVN_MODULE}/${type}/${JONDOFOX_PROFILE}" "${JONDOFOX_PROFILE}_${type}"
		#else
		#	svn export "${SVN_MODULE}/${type}/${JONDOFOX_PROFILE}" "${JONDOFOX_PROFILE}_${type}" >& /dev/null
		#fi
		
		if [ $? -ne 0 ]; then
			echo "Error: could not check out profile type '${type}'"
			return 1
		fi
	fi
	return 0
	
}

cleanupProfileFolders()
{
	if ! [ "${SRC_LOCAL}" ]; then
		for type in ${JONDOFOX_PROFILE_TYPES}; do
			
			checkType "${type}"
			if [ $? -ne 0 ]; then
				continue
			fi
			rm -rf ${VERBOSE} "${JONDOFOX_PROFILE}_${type}"
		done
	fi
}

createPackage()
{
	case "$1" in
		mac)	echo "building JonDoFox package for Mac OS X."
				createOSXBundle
				return $?;;
		
		linux) 	echo "building JonDoFox package for Linux."
				createLinuxPackage
				return $?;;
		
		win) 	echo "building JonDoFox package for Windows."
				return 0;;
		
		*) 		echo "ERROR: No such platform supported: $1"
				return 1;;
	esac
}

createSelectedPackages()
{
	for i in ${BUILD_PLATFORMS}; do
		checkPlatform "$i"
		if [ $? -eq 0 ]; then
			createPackage "$i"
		fi
	done
}

checkType()
{
	case "$1" in
		full) 	return 0;;
		
		lite)	return 0;;
		
		*) 		echo "Error: no such profile type: $1"
				return 1;;
	esac
}

checkLang()
{
	case "$1" in
		en) return 0;;
		
		de) return 0;;
		
		*) 	echo "Error: No such language supported: $1"
			return 1;;
	esac
}

checkPlatform()
{
	case "$1" in
		mac)	return 0;;
		
		linux) 	return 0;;
		
		win) 	return 0;;
		
		*) 		return 1;;
	esac
}

setLanguageBookmarks()
{
	local lang=$1
	local type=$2
	local profile_folder=""
	
	echo "Setting bookmarks for language '${lang}'."
	
	if [ "${type}" ]; then
		profile_folder="${JONDOFOX_PROFILE}_${type}"
	else
		profile_folder="${JONDOFOX_PROFILE}"
	fi
	
	
	local ff3_bookmarks="${profile_folder}/${BOOKMARKS_FF3_NAME}${BOOKMARKS_FF3_SUFFIX}_${lang}"
	local ff2_bookmarks="${profile_folder}/${BOOKMARKS_FF2_NAME}_${lang}${BOOKMARKS_FF2_SUFFIX}"
	
	if ! [ -e "${profile_folder}" ]; then
		echo "Error: no profiles folder found."
		return 1
	fi
	
	if [ -e "${ff3_bookmarks}" ]; then
		verboseMessage "Firefox 3 bookmarks found."
		cp -f ${VERBOSE} "${ff3_bookmarks}" "${profile_folder}/${BOOKMARKS_FF3}"
	elif [ -e "${ff2_bookmarks}" ]; then
		verboseMessage "Firefox 2 bookmarks found."
		cp -f ${VERBOSE} "${ff2_bookmarks}" "${profile_folder}/${BOOKMARKS_FF2}"
	else
		echo "Error: Neither Firefox 3 nor Firefox 2 bookmarks could be found."
		return 1
	fi
	return 0
	
}

removeOldMacProfile()
{
	rm -rvf "~/Library/Application Support/Firefox/Profiles/profile/"
	mv -f "~/Library/Application Support/Firefox/profiles.ini.bak" "~/Library/Application Support/Firefox/profiles.ini" >& /dev/null
}

uploadMacBundles()
{
	scp JonDoFox_OS_X_full_de.dmg root@87.230.58.112:/var/www/an-on/httpdocs/de/downloads/JonDoFox_OS_X.dmg
	scp JonDoFox_OS_X_lite_de.dmg root@87.230.58.112:/var/www/an-on/httpdocs/de/downloads/JonDoFox_OS_X_lite.dmg
	scp JonDoFox_OS_X_full_en.dmg root@87.230.58.112:/var/www/an-on/httpdocs/en/downloads/JonDoFox_OS_X.dmg
	scp JonDoFox_OS_X_lite_en.dmg root@87.230.58.112:/var/www/an-on/httpdocs/en/downloads/JonDoFox_OS_X_lite.dmg
}

verboseMessage()
{
	if [ "${VERBOSE}" ]; then
		echo "$1"
	fi
}

OPTSTR="vhs:l:t:p:c:"	
getopts "${OPTSTR}" CMD_OPT
while [ $? -eq 0 ]; 
do
	case ${CMD_OPT} in
		v) VERBOSE="-v";;
		p) BUILD_PLATFORMS="${OPTARG}";;
		t) JONDOFOX_PROFILE_TYPES="${OPTARG}";;
		l) JONDOFOX_PROFILE_LANGS="${OPTARG}";;
		s) case "${OPTARG}" in 
		   		"svn") 		SRC_LOCAL="";;
		   		"local") 	SRC_LOCAL="y";;
		   		*) 			echo "No such component source: ${OPTARG}"
		   					exit 1;;
		   esac;;
		c) SVN_MODULE="${OPTARG}";;
		h) 
			echo "JonDoFox Package Creator 0.1 (2008 Copyright (c) JonDos GmbH)"
			echo "usage: $0 [options]"
			echo "possible options are:"
			echo "-v prints verbose information about the packaging progress."
			echo "-p [mac | linux | win]"  
			echo "   the platform of the JonDoFox installer to be created." 
			echo "   Multiple platforms can be specified in quotes separated by whitespace"
			echo "   If nothing is specified, all platforms are selected."
			echo "-l [de | en]"
			echo "   the language of the JonDoFox installer package to be created." 
			echo "   Multiple languages can be specified in quotes separated by whitespace"
			echo "   If nothing is specified, all languages are selected."
			echo "-t [full | lite]"
			echo "   the type of the JonDoFox installer package to be created." 
			echo "   Multiple types can be specified in quotes separated by whitespace"
			echo "   If nothing is specified, all types are selected."
			echo "-s [svn | local]"
			echo "   source for the package components. if 'svn' is specified the source components" 
			echo "   will always be fetched from the specified subversion repository. if 'local' is"
			echo "   specified components will only be fetched from svn when they are locally available."
			echo "   than directly compiling the script source file from SVN. Default is 'svn'"
			echo "   (Useful if you want to apply changes to the script source)."
			echo "-c <Repository source URL>"
			echo "   specify the URL of the SVN Repository containing the JonDoFox profiles module."
			echo "   Default is https://svn.jondos.de/svnpub/JonDoFox_Profile/trunk/ ."
			echo "-h prints this help text." 
			echo ""
			exit 0
			;;
		*) ;;
	esac
	getopts "${OPTSTR}" CMD_OPT
done

#set platforms to build for
if [ "${BUILD_PLATFORMS}" ]; then
	for i in ${BUILD_PLATFORMS}; do
		checkPlatform "$i"
		if [ $? -ne 0 ]; then
			exit 1
		fi
	done
else
	BUILD_PLATFORMS="${ALL_PLATFORMS}"
fi

#set profile types tobuild
if [ "${JONDOFOX_PROFILE_TYPES}" ]; then
	for i in ${JONDOFOX_PROFILE_TYPES}; do
		checkType "$i"
		if [ $? -ne 0 ]; then
			exit 1
		fi
	done
else
	JONDOFOX_PROFILE_TYPES="${ALL_TYPES}"
fi

if [ "${JONDOFOX_PROFILE_LANGS}" ]; then
	for i in ${JONDOFOX_PROFILE_LANGS}; do
		checkLang "$i"
		if [ $? -ne 0 ]; then
			exit 1
		fi
	done
else
	JONDOFOX_PROFILE_LANGS="${ALL_LANGS}"
fi

createSelectedPackages
exit 0