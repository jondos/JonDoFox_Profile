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
global saved_bookmarks --where the old bookmarsk are saved

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
	display dialog "This will add the JonDoFox profile version " & new_version_str & " to your Firefox profiles." buttons {"OK", "Cancel"}
	if (button returned of result = "Cancel") then
		return 0
	end if
	
	-- We assume that if there are no saved settings of Firefox, it isn't installed.
	try
		set profiles_ini to the (firefox_profiles_path & "profiles.ini") as alias
	on error
		display dialog "Sorry, but you don't have Firefox installed." buttons {"OK"}
		set err to 1
	end try
	
	-- main handler: first edit the profiles.ini ... 
	if (err = 0) then
		-- if Firefox is running during the installation it may fail, so quit Firefox.
		tell application "System Events"
			if the process "Firefox" exists then
				display dialog "Your Firefox is still running. If you continue Firefox will be closed. Otherwise JonDoFox installation may fail" buttons {"Continue", "Abort"}
				if (button returned of result = "Abort") then
					return 2
				end if
				tell application "Firefox" to quit
			end if
		end tell
		tell application "Firefox" to quit
		set err to edit_profiles_ini()
	end if
	-- ... if successful: copy the folder containing the JonDoFox profile
	if (err = 0) then
		set err to copy_folder()
	end if
	-- installation procedure successful
	if (err = 0) then
		display dialog "JonDoFox profile successfully installed" buttons {"OK"}
	end if
	-- installation procedure failed
	if (err = 1) then
		display dialog "An Error occured: JonDoFox profile could not be installed" buttons {"OK"}
	end if
	return err
end run

-- appends JonDoFox profile to profiles.ini
on edit_profiles_ini()
	--new entries for profiles.ini 
	set profiles_ini_header to "[General]" & return & "StartWithLastProfile=0"
	set jondofox_profile_entry to return & "Name=JonDoFox" & return & "IsRelative=1" & return & "Path=Profiles/" & jondoprofile_foldername
	
	
	--read all the entries from the profile.ini to buf. (This will do because the file shouldn't be incredibly large)
	set profile_ini_fdr to open for access file (profiles_ini as string)
	try
		set buf to read profile_ini_fdr to (get eof profile_ini_fdr)
		close access profile_ini_fdr
	on error
		close access profile_ini_fdr
		display dialog "Error: couldn't read Firefox profile.ini" buttons {"OK"}
		return 1
	end try
	
	-- Detection of an already installed JonDoFox profile. 
	-- (Then replace it without messing up the profiles.ini with useless entries)
	if ("Name=JonDoFox" is in buf) then
		get_old_version()
		if (old_version_str is equal to "???") then
			return 1
		end if
		if (old_version_str is equal to new_version_str) then
			display dialog "You have already installed a JonDoFox profile of the same version (" & old_version_str & ")." & return & return & "If you continue it will be replaced.  Your Bookmarks will be kept." buttons {"Continue", "Abort"}
			if (button returned of result = "Continue") then
				copy_bookmarks()
				return 0
			else
				return 2
			end if
		else
			if (old_version_str is greater than new_version_str) then
				display dialog "Warning: You have already installed a JonDoFox profile of a newer version (" & old_version_str & ")." & return & return & "If you 	continue it will be replaced with the older version. Your Bookmarks will be kept." & new_version_str buttons {"Continue", "Abort"}
				if (button returned of result = "Continue") then
					copy_bookmarks()
					return 0
				else
					return 2
				end if
			else
				display dialog "You have already installed an older version of the JonDoFox profile (" & old_version_str & ")." & return & return & "Click continue to upgrade it to version. Your Bookmarks will be kept." & new_version_str buttons {"Continue", "Abort"}
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
	set complete_entry to return & return & get_next_profile(buf) & jondofox_profile_entry
	try
		set profile_ini_fdw to open for access alias (profiles_ini as string) with write permission
		--rewriting the general header of profiles.ini will force Firefox to open the profile manager at startup
		write profiles_ini_header starting at 1 to profile_ini_fdw
		-- append the JonDoFox profile entry
		write complete_entry starting at ((get eof profile_ini_fdw) + 1) to profile_ini_fdw
		close access profile_ini_fdw
	on error
		close access profile_ini_fdw
		display dialog "Error: couldn't edit Firefox profile.ini" buttons {"OK"}
		
		return 1
	end try
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
		display dialog "Error: couldn't find Firefox profile folder" buttons {"OK"}
		return 1
	end try
	return 0
end copy_folder

-- find out the number of installed profiles 
on get_next_profile(prof_file)
	set not_reached to true
	set ctr to -1
	set profile_header to ""
	repeat while not_reached
		set ctr to (ctr + 1)
		set profile_header to "[Profile" & ctr & "]"
		set not_reached to (profile_header is in prof_file)
	end repeat
	return profile_header
end get_next_profile

--saves the existing jondofox bookmarks
on copy_bookmarks()
	tell application "Finder"
		if (the file jondofox_bookmarks_ff3 exists) then
			set jondofox_bookmarks_file to jondofox_bookmarks_ff3 as alias
			set saved_bookmarks to firefox_profiles_path & "places.sqlite"
		else
			set jondofox_bookmarks_file to jondofox_bookmarks_ff2 as alias
			set saved_bookmarks to firefox_profiles_path & "bookmarks.html"
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
		display dialog "Error occured while saving profiles.ini. This should never happen. Please report this" buttons {"OK"}
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
		display dialog "Error occured while restoring old settings. This should never happen. Please report this" buttons {"OK"}
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

-- parses the version string from the specified prefs.js file
on get_version(prefs_js_file)
	
	set magic_off to 51
	set version_string_end to 2
	tell application "Finder"
		
		if (the file prefs_js_file exists) then
			
			set prefs_js_fdr to open for access file (prefs_js_file)
			try
				
				set prefs_js_end to get eof prefs_js_fdr
				set buf to (read prefs_js_fdr to prefs_js_end)
				
				close access prefs_js_fdr
			on error
				close access prefs_js_fdr
				
				return "???"
			end try
			
			set version_offset to (the offset of the profile_version_prefix in buf)
			if (the version_offset is not 0) then
				set version_str to text (version_offset + magic_off) thru (version_offset + magic_off + version_string_end) of buf
			else
				-- ignore or error ?
				return "???"
			end if
			return version_str
		else
			return "???"
		end if
	end tell
end get_version