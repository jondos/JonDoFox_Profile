#/bin/sh

BUILD_PLATFORM=""
VERBOSE=""

OS_X_INSTALLER_NAME="Install_OSX"
OS_X_INSTALLER_BUNDLE="${OS_X_INSTALLER_NAME}.app"
OS_X_INSTALLER_SRC="${OS_X_INSTALLER_NAME}.applescript"
OS_X_INSTALLER_PKG_NAME="JonDoFox_OS_X"
OS_X_INSTALLER_PKG=""
OS_X_SCRIPTSRC_LOCAL=""

BUNDLE_RESOURCES="Contents/Resources"

JONDOFOX_PROFILE="profile"
JONDOFOX_PROFILE_TYPE=""
JONDOFOX_PROFILE_LANG=""

TYPE_FULL=""
TYPE_LITE=""
LANG_DE=""
LANG_EN=""

BOOKMARKS_FF3_NAME="places"
BOOKMARKS_FF3_SUFFIX=".sqlite"
BOOKMARKS_FF3="${JONDOFOX_PROFILE}/${BOOKMARKS_FF3_NAME}${BOOKMARKS_FF3_SUFFIX}"

BOOKMARKS_FF2_NAME="bookmarks"
BOOKMARKS_FF2_SUFFIX=".html"
BOOKMARKS_FF2="${JONDOFOX_PROFILE}/${BOOKMARKS_FF2_NAME}${BOOKMARKS_FF2_SUFFIX}"

SVN_MODULE="https://svn.jondos.de/svnpub/JonDoFox_Profile/trunk"

createOSXBundle()
{
	#if ! [ "${JONDOFOX_PROFILE_TYPE}" ]; then
	#	echo "Error: cannot create package, no package type set."
	#	return 1
	#fi
	
	#if ! [ "${JONDOFOX_PROFILE_LANG}" ]; then
	#	echo "Error: cannot create package, no package language set."
	#	return 1
	#fi
	
	local type=""
	local lang=""
	
	echo "Preparing Mac OS X installer bundle"
	if [ "${OS_X_SCRIPTSRC_LOCAL}" ]; then
		
		verboseMessage "compiling from local script source."
		
		if ! [ -e "${OS_X_INSTALLER_SRC}" ]; then
			
			verboseMessage "script source not found: will get it from ${SVN_MODULE}/${OS_X_INSTALLER_SRC}"
			svn cat "${SVN_MODULE}/${OS_X_INSTALLER_SRC}" > "${OS_X_INSTALLER_SRC}"
		fi
		osacompile -o "${OS_X_INSTALLER_BUNDLE}" "${OS_X_INSTALLER_SRC}"
	else
		svn cat "${SVN_MODULE}/${OS_X_INSTALLER_SRC}" | osacompile -o "${OS_X_INSTALLER_BUNDLE}"
	fi
	
	if ! [ -e  "${OS_X_INSTALLER_BUNDLE}" ]; then
		echo "Error: Mac OS X installer bundle could not be created."
		return 1
	fi
	
	for type in "${TYPE_FULL}" "${TYPE_LITE}"; do
	
		if ! [ "${type}" ]; then
			continue
		fi
		setPackageType "${type}"
		
		rm -rf "${JONDOFOX_PROFILE}"
		echo "Checking out JonDoFox profile."
		svn checkout "${SVN_MODULE}/${JONDOFOX_PROFILE_TYPE}/${JONDOFOX_PROFILE}" >& /dev/null
	
		for lang in "${LANG_DE}" "${LANG_EN}"; do
			
			if ! [ "${lang}" ]; then
				continue
			fi
			setPackageLang "${lang}"
			setLanguageBookmarks
			if [ $? -ne 0 ]; then
				continue
			fi
			
			rm -rf "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${JONDOFOX_PROFILE}"
			echo "Copy profile to Install Bundle."
			cp -R  "${JONDOFOX_PROFILE}" "${OS_X_INSTALLER_BUNDLE}/${BUNDLE_RESOURCES}/${JONDOFOX_PROFILE}"
	
			OS_X_INSTALLER_PKG="${OS_X_INSTALLER_PKG_NAME}_${JONDOFOX_PROFILE_TYPE}_${JONDOFOX_PROFILE_LANG}.dmg"
	
			if [ -e "${OS_X_INSTALLER_PKG}" ]; then
				verboseMessage "Warning old installer package ${OS_X_INSTALLER_PKG} exists: will remove it."
				rm -f "${OS_X_INSTALLER_PKG}"
			fi
			echo "Creating dmg file."
			hdiutil create -srcfolder "${OS_X_INSTALLER_BUNDLE}" "${OS_X_INSTALLER_PKG}"
		done
	done
	
	echo "Cleaning up"
	cleanupOSX
	return 0
}

cleanupOSX()
{
	rm -rf ${VERBOSE} ${JONDOFOX_PROFILE}
	rm -rf ${VERBOSE} ${OS_X_INSTALLER_BUNDLE}
}

createPackage()
{
	#if ! [ "${JONDOFOX_PROFILE_TYPE}" ]; then
	#	echo "Error: cannot create package, no package type set."
	#	return 1
	#fi
	
	#if ! [ "${JONDOFOX_PROFILE_LANG}" ]; then
	#	echo "Error: cannot create package, no package language set."
	#	return 1
	#fi
	
	case "$BUILD_PLATFORM" in
		mac*) 
			echo "building JonDoFox package for Mac OS X."
			createOSXBundle;;
		lin*) 
			echo "building JonDoFOx package for Linux.";;
		win*) 
			echo "building JonDoFOx package for Windows.";;
		*) 
			echo "ERROR: No such platform supported: ${BUILD_PLATFORM}"
			return 1;;
	esac
	return 0
}

setPackageType()
{
	JONDOFOX_PROFILE_TYPE=$1
	case "${JONDOFOX_PROFILE_TYPE}" in
		full) echo "Creating 'JonDoFox Full' installer package"
				return 0;;
		lite) echo "Creating 'JonDoFox Lite' installer package"
				return 0;;
		*) echo "Error: no such profile type: ${JONDOFOX_PROFILE_TYPE}"
				JONDOFOX_PROFILE_TYPE=""
				return 1;;
	esac
}

setPackageLang()
{
	JONDOFOX_PROFILE_LANG=$1
	case "${lang}" in
		en) echo "Creating english JonDoFox installer package"
			return 0;;
		de) echo "Creating german JonDoFox installer package"
			return 0;;
		*) echo "Error: no such profile language: ${JONDOFOX_PROFILE_LANG}"
			JONDOFOX_PROFILE_LANG=""
			return 1;;
	esac
}

setLanguageBookmarks()
{
	local ff3_bookmarks="${JONDOFOX_PROFILE}/${BOOKMARKS_FF3_NAME}${BOOKMARKS_FF3_SUFFIX}_${JONDOFOX_PROFILE_LANG}"
	local ff2_bookmarks="${JONDOFOX_PROFILE}/${BOOKMARKS_FF2_NAME}_${JONDOFOX_PROFILE_LANG}${BOOKMARKS_FF2_SUFFIX}"
	
	if ! [ -e "${JONDOFOX_PROFILE}" ]; then
		echo "Error: no profiles folder found."
		return 1
	fi
	
	if ! [ "${JONDOFOX_PROFILE_LANG}" ]; then
		echo "Error: cannot set bookmarks, no package language set."
		return 1
	fi
	
	if [ -e "${ff3_bookmarks}" ]; then
		verboseMessage "Firefox 3 bookmarks found."
		mv -f "${ff3_bookmarks}" "${BOOKMARKS_FF3}"
	elif [ -e "${ff2_bookmarks}" ]; then
		verboseMessage "Firefox 2 bookmarks found."
		mv -f "${ff2_bookmarks}" "${BOOKMARKS_FF2}"
	else
		echo "Error: Neither Firefox 3 nor Firefox 2 bookmarks could be found."
		return 1
	fi
	return 0
	
}

verboseMessage()
{
	if [ "${VERBOSE}" ]; then
		echo "$1"
	fi
}

OPTSTR="p:vhcl:t:"	
getopts "${OPTSTR}" CMD_OPT
while [ $? -eq 0 ]; 
do
	case ${CMD_OPT} in
		v) VERBOSE="-v";;
		p) BUILD_PLATFORM="${OPTARG}";;
		c) OS_X_SCRIPTSRC_LOCAL="y";;
		h) 
			echo "JonDoFox Package Creator (2008 Copyright (c) JonDos GmbH)"
			echo "usage: $0 [options]"
			echo "possible options are:"
			echo "-v prints verbose about the packaging progress."
			echo "-p [ mac | linux | windows ]  the platform of the JonDoFox installer."
			echo "-c for Mac OS X packaging: try to compile from a local script source file rather 
			echo "			than directly compiling the script source file from SVN.
			echo "			(Useful if you want to apply changes to the script source)."
			echo "-h prints this help text." 
			echo ""
			exit 0
			;;
		*) ;;
	esac
	getopts "${OPTSTR}" CMD_OPT
done

TYPE_FULL="full"
TYPE_LITE="lite"
LANG_DE=""
LANG_EN="en"

createPackage