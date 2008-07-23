#/bin/sh

BUILD_PLATFORM=""

OS_X_INSTALLER_NAME="Install_OSX"
OS_X_INSTALLER_BUNDLE="${OS_X_INSTALLER_NAME}.app"
OS_X_INSTALLER_SRC="${OS_X_INSTALLER_NAME}.applescript"
OS_X_INSTALLER_PKG="JonDoFox_OS_X.dmg"

BUNDLE_RESOURCES="Contents/Resources"

JONDOFOX_PROFILE="profile"

createOSXBundle()
{
	#lang
	#svn fetch
	osacompile -ox ${OS_X_INSTALLER_BUNDLE} ${OS_X_INSTALLER_SRC}
	cp -r "${JONDOFOX_PROFILE}" "${OS_X_INSTALLER_BUNDLE}/${OS_X_BUNDLE_RESOURCES}/${JONDOFOX_PROFILE}"
	hdiutil create -srcfolder ${OS_X_INSTALLER_BUNDLE} ${OS_X_INSTALLER_PKG}
}

createPackage()
{
	case "$BUILD_PLATFORM" in
		mac*) 
			echo "building JonDoFOx package for Mac OS X.";;
			#createOSXBundle;;
		lin*) 
			echo "building JonDoFOx package for Linux.";;
		win*) 
			echo "building JonDoFOx package for Windows.";;
		*) 
			echo "ERROR: No such platform supported: ${BUILD_PLATFORM}";;
	esac
}

## handle command line options
OPTSTR="p:vh"	
getopts "${OPTSTR}" CMD_OPT
while [ $? -eq 0 ]; 
do
	case ${CMD_OPT} in
		v) VERBOSE="-v";;
		p) BUILD_PLATFORM="${OPTARG}";;
		h) 
			echo "JonDoFox Package Creator (2008 Copyright (c) JonDos GmbH)"
			echo "usage: $0 [options]"
			echo "possible options are:"
			echo "-v prints verbose about the packaging progress."
			echo "-p [ mac | linux | windows ]  the platform of the JonDoFox installer."
			echo "-h prints this help text." 
			echo ""
			exit 0
			;;
		*) ;;
	esac
	getopts "${OPTSTR}" CMD_OPT
done

createPackage