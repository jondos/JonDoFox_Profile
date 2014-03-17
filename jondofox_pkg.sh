#/bin/bash

####################################################################################################
#                                                                                                  #
#  Copyright (c) The JAP-Team, JonDos GmbH                                                         #
#  All rights reserved.                                                                            #
#  Redistribution and use in source and binary forms, with or without modification, are permitted  #
#  provided that the following conditions are met:                                                 #
#     * Redistributions of source code must retain the above copyright notice, this list of        #
#	conditions and the following disclaimer.                                                   #
#     * Redistributions in binary form must reproduce the above copyright notice,                  #
#	this list of conditions and the following disclaimer in the documentation and/or           #
#	other materials provided with the distribution.                                            #
#     * Neither the name of the University of Technology Dresden, Germany, nor the name of         #
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

## bash script for creating JonDoFox packages for each platform
## NOTE: Mac OS X package creation only works with Mac OS X builtin tools.
## It's RECOMMENDED NOT to RUN this script IN YOUR SVN WORKING COPY FOLDER because 
## of the cleanups after the packaging process, which can result in deletions when you 
## commit working copy changes. Best way is to make a copy of the working copy and 
## then create the packages there. 

VERBOSE="1"

OS_X_INSTALLER_NAME="Install_OSX"
OS_X_INSTALLER_BUNDLE="${OS_X_INSTALLER_NAME}.app"
OS_X_INSTALLER_SRC="${OS_X_INSTALLER_NAME}.applescript"
OS_X_INSTALLER_PKG_NAME="JonDoFox_OS_X"
OS_X_INSTALLER_PKG=""
OS_X_INSTALLER_ICON="applet.icns"
OS_X_INSTALER_ICON_SVN_PATH="icons/macosx"
OS_X_INSTALLER_ICON_SRC="${OS_X_INSTALER_ICON_SVN_PATH}/jondofox_std.icns"
OS_X_INSTALLER_LANGFILE_NAME="jfx"
OS_X_INSTALLER_LANGFILE_SUFFIX=".plist"
OS_X_INSTALLER_LANGFILE="${OS_X_INSTALLER_LANGFILE_NAME}${OS_X_INSTALLER_LANGFILE_SUFFIX}"

BASH_INSTALLER_SCRIPT="install_linux.sh"
VB_INSTALLER_SCRIPT="install_win.vbs"
INSTALLER_HELP_NAME="INSTALL"
INSTALLER_HELP_SUFFIX=".txt"
INSTALLER_HELP_FILE="${INSTALLER_HELP_NAME}${INSTALLER_HELP_SUFFIX}"
GPGSIG="n"

SRC_LOCAL=""

BUNDLE_RESOURCES="Contents/Resources"

JONDOFOX_PROFILE="profile"

JONDOFOX_PROFILE_LANGS=""
BUILD_PLATFORMS=""

ALL_TYPES="full"
ALL_LANGS="de en-US"
ALL_PLATFORMS="mac linux win"

BOOKMARKS_FF3_NAME="places"
BOOKMARKS_FF3_SUFFIX=".sqlite"
BOOKMARKS_FF3="${BOOKMARKS_FF3_NAME}${BOOKMARKS_FF3_SUFFIX}"

SVN_MODULE="https://svn.jondos.de/svnpub/JonDoFox_Profile/trunk"

SEDBIN="sed"

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
			cp -f "${OS_X_INSTALLER_ICON}" "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${OS_X_INSTALLER_ICON}" >& /dev/null
		fi
	else
		svn cat "${SVN_MODULE}/${OS_X_INSTALLER_ICON_SRC}" > "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${OS_X_INSTALLER_ICON}"
		if [ $? -ne 0 ]; then
			echo "Error: could not fetch Mac OS X installer icon"
		fi
	fi
		
		getProfileFolder
		
		if [ $? -ne 0 ] || ! [ -e "${JONDOFOX_PROFILE}" ]; then
			continue
		fi
		
		for lang in ${JONDOFOX_PROFILE_LANGS}; do
			
			checkLang "${lang}"
			if [ $? -ne 0 ]; then
				continue
			fi
			
			setLanguageBookmarks "${lang}"
			if [ $? -ne 0 ]; then
				continue
			fi
			
			if [ "${SRC_LOCAL}" ]; then
				if ! [ -e "${OS_X_INSTALLER_LANGFILE_NAME}_${lang}${OS_X_INSTALLER_LANGFILE_SUFFIX}" ]; then
					svn cat "${SVN_MODULE}/${OS_X_INSTALLER_LANGFILE_NAME}_${lang}${OS_X_INSTALLER_LANGFILE_SUFFIX}" \
							> "${OS_X_INSTALLER_LANGFILE_NAME}_${lang}${OS_X_INSTALLER_LANGFILE_SUFFIX}"
				fi
				cp -f "${OS_X_INSTALLER_LANGFILE_NAME}_${lang}${OS_X_INSTALLER_LANGFILE_SUFFIX}" \
						"${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${OS_X_INSTALLER_LANGFILE}" >& /dev/null
			else
			
				svn cat "${SVN_MODULE}/${OS_X_INSTALLER_LANGFILE_NAME}_${lang}${OS_X_INSTALLER_LANGFILE_SUFFIX}" \
						> "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${OS_X_INSTALLER_LANGFILE}"
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
	
	cleanupOSX
	return 0
}

cleanupOSX()
{
	local type=""
	echo "Cleaning up Mac OS X package components."
	rm -rf ${VERBOSE} "${JONDOFOX_PROFILE}"
	
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

	# we need GNU sed, check if gsed is installed (for BSD)
	if [ `which gsed` ]; then
  	echo "GNU sed found, seems we are on BSD"
  		SEDBIN="gsed"
	fi

	
	for lang in ${JONDOFOX_PROFILE_LANGS}; do
			
		checkLang "${lang}"
		if [ $? -ne 0 ]; then
			continue
		fi

		# prepare the profile
		if [ -d jondofox_linux_bsd ]; then
			rm -r jondofox_linux_bsd
		fi
		mkdir jondofox_linux_bsd

		if [ "${SRC_LOCAL}" ]; then
			cp "INSTALL_${lang}.txt" jondofox_linux_bsd/INSTALL.txt
			cp "${BASH_INSTALLER_SCRIPT}" "jondofox_linux_bsd/install_jondofox.sh"
			cp -r full/profile jondofox_linux_bsd/
		else
			echo "SVN checkout for all files."
			svn cat "${SVN_MODULE}/INSTALL_${lang}.txt" > "jondofox_linux_bsd/INSTALL.txt"
			svn cat "${SVN_MODULE}/${BASH_INSTALLER_SCRIPT}" > "jondofox_linux_bsd/install_jondofox.sh"
			svn export "${SVN_MODULE}/full/${JONDOFOX_PROFILE}" "jondofox_linux_bsd/${JONDOFOX_PROFILE}"
		fi

		chmod -f 755 "jondofox_linux_bsd/install_jondofox.sh"		

		cd "jondofox_linux_bsd/${JONDOFOX_PROFILE}"

                case "${lang}" in 
		   "en-US") 		
                      rm searchplugins/ixquick---deutsch.xml
                      rm searchplugins/ixquick-ssl-pictures---deutsch.xml
                      rm searchplugins/ssl-wikipedia-deutsch.xml
                      rm searchplugins/startpage-https---deutsch.xml
                      ;;
		esac

		# Set bookmarks
		cp "places.sqlite_${lang}" places.sqlite

		# remove unwanted files
		rm places.sqlite_de
		rm places.sqlite_en-US
		if [ -e prefs_portable_de.js ]; then
			rm prefs_portable_de.js
		fi
		if [ -e prefs_portable_en-US.js ]; then
			rm prefs_portable_en-US.js
		fi

		# replace "Arial" by "Liberation Sans"
		$SEDBIN -i "s/Arial/Liberation Sans/" prefs.js
		
		cd ..
                chmod -x "${JONDOFOX_PROFILE}"/searchplugins/*.xml
		chmod -R ugo-x,u+rwX,go+rX,go-w "${JONDOFOX_PROFILE}"
		cd ..

		echo "Creating linux archiv 'jondofox_linux_bsd_${lang}.tar.bz2'"
		
		if [ -e jondofox_linux_bsd_${lang}.tar.bz2 ]; then
			rm -f jondofox_linux_bsd_${lang}.tar.bz2
		fi
		tar -cjf jondofox_linux_bsd_${lang}.tar.bz2 jondofox_linux_bsd 

		if [ -e jondofox_linux_bsd_${lang}.tar.bz2.asc ]; then
			rm -f jondofox_linux_bsd_${lang}.tar.bz2.asc
		fi
		if [ $GPGSIG == "y" ]; then
			gpg -b --armor --default-key=support@jondos.de jondofox_linux_bsd_${lang}.tar.bz2
		fi

		rm -r jondofox_linux_bsd
	done

	return 0
}

createWindowsPackage()
{
	return 0
}

###################################### Helper functions ############################################

## try to fetch profile folder 
getProfileFolder()
{
	
	if ! [ "${SRC_LOCAL}" ] || ! [ -e "${JONDOFOX_PROFILE}" ]; then
		echo "Checking out JonDoFox profile."
		
		svn export "${SVN_MODULE}/full/${JONDOFOX_PROFILE}" "${JONDOFOX_PROFILE}"
		
		if [ $? -ne 0 ]; then
			echo "Error: could not check out profile!"
			return 1
		fi
		
	fi

	return 0
	
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

checkLang()
{
	case "$1" in
		en-US) return 0;;
		
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
	local profile_folder="${JONDOFOX_PROFILE}"
	
	echo "Setting bookmarks for language '${lang}'."
	
	
	local ff3_bookmarks="${profile_folder}/${BOOKMARKS_FF3_NAME}${BOOKMARKS_FF3_SUFFIX}_${lang}"
	
	if ! [ -e "${profile_folder}" ]; then
		echo "Error: no profiles folder found."
		return 1
	fi
	
	if [ -e "${ff3_bookmarks}" ]; then
		verboseMessage "Firefox 3 bookmarks found."
		cp -f ${VERBOSE} "${ff3_bookmarks}" "${profile_folder}/${BOOKMARKS_FF3}"
	else
		echo "Error: No Firefox 3 bookmarks could be found."
		return 1
	fi
	return 0
	
}

##TODO:
removeOldMacProfile()
{
	rm -rvf "${HOME}/Library/Application Support/Firefox/Profiles/profile/"
	mv -f "${HOME}/Library/Application Support/Firefox/profiles.ini.bak" "${HOME}/Library/Application Support/Firefox/profiles.ini" 
}

verboseMessage()
{
	if [ "${VERBOSE}" ]; then
		echo "$1"
	fi
}

OPTSTR="vbhs:l:p:c:d"	
getopts "${OPTSTR}" CMD_OPT
while [ $? -eq 0 ]; 
do
	case ${CMD_OPT} in
		v) VERBOSE="-v";;
		b) GPGSIG="y";;
		p) BUILD_PLATFORMS="${OPTARG}";;
		l) JONDOFOX_PROFILE_LANGS="${OPTARG}";;
		s) case "${OPTARG}" in 
		   		"svn") 		SRC_LOCAL="";;
		   		"local") 	SRC_LOCAL="y";;
		   		*) 			echo "No such component source: ${OPTARG}"
		   					exit 1;;
		   esac;;
		c) SVN_MODULE="${OPTARG}";;
		h) 
			echo 'JonDoFox Package Creator 0.1 (2008 Copyright (c) JonDos GmbH)'
			echo "usage: $0 [options]"
			echo 'possible options are:'
			echo '-v prints verbose information about the packaging progress.'
			echo '-p [mac | linux | win]'  
			echo '   the platform of the JonDoFox installer to be created.' 
			echo '   Multiple platforms can be specified in quotes separated by whitespace'
			echo '   If nothing is specified, all platforms are selected.'
			echo '-b create the OpenPGP signatures for Linux packages.'
			echo '-l [de | en]'
			echo '   the language of the JonDoFox installer package to be created.' 
			echo '   Multiple languages can be specified in quotes separated by whitespace'
			echo '   If nothing is specified, all languages are selected.'
			echo '-s [svn | local]'
			echo '   source for the package components. if svn is specified the source components' 
			echo '   will always be fetched from the specified subversion repository. if local is'
			echo '   specified components will only be fetched from svn when they are locally available.'
			echo '   than directly compiling the script source file from SVN. Default is svn'
			echo '   (Useful if you want to apply changes to the script source).'
			echo '-c <Repository source URL>'
			echo '   specify the URL of the SVN Repository containing the JonDoFox profiles module.'
			echo '   Default is https://svn.jondos.de/svnpub/JonDoFox_Profile/trunk/ .'
			echo '-h prints this help text.' 
			echo ''
			exit 0
			;;

		d) removeOldMacProfile
		   exit 0;;
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

