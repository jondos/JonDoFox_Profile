(* 
Copyright (c) The JAP-Team, JonDos GmbH

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation and/or
       other materials provided with the distribution.
    * Neither the name of the University of Technology Dresden, Germany, nor the name of
       the JonDos GmbH, nor the names of their contributors may be used to endorse or
       promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   
  * JonDoFox profile installation script for Mac OS X
  * 2007 by Simon Pecher, 
  * 2011 slightly enhanced by Georg Koppen JonDos GmbH
  *)

global firefox_profiles_path --firefox profile folder's path (as string)
global firefox_profiles_path_posix
global install_bundle_name --name of the install bundle folder
global jondoprofile_foldername -- name of the JondoFox profile folder (within firefox_profile_path)
global profile_ini_backup_name -- name for the file profiles.ini backup file
global profiles_ini --alias for profiles.ini
global profiles_ini_path --the Unix notation path to profiles.ini 
global profile_parent_folder -- name of the profile's parent folder in the installation bundle
global profile_version_prefix --the JonDoFox profile version prefix in prefs.js
global new_version_str --the version string of the profile to install
global old_version_str --the version string of the already installed JonDoFox profile (if there is one)

global jondofox_bookmarks_ff3 --name of the bookmarksfile (FireFox3)
global jondofox_bookmarks_ff2 --name of the bookmarksfile (FireFox2)
global saved_bookmarks --where the old bookmarks are saved
global cert_database --name of the Certificate Patrol database file
global saved_certdatabase --where the Certificate Patrol database is saved
global STS_database --name of the NoScript STS database file
global saved_STSdatabase -- where the NoScript STS database is saved
global HTTPS_userRulesDirectory -- name of the directory for HTTPS Everywhere rules
global saved_HTTPS_userRulesDirectory -- where the HTTPS Everyhwere user rules are saved
global prefs_file
global prefs_file_path -- prefs.js, quoted and in POSIX form
global saved_noscript_sts
global saved_noscript_sts_path -- saved userdefined STS rules in NoScript quoted and in POSIX form
global backup_noscript_sts -- backup of Noscript's STS rules

-- dialog variables
global jfx_dialog_title
global buttonCancel
global buttonContinue
global buttonOK
global buttonInstall
global buttonUninstall

global lang_props_filename
global lang_props
global langPropsList
global os_x_compat

on run
	set err to 0
	-- initialize global variables	
	set install_bundle_name to "Install_OSX.app"
	set jondoprofile_foldername to "profile"
	set profile_ini_backup_name to "profiles.ini.bak"
	set profile_version_prefix to "local_install.titleTemplate"
	tell application "System Events" to set firefox_profiles_path to the (path of home folder as string) & "Library:Application Support:Firefox:"
	set firefox_profiles_path_posix to quoted form of (POSIX path of firefox_profiles_path)
	tell application "Finder" to set the profile_parent_folder to (the container of the (path to me) as string) & install_bundle_name & ":Contents:Resources:"
	set os_x_compat to check_os_x_compatibility()
	set jondofox_bookmarks_ff3 to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":places.sqlite"
	set jondofox_bookmarks_ff2 to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":bookmarks.html"
	set cert_database to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":CertPatrol.sqlite"
	set STS_database to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":NoScriptSTS.db"
	set HTTPS_userRulesDirectory to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":HTTPSEverywhereUserRules"
	set prefs_file to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":prefs.js"
	set prefs_file_path to quoted form of (POSIX path of prefs_file)
	set saved_noscript_sts to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":Noscript_httpsforced.conf"
	set saved_noscript_sts_path to quoted form of (POSIX path of saved_noscript_sts)
	set backup_noscript_sts to firefox_profiles_path & "Noscript_httpsforced.conf"
	set saved_bookmarks to ""
	set saved_certdatabase to ""
	set saved_STSdatabase to ""
	set saved_HTTPS_userRulesDirectory to ""
	
	set lang_props to null
	set lang_props_filename to "jfx.plist"
	
	get_new_version()
	
	set jfx_dialog_title to replacePlaceHolder(getLangProperty("Title"), "%version", new_version_str)
	set buttonCancel to getLangProperty("ButtonCancel")
	set buttonContinue to getLangProperty("ButtonContinue")
	set buttonOK to getLangProperty("ButtonOK")
	set buttonInstall to getLangProperty("ButtonInstall")
	set buttonUninstall to getLangProperty("ButtonUninstall")
	
	-- We assume that if there are no saved settings of Firefox, it isn't installed.
	try
		set profiles_ini to the (firefox_profiles_path & "profiles.ini") as alias
		if (os_x_compat < 7) then
			tell application "Finder" to set profiles_ini_URL to get the URL of the file profiles_ini
		end if
	on error
		display dialog getLangProperty("ErrorFFNotInstalled") buttons {buttonOK} ¬
			with icon stop with title jfx_dialog_title default button buttonOK
		return 1
	end try
	
	if (os_x_compat < 7) then
		set profiles_ini_path to getAbsolutePath(profiles_ini_URL)
	else
		set profiles_ini_path to getAbsolutePath(profiles_ini)
	end if
	
	if isJonDoFoxProfileInstalled() then
		display dialog getLangProperty("NoteChoiceUninstall") buttons {buttonInstall, buttonUninstall, buttonCancel} ¬
			with icon note with title jfx_dialog_title default button buttonInstall cancel button buttonCancel
		if (button returned of result = buttonUninstall) then
			return uninstall()
		end if
	else
		display dialog replacePlaceHolder(getLangProperty("NoteInstallStart"), "%version", new_version_str) buttons {buttonOK, buttonCancel} ¬
			with icon note with title jfx_dialog_title default button buttonOK cancel button buttonCancel
	end if
	
	-- main handler: first edit the profiles.ini ... 
	if (err is equal to 0) then
		-- if Firefox is running during the installation it may fail, so quit Firefox.
		checkFirefoxRunning(getLangProperty("StrInstall"))
		
		set err to edit_profiles_ini()
	end if
	
	-- ... if successful: copy the folder containing the JonDoFox profile
	if (err is equal to 0) then
		set err to copy_folder()
	end if
	-- installation procedure successful
	if (err is equal to 0) then
		display dialog getLangProperty("NoteInstallSuccessful") buttons {buttonOK} ¬
			with icon note with title jfx_dialog_title default button buttonOK
	end if
	-- installation procedure failed
	if (err is equal to 1) then
		display dialog getLangProperty("ErrorInstallFailed") buttons {buttonOK} ¬
			with icon stop with title jfx_dialog_title default button buttonOK
	end if
	return err
end run

on check_os_x_compatibility()
	tell application "Finder"
		set testURL to get the URL of the file (profile_parent_folder & "jfx.plist")
		-- dbg
		-- display dialog "testURL: " & testURL
	end tell
	
	set suffix to text -9 thru (-1) of testURL
	if (suffix is equal to "jfx.plist") then
		-- dbg
		-- display dialog "os_x_compat: " & 1
		return 1
	else
		-- dbg
		-- display dialog "os_x_compat: " & 7		
		return 7
	end if
end check_os_x_compatibility

-- appends JonDoFox profile to profiles.ini
on edit_profiles_ini()
	
	set next_profile_header to get_next_profile(profiles_ini)
	-- dbg
	-- display dialog "profiles_ini: " & profiles_ini
	-- display dialog "next_profile_header: " & next_profile_header
	
	if ("---" is in next_profile_header) then
		display dialog getLangProperty("ErrorProfileEntry") buttons {buttonOK} ¬
			with icon stop with title jfx_dialog_title default button buttonOK
		return 1
	end if
	set complete_entry to {next_profile_header, "Name=JonDoFox", "IsRelative=1", "Path=Profiles/" & jondoprofile_foldername, "Default=1"}
	
	-- Detection of an already installed JonDoFox profile. 
	-- (Then replace it without messing up the profiles.ini with useless entries)
	if (isJonDoFoxProfileInstalled()) then
		get_old_version()
		if (old_version_str is equal to "???") then
			return 0
		end if
		
		considering numeric strings
			if (old_version_str is equal to new_version_str) then
				display dialog replacePlaceHolder(getLangProperty("NoteOverwriteSameVersion"), "%version", new_version_str) ¬
					buttons {buttonContinue, buttonCancel} with icon note with title jfx_dialog_title default button buttonContinue cancel button buttonCancel
			else
				if (old_version_str is greater than new_version_str) then
					set new_ver_replaced to replacePlaceHolder(getLangProperty("WarningOlderVersion"), "%newerversion", old_version_str)
					display dialog replacePlaceHolder(new_ver_replaced, "%olderversion", new_version_str) buttons {buttonContinue, buttonCancel} ¬
						with icon caution with title jfx_dialog_title default button buttonContinue cancel button buttonCancel
				else
					set new_ver_replaced to replacePlaceHolder(getLangProperty("NoteOverwriteOlderVersion"), "%newerversion", new_version_str)
					display dialog replacePlaceHolder(new_ver_replaced, "%olderversion", old_version_str) buttons {buttonContinue, buttonCancel} ¬
						with icon note with title jfx_dialog_title default button buttonContinue cancel button buttonCancel
				end if -- installed version is newer 
			end if -- versions equal
		end considering
		-- in either case copy bookmarks
		copy_bookmarks()
		-- reset the entry "StartWithLastProfile"
		if (os_x_compat < 7) then
			tell application "Finder" to set prftemp_parent_URL to the URL of the parent of profiles_ini
			set prftemp_path to getAbsolutePath(prftemp_parent_URL) & "/pfrtemp"
			
			do shell script "cp " & profiles_ini_path & " " & prftemp_path
			do shell script "cat " & prftemp_path & " | sed -e s/StartWithLastProfile=1/StartWithLastProfile=0/ > " & profiles_ini_path
			do shell script "rm -f " & prftemp_path
		else
			set prftemp_path to getAbsolutePath(firefox_profiles_path) & "/pfrtemp"
			do shell script "cp \"" & profiles_ini_path & "\" \"" & prftemp_path & "\""
			do shell script "cat \"" & prftemp_path & "\" | sed -e s/StartWithLastProfile=1/StartWithLastProfile=0/ > \"" & profiles_ini_path & "\""
			do shell script "rm -f \"" & prftemp_path & "\""
		end if
		
		
		return 0
	end if -- JonDoFox profile already installed
	-- saving old version of profiles.ini
	backup_profile_ini()
	
	-- modify profiles.ini
	tell application "Finder" to set backupExists to (file (firefox_profiles_path & profile_ini_backup_name) exists)
	
	if (backupExists) then
		if (os_x_compat < 7) then
			tell application "Finder" to set profiles_ini_bak_URL to the URL of the file (firefox_profiles_path & profile_ini_backup_name)
		else
			set profiles_ini_bak_file to (firefox_profiles_path & profile_ini_backup_name)
		end if
	else
		display dialog getLangProperty("ErrorIniBackupFile") buttons {buttonOK} ¬
			with icon stop with title jfx_dialog_title default button buttonOK
		return 1
	end if
	
	if (os_x_compat < 7) then
		set profiles_ini_bak_path to getAbsolutePath(profiles_ini_bak_URL)
		
		do shell script "cat " & profiles_ini_bak_path & "| sed -e s/StartWithLastProfile=1/StartWithLastProfile=0/  -e s/Default=1// > " & profiles_ini_path
		do shell script "echo >>  " & profiles_ini_path
		
		repeat with curr_line in complete_entry
			do shell script "echo " & curr_line & " >> " & profiles_ini_path
		end repeat
	else
		set profiles_ini_bak_path to getAbsolutePath(profiles_ini_bak_file)
		
		do shell script "cat \"" & profiles_ini_bak_path & "\" | sed -e s/StartWithLastProfile=1/StartWithLastProfile=0/  -e s/Default=1// > \"" & profiles_ini_path & "\""
		do shell script "echo >>  \"" & profiles_ini_path & "\""
		
		repeat with curr_line in complete_entry
			do shell script "echo " & curr_line & " >> \"" & profiles_ini_path & "\""
		end repeat
	end if
	return 0
end edit_profiles_ini

-- copies the JonDoFox profile folder to the Firefox profile directory
on copy_folder()
	try
		tell application "Finder"
			duplicate ((profile_parent_folder & jondoprofile_foldername) as alias) to (firefox_profiles_path & "Profiles:" as alias) with replacing
			if (the file saved_bookmarks exists) then
				move the file saved_bookmarks to (firefox_profiles_path & "Profiles:profile" as alias) with replacing
			end if
			if (the file saved_certdatabase exists) then
				move the file saved_certdatabase to (firefox_profiles_path & "Profiles:profile" as alias) with replacing
			end if
			if (the file saved_STSdatabase exists) then
				move the file saved_STSdatabase to (firefox_profiles_path & "Profiles:profile" as alias) with replacing
			end if
			if (the folder saved_HTTPS_userRulesDirectory exists) then
				move the folder saved_HTTPS_userRulesDirectory to (firefox_profiles_path & "Profiles:profile" as alias) with replacing
			end if
			if (the file backup_noscript_sts exists) then
				move the file backup_noscript_sts to (firefox_profiles_path & "Profiles:profile" as alias) with replacing
				do shell script "cat " & saved_noscript_sts_path & " >> " & prefs_file_path & "; rm -f " & saved_noscript_sts_path
			end if
		end tell
	on error
		--if something goes wrong: restore old settings from backup file
		restore_old_settings()
		display dialog getLangProperty("ErrorProfileFolder") buttons {buttonOK} ¬
			with icon stop with title jfx_dialog_title default button buttonOK
		return 1
	end try
	return 0
end copy_folder

on isJonDoFoxProfileInstalled()
	try
		if (os_x_compat < 7) then
			set jdf_str to do shell script "fgrep Name=JonDoFox " & profiles_ini_path
		else
			set jdf_str to do shell script "fgrep Name=JonDoFox \"" & profiles_ini_path & "\""
		end if
	on error
		set jdf_str to ""
	end try
	return ("Name=JonDoFox" is in jdf_str)
end isJonDoFoxProfileInstalled

on uninstall()
	checkFirefoxRunning(getLangProperty("StrUninstall"))
	
	tell application "Finder"
		set backupFound to (file (firefox_profiles_path & profile_ini_backup_name) exists)
		set profileFound to (folder (firefox_profiles_path & "Profiles:profile") exists)
		if (os_x_compat < 7) then
			try
				set ffprofiles_path_URL to the URL of the folder firefox_profiles_path
			on error
				set ffprofiles_path_URL to ""
			end try
		end if
	end tell
	
	if (os_x_compat < 7) then
		if (ffprofiles_path_URL is equal to "") then
			display dialog getLangProperty("ErrorFFNotInstalled") buttons {buttonOK} ¬
				with icon stop with title jfx_dialog_title default button buttonOK
			return 1
		end if
		set ffprofiles_path to getAbsolutePath(ffprofiles_path_URL)
	else
		set ffprofiles_path to getAbsolutePath(firefox_profiles_path)
	end if
	
	set entryFound to isJonDoFoxProfileInstalled()
	
	if (backupFound) then
		set backupFound to (restore_old_settings() is equal to 0)
	end if
	
	if ((not backupFound) and entryFound) then
		try
			if (os_x_compat < 7) then
				do shell script "fgrep -n JonDoFox " & profiles_ini_path & " -A 3 -C 1 | xargs -I % expr % : \"\\(.*\\)[-:].*\" |  xargs -I %  echo -n -e %d\" \" | xargs -J % sed %   " & profiles_ini_path & " > " & ffprofiles_path & ".temp1"
				do shell script "mv -f " & ffprofiles_path & ".temp1 " & profiles_ini_path
			else
				do shell script "fgrep -n JonDoFox \"" & profiles_ini_path & "\" -A 3 -C 1 | xargs -I % expr % : \"\\(.*\\)[-:].*\" |  xargs -I %  echo -n -e %d\" \" | xargs -J % sed %   \"" & profiles_ini_path & "\" > \"" & ffprofiles_path & "\" .temp1"
				do shell script "mv -f \"" & ffprofiles_path & "\" .temp1 \"" & profiles_ini_path & "\""
			end if
		on error
			display dialog getLangProperty("ErrorUndoProfileEntry") buttons {buttonOK} ¬
				with icon stop with title jfx_dialog_title default button buttonOK
			return 1
		end try
	end if
	
	if (profileFound) then
		if (os_x_compat < 7) then
			tell application "Finder" to set profileFolderURL to the URL of the folder (firefox_profiles_path & "Profiles:profile")
			
			set installed_profile_folder to getAbsolutePath(profileFolderURL)
			
			try
				do shell script "rm -rf " & installed_profile_folder
			on error
				display dialog getLangProperty("ErrorRemoveProfileFolder") buttons {buttonOK} ¬
					with icon stop with title jfx_dialog_title default button buttonOK
				return 1
			end try
		else
			tell application "Finder" to set profileFolderURL to the URL of the folder (firefox_profiles_path & "Profiles:profile")
			
			set installed_profile_folder to getAbsolutePath(firefox_profiles_path & "Profiles:profile")
			
			try
				do shell script "rm -rf \"" & installed_profile_folder & "\""
			on error
				display dialog getLangProperty("ErrorRemoveProfileFolder") buttons {buttonOK} ¬
					with icon stop with title jfx_dialog_title default button buttonOK
				return 1
			end try
		end if
	end if
	display dialog getLangProperty("NoteUninstallSuccessful") buttons {buttonOK} ¬
		with icon note with title jfx_dialog_title default button buttonOK
	return 0
end uninstall

on checkFirefoxRunning(operation)
	-- if Firefox is running during the installation it may fail, so quit Firefox.
	tell application "System Events"
		if the process "Firefox" exists then
			set firefox_is_running to true
		else
			set firefox_is_running to false
		end if
	end tell
	
	if (firefox_is_running) then
		display dialog replacePlaceHolder(getLangProperty("WarningCloseFirefox"), "%operation", operation) ¬
			buttons {buttonContinue, buttonCancel} with icon caution with title jfx_dialog_title default button buttonContinue cancel button buttonCancel
		try
			tell application "Firefox" to quit
		on error
			display dialog getLangProperty("ErrorCloseFirefox") buttons {buttonOK} ¬
				with icon stop with title jfx_dialog_title default button buttonOK cancel button buttonOK
		end try
	end if
end checkFirefoxRunning

-- find out the number of installed profiles 
on get_next_profile(prof_file)
	if (os_x_compat < 7) then
		tell application "Finder"
			if (the file prof_file exists) then
				set prof_file_URL to get the URL of the file prof_file
				-- dbg
				-- display dialog "first if --- prof_file_URL: " & prof_file_URL
			else
				-- dbg
				-- display dialog "first else/ret --- prof_file: " & prof_file
				return "---"
			end if
		end tell
		set prof_file_path to getAbsolutePath(prof_file_URL)
		-- dbg
		-- display dialog "dbg prof_file_path: " & prof_file_path

		try
			set next_entry_nr to do shell script "grep \\\\[Profile.*\\\\] " & prof_file_path & " | tail -n 1 | xargs -I % expr % : \"\\[Profile\\(.*\\)\\]\" | xargs -I % expr % + 1"
			-- dbg
			-- display dialog "dbg next_entry_nr: " & next_entry_nr

		on error
			-- dbg
			-- display dialog "second else/ret --- next_entry_nr: " & next_entry_nr
			return "---"
		end try
	else
		set prof_file_path to getAbsolutePath(prof_file)
		try
			set next_entry_nr to do shell script "grep \\\\[Profile.*\\\\]  \"" & prof_file_path & "\" | tail -n 1 | xargs -I % expr % : \"\\[Profile\\(.*\\)\\]\" | xargs -I % expr % + 1"
			-- dbg
			-- display dialog "in else/ret --- next_entry_nr: " & next_entry_nr

		on error
			-- dbg
			-- display dialog "third outer else/ret --- next_entry_nr: " & next_entry_nr
			return "---"
		end try
	end if
	
	if next_entry_nr is equal to "" then
		-- display dialog "last err-handler empty/ret --- next_entry_nr: " & next_entry_nr
		return "---"
	end if
	
	set profile_header to "[Profile" & (next_entry_nr) & "]"
	return profile_header
end get_next_profile

--saves the existing jondofox bookmarks and the cert database, and the STS database, and the HTTPS EverywhereUserRules 
on copy_bookmarks()
	tell application "Finder"
		if (the file cert_database exists) then
			set jondofox_certpatrol_file to cert_database as alias
			set saved_certdatabase to firefox_profiles_path & "CertPatrol.sqlite"
			set temp_folder to firefox_profiles_path as alias
			duplicate the jondofox_certpatrol_file to the temp_folder with replacing
		end if
		if (the file STS_database exists) then
			set jondofox_STS_file to STS_database as alias
			set saved_STSdatabase to firefox_profiles_path & "NoScriptSTS.db"
			set temp_folder to firefox_profiles_path as alias
			duplicate the jondofox_STS_file to the temp_folder with replacing
		end if
		if (folder HTTPS_userRulesDirectory exists) then
			set HTTPS_E_Rules_directory to HTTPS_userRulesDirectory as alias
			set saved_HTTPS_userRulesDirectory to firefox_profiles_path & "HTTPSEverywhereUserRules"
			set temp_folder to firefox_profiles_path as alias
			duplicate the HTTPS_E_Rules_directory to the temp_folder with replacing
		end if
		if (the file prefs_file exists) then
			do shell script "cat " & prefs_file_path & " | grep 'noscript.httpsForced' > " & saved_noscript_sts_path & "; mv " & saved_noscript_sts_path & " " & firefox_profiles_path_posix
			
		end if
		if (the file jondofox_bookmarks_ff3 exists) then
			set jondofox_bookmarks_file to jondofox_bookmarks_ff3 as alias
			set saved_bookmarks to firefox_profiles_path & "places.sqlite"
		else if (the file jondofox_bookmarks_ff2 exists) then
			set jondofox_bookmarks_file to jondofox_bookmarks_ff2 as alias
			set saved_bookmarks to firefox_profiles_path & "bookmarks.html"
		else
			return
		end if
		set temp_folder to firefox_profiles_path as alias
		duplicate the jondofox_bookmarks_file to the temp_folder with replacing
	end tell
end copy_bookmarks

-- create a backup of profile.ini
on backup_profile_ini()
	if (os_x_compat < 7) then
		try
			tell application "Finder" to set tempFirefox_profiles_URL to get the URL of the parent of the file (firefox_profiles_path & "profiles.ini")
			set tempFirefox_profiles_path to getAbsolutePath(tempFirefox_profiles_URL)
			do shell script "cp -f " & tempFirefox_profiles_path & "/profiles.ini " & ¬
				tempFirefox_profiles_path & "/" & profile_ini_backup_name
		on error
			display dialog getLangProperty("ErrorBackupProcess") buttons {buttonOK} ¬
				with icon stop with title jfx_dialog_title default button buttonOK
		end try
	else
		try
			set tempFirefox_profiles_path to getAbsolutePath(firefox_profiles_path)
			do shell script "cp -f \"" & tempFirefox_profiles_path & "/profiles.ini\" \"" & ¬
				tempFirefox_profiles_path & "/" & profile_ini_backup_name & "\""
		on error
			display dialog getLangProperty("ErrorBackupProcess") buttons {buttonOK} ¬
				with icon stop with title jfx_dialog_title default button buttonOK
		end try
	end if
end backup_profile_ini

-- restore old settings in case the copy process of the JonDoFox profile folder fails 
on restore_old_settings()
	if (os_x_compat < 7) then
		tell application "Finder" to set tempFirefox_profiles_URL to get the URL of the parent of the file (firefox_profiles_path & "profiles.ini")
		set tempFirefox_profiles_path to getAbsolutePath(tempFirefox_profiles_URL)
		try
			do shell script "mv -f " & tempFirefox_profiles_path & "/" & profile_ini_backup_name & ¬
				" " & tempFirefox_profiles_path & "/profiles.ini "
		on error
			return 0
		end try
	else
		set tempFirefox_profiles_path to getAbsolutePath(firefox_profiles_path)
		try
			do shell script "mv -f \"" & tempFirefox_profiles_path & "/" & profile_ini_backup_name & "\"" & ¬
				" \"" & tempFirefox_profiles_path & "/profiles.ini\""
		on error
			return 0
		end try
	end if
	return 0
end restore_old_settings

-- sets the version string of the profile to install
on get_new_version()
	-- set new_version_str to get_version(profile_parent_folder & jondoprofile_foldername & ":prefs.js")
	set new_version_str to "2.13.0"
end get_new_version

-- sets the version string of the already installed JonDoFox profile (if there is one)
on get_old_version()
	set old_version_str to get_version(firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":prefs.js")
end get_old_version

on getAbsolutePath(fileURL)
	if (os_x_compat < 7) then
		--this just cuts off the prefix "file://localhost"
		-- causes bug in Mavericks
		-- set path_string to text 17 thru -1 of fileURL
		
		set path_string to text 8 thru -1 of fileURL
		return replacePlaceHolder(path_string, "%20", "\\ ")
	else
		set path_string to "/Volumes/" & (fileURL as text)
		set unix_path_string to replacePlaceHolder(path_string, ":", "/")
		return unix_path_string
	end if
end getAbsolutePath

-- parses the version string from the specified prefs.js file
on get_version(prefs_js_file)
	
	tell application "Finder"
		if (os_x_compat < 7) then
			if (the file prefs_js_file exists) then
				set parent_pathURL to get the URL of the file prefs_js_file
			else
				return "???"
			end if
			
		else
			if (not (the file prefs_js_file exists)) then
				return "???"
			end if
			
		end if
	end tell
	
	if (os_x_compat < 7) then
		set parent_path to getAbsolutePath(parent_pathURL)
	else
		set parent_path to getAbsolutePath(prefs_js_file)
	end if
	
	try
		if (os_x_compat < 7) then
			set versionStr to do shell script "fgrep jondofox.profile_version " & parent_path & " | xargs -I % expr % : \".*, \\([0-9].*[0-9]\\).*\""
		else
			set versionStr to do shell script "fgrep jondofox.profile_version \"" & parent_path & "\" | xargs -I % expr % : \".*, \\([0-9].*[0-9]\\).*\""
		end if
		return versionStr
	on error
		(*try
			set rawVersionResult to do shell script "grep JonDoFox.*Version " & parent_path
			set version_str_offset to the offset of "{Version}-" in rawVersionResult
			if (version_str_offset is not null) then
				set versionStr to text (version_str_offset + 10) thru -4 of rawVersionResult
				return versionStr
			else
				return "???"
			end if
			
		on error
			return "???"
		end try*)
		return ""
	end try
	
	-- extracts the version number
	
end get_version

on getLangProperty(propertyKey)
	tell application "System Events"
		if (lang_props is null) then
			try
				set lang_props to get the contents of the property list file (profile_parent_folder & lang_props_filename)
			on error
				return propertyKey
			end try
			set langPropsList to (property list items of lang_props) as list
		end if
		repeat with p_item in langPropsList
			if name of p_item is equal to propertyKey then
				return (value of p_item)
			end if
		end repeat
	end tell
	return propertyKey
end getLangProperty

on replacePlaceHolder(strWithPlaceholder, placeHolder, value)
	
	set replacedStr to strWithPlaceholder
	set PlaceHolderLength to length of placeHolder
	set placeholder_off to the offset of placeHolder in replacedStr
	
	repeat while (placeholder_off is not 0)
		if (placeholder_off is greater than 1) then
			set temp_str1 to text 1 thru (placeholder_off - 1) of replacedStr
		else
			set temp_str1 to ""
		end if
		
		if ((placeholder_off + PlaceHolderLength) is less than length of replacedStr) then
			set temp_str2 to text (placeholder_off + PlaceHolderLength) thru -1 of replacedStr
		else
			set temp_str2 to ""
		end if
		
		set replacedStr to temp_str1 & value & temp_str2
		set placeholder_off to the offset of placeHolder in replacedStr
	end repeat
	return replacedStr
end replacePlaceHolder

