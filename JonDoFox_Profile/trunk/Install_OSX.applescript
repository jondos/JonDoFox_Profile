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
  * 2007 by Simon Pecher, JonDos GmbH 
  *)

global firefox_profiles_path --firefox profile folder's path (as string)
global install_bundle_name --name of the install bundle folder
global jondoprofile_foldername -- name of the JondoFox profile folder (within firefox_profile_path)
global profile_ini_backup_name -- name for the file profiles.ini backup file
global profiles_ini --alias for profiles.ini
global profile_parent_folder -- name of the profile's parent folder in the installation bundle
global profile_version_prefix --the JonDoFox profile version prefix in prefs.js
global new_version_str --the version string of the profile to install
global old_version_str --the version string of the already installed JonDoFox profile (if there is one)

global jondofox_bookmarks_ff3 --name of the bookmarksfile (FireFox3)
global jondofox_bookmarks_ff2 --name of the bookmarksfile (FireFox2)
global saved_bookmarks --where the old bookmarks are saved

-- dialog variables
global jfx_dialog_title

on run
	set err to 0
	-- initialize global variables	
	set install_bundle_name to "Install_OSX.app"
	set jondoprofile_foldername to "profile"
	set profile_ini_backup_name to "profiles.ini.bak"
	set profile_version_prefix to "local_install.titleTemplate"
	tell application "System Events" to set firefox_profiles_path to the (path of home folder as string) & "Library:Application Support:Firefox:"
	tell application "Finder" to set the profile_parent_folder to (the container of the (path to me) as string) & install_bundle_name & ":Contents:Resources:"
	set jondofox_bookmarks_ff3 to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":places.sqlite"
	set jondofox_bookmarks_ff2 to firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":bookmarks.html"
	set saved_bookmarks to ""
	
	get_new_version()
	
	set jfx_dialog_title to "JonDoFox " & new_version_str & " OS X Installer"
	
	display dialog "This will add the JonDoFox profile version " & new_version_str & " to your Firefox profiles." buttons {"OK", "Cancel"} with icon caution with title jfx_dialog_title
	
	if (button returned of result = "Cancel") then
		return 0
	end if
	
	-- We assume that if there are no saved settings of Firefox, it isn't installed.
	try
		set profiles_ini to the (firefox_profiles_path & "profiles.ini") as alias
	on error
		display dialog "Sorry, but you don't have Firefox installed. For installing JonDoFox you need Firefox 2.x or newer." buttons {"OK"} with icon stop with title jfx_dialog_title
		set err to 1
	end try
	
	-- main handler: first edit the profiles.ini ... 
	if (err = 0) then
		-- if Firefox is running during the installation it may fail, so quit Firefox.
		tell application "System Events"
			if the process "Firefox" exists then
				set firefox_is_running to true
			else
				set firefox_is_running to false
			end if
		end tell
		
		if (firefox_is_running) then
			display dialog "Your Firefox is still running. If you continue Firefox will be closed. Otherwise JonDoFox installation may fail" buttons {"Continue", "Abort"} with icon caution with title jfx_dialog_title
			if (button returned of result = "Abort") then
				return 2
			else
				tell application "Firefox" to quit
			end if
		end if
		
		set err to edit_profiles_ini()
	end if
	
	-- ... if successful: copy the folder containing the JonDoFox profile
	if (err = 0) then
		set err to copy_folder()
	end if
	-- installation procedure successful
	if (err = 0) then
		display dialog "JonDoFox profile successfully installed" buttons {"OK"} with icon note with title jfx_dialog_title
	end if
	-- installation procedure failed
	if (err = 1) then
		display dialog "An Error occured: JonDoFox profile could not be installed" buttons {"OK"} with icon stop with title jfx_dialog_title
	end if
	return err
end run

-- appends JonDoFox profile to profiles.ini
on edit_profiles_ini()
	
	tell application "Finder"
		if (the file profiles_ini exists) then
			set profiles_ini_URL to get the URL of the file profiles_ini
		else
			display dialog "Error: couldn't read Firefox profile.ini" buttons {"OK"} with icon stop with title jfx_dialog_title
			return 1
		end if
	end tell
	
	set profiles_ini_path to getAbsolutePath(profiles_ini_URL)
	try
		set jdf_str to do shell script "fgrep Name=JonDoFox " & profiles_ini_path
	on error
		set jdf_str to "naught"
	end try
	
	set next_profile_header to get_next_profile(profiles_ini)
	if ("---" is in next_profile_header) then
		display dialog "Error: cannot find a valid profile entry." buttons {"OK"} with icon stop with title jfx_dialog_title
		return 1
	end if
	set complete_entry to {next_profile_header, "Name=JonDoFox", "IsRelative=1", "Path=Profiles/" & jondoprofile_foldername}
	
	-- Detection of an already installed JonDoFox profile. 
	-- (Then replace it without messing up the profiles.ini with useless entries)
	if ("Name=JonDoFox" is in jdf_str) then
		get_old_version()
		if (old_version_str is equal to "???") then
			return 1
		end if
		if (old_version_str is equal to new_version_str) then
			display dialog "You have already installed a JonDoFox profile of the same version (" & old_version_str & ")." & return & return & "If you continue it will be replaced.  Your Bookmarks will be kept." buttons {"Continue", "Abort"} with icon note with title jfx_dialog_title
			if (button returned of result = "Continue") then
				copy_bookmarks()
				return 0
			else
				return 2
			end if
		else
			if (old_version_str is greater than new_version_str) then
				display dialog "Warning: You have already installed a JonDoFox profile of a newer version (" & old_version_str & ")." & return & return & "If you 	continue it will be replaced with the older version. Your Bookmarks will be kept." & new_version_str buttons {"Continue", "Abort"} with icon caution with title jfx_dialog_title
				if (button returned of result = "Continue") then
					copy_bookmarks()
					return 0
				else
					return 2
				end if
			else
				display dialog "You have already installed an older version of the JonDoFox profile (" & old_version_str & ")." & return & return & "Click continue to upgrade it to version. Your Bookmarks will be kept." & new_version_str buttons {"Continue", "Abort"} with icon note with title jfx_dialog_title
				if (button returned of result = "Continue") then
					copy_bookmarks()
					return 0
				else
					return 2
				end if
			end if -- installed version is newer 
		end if -- versions equal
	end if -- JonDoFox profile already installed
	-- saving old version of profiles.ini
	backup_profile_ini()
	
	-- modify profiles.ini
	tell application "Finder"
		if (the file (firefox_profiles_path & profile_ini_backup_name) exists) then
			set profiles_ini_bak_URL to get the URL of the file (firefox_profiles_path & profile_ini_backup_name)
		else
			display dialog "Error: the file profiles.ini.bak was not found." buttons {"OK"} with icon stop with title jfx_dialog_title
			return 1
		end if
	end tell
	
	set profiles_ini_bak_path to getAbsolutePath(profiles_ini_bak_URL)
	
	do shell script "cat " & profiles_ini_bak_path & "| sed /StartWithLastProfile=1/s//StartWithLastProfile=0/  > " & profiles_ini_path
	do shell script "echo >>  " & profiles_ini_path
	
	repeat with curr_line in complete_entry
		do shell script "echo " & curr_line & " >> " & profiles_ini_path
	end repeat
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
		end tell
	on error
		--if something goes wrong: restore old settings from backup file
		restore_old_settings()
		display dialog "Error: couldn't find Firefox profile folder" buttons {"OK"} with icon stop with title jfx_dialog_title
		return 1
	end try
	return 0
end copy_folder

-- find out the number of installed profiles 
on get_next_profile(prof_file)
	tell application "Finder"
		if (the file prof_file exists) then
			set prof_file_URL to get the URL of the file prof_file
		else
			return "---"
		end if
	end tell
	set prof_file_path to getAbsolutePath(prof_file_URL)
	try
		set next_entry_nr to do shell script "grep \\\\[Profile.*\\\\] " & prof_file_path & " | tail -n 1 | xargs -I % expr % : \"\\[Profile\\(.*\\)\\]\" | xargs -I % expr % + 1"
	on error
		return "---"
	end try
	set profile_header to "[Profile" & (next_entry_nr) & "]"
	return profile_header
end get_next_profile

--saves the existing jondofox bookmarks
on copy_bookmarks()
	tell application "Finder"
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
		move the jondofox_bookmarks_file to the temp_folder with replacing
	end tell
end copy_bookmarks

-- create a backup of profile.ini
on backup_profile_ini()
	try
		tell application "Finder"
			if (the file (firefox_profiles_path & profile_ini_backup_name) exists) then
				delete (firefox_profiles_path & profile_ini_backup_name) as alias
				empty trash
			end if
			set backup_file to (duplicate profiles_ini to (firefox_profiles_path as alias))
			set name of backup_file to profile_ini_backup_name as Unicode text
		end tell
	on error
		display dialog "Error occured while saving profiles.ini." buttons {"OK"} with icon stop with title jfx_dialog_title
	end try
end backup_profile_ini

-- restore old settings in case the copy process of the JonDoFox profile folder fails 
on restore_old_settings()
	try
		tell application "Finder"
			if (the file (firefox_profiles_path & profile_ini_backup_name) exists) then
				delete profiles_ini
				empty trash
				set backup_file to the file (firefox_profiles_path & profile_ini_backup_name)
				set name of backup_file to "profiles.ini" as Unicode text
			end if
		end tell
	on error
		display dialog "Error occured while restoring old settings." buttons {"OK"} with icon stop with title jfx_dialog_title
	end try
end restore_old_settings

-- sets the version string of the profile to install
on get_new_version()
	set new_version_str to get_version(profile_parent_folder & jondoprofile_foldername & ":prefs.js")
end get_new_version

-- sets the version string of the already installed JonDoFox profile (if there is one)
on get_old_version()
	set old_version_str to get_version(firefox_profiles_path & "Profiles:" & jondoprofile_foldername & ":prefs.js")
end get_old_version

on getAbsolutePath(fileURL)
	--this just cuts off the prefix "file://localhost"
	set path_string to text 17 thru -1 of fileURL
	
	--whitespace are encoded as URLs as %20. replace it with "\ " for shell commands
	set whitespace_encoded to the offset of "%20" in path_string
	repeat while (whitespace_encoded is not 0)
		set temp_str1 to text 1 thru (whitespace_encoded - 1) of path_string
		set temp_str2 to text (whitespace_encoded + 3) thru -1 of path_string
		set path_string to temp_str1 & "\\ " & temp_str2
		set whitespace_encoded to the offset of "%20" in path_string
	end repeat
	return path_string
end getAbsolutePath

-- parses the version string from the specified prefs.js file
on get_version(prefs_js_file)
	
	tell application "Finder"
		
		if (the file prefs_js_file exists) then
			set parent_pathURL to get the URL of the file prefs_js_file
		else
			return "???"
		end if
	end tell
	set parent_path to getAbsolutePath(parent_pathURL)
	try
		set rawVersionResult to do shell script "grep JonDoFox.*Version " & parent_path
	on error
		return "???"
	end try
	
	-- extracts the version number
	set version_str_offset to the offset of "{Version}-" in rawVersionResult
	if (version_str_offset is not null) then
		set version_str to text (version_str_offset + 10) thru -4 of rawVersionResult
	else
		return "???"
	end if
	
	return version_str
end get_version

