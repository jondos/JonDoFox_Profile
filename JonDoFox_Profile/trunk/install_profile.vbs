Const ForReading = 1, ForWriting = 2, ForAppending = 8

Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

'Pfad zum Profil-Ordner
sFirefoxProfilePath = "%appdata%\Mozilla\Firefox\Profiles"
sFirefoxProfilePath = WshShell.ExpandEnvironmentStrings(sFirefoxProfilePath)

'Pfad zur Profiles.ini
sFirefoxPath = "%appdata%\Mozilla\Firefox"
sFirefoxPath = WshShell.ExpandEnvironmentStrings(sFirefoxPath)

fileProfile = sFirefoxPath & chr(92) & "profiles.ini"


' Name des Profil-Ordners
sJonDoProfileName = "JonDoFox"
sJonDoProfileNameSource = "profile"


' Name des JonDoFox
sJonDoFoxName = "JonDoFox"

' Name des Computers

Set objNetzwerk = WScript.CreateObject("WScript.Network")

strComputer = objNetzwerk.ComputerName


' Name des Prozesses
strProcess = "firefox.exe"



targetFolder = sFirefoxProfilePath & chr(92) & sJonDoProfileName

sBookmarkFileName = "bookmarks.html"

sPlacesFileName = "places.sqlite"

bFirefoxPossibleInstalled = false


' siehe: http://msdn.microsoft.com/en-us/library/0h88fahh(VS.85).aspx



' ****************************************************************************
' Sprachen
' ****************************************************************************

'German - Germany de-de 0x0407  		1031 
'German - Austria de-at 0x0C07  		3079 
'German - Liechtenstein de-li 0x1407  		5127 
'German - Luxembourg de-lu 0x1007  		4103 
'German - Switzerland de-ch 0x0807  		2055 


'Sprache auslesen

sLanguage = GetLocale


  if (sLanguage = "1031" or sLanguage = "3079" or sLanguage = "5127" or sLanguage = "4103" or sLanguage = "2055") then

	txtTitel	 	= "Installation des " & sJonDoFoxName & "-Profils"

	txtShouldInstall 	= "Soll das " & sJonDoFoxName & "-Profil installiert werden?"
	txtShouldOverwrite	= "Profil wurde bereits installiert, soll es überschrieben werden?"

	txtAbort	 	= "Die Installation wurde abgebrochen"
	txtWait			= "Das Profil wird nun importiert" & vbCRLF & "Bitte warten Sie einen Moment, bis der Vorgang abgeschlossen ist." & vbCRLF & "Das Ende des Kopiervorgangs wird Ihnen durch eine weitere Meldung angezeigt."
	txtReady		= "Installation von JonDoFox abgeschlossen!"

	txtFirefoxRuns		= "Firefox läuft noch, bitte beenden Sie alle Instanzen von Firefox und klicken Sie auf 'Wiederholen'." & vbCRLF & vbCRLF & "Sollten Sie bereits alle Instanzen von Firefox geschlossen haben und diese Meldung immer noch erhalten, so starten Sie ihren Rechner bitte neu und führen Sie dieses Skript anschließend erneut aus."

	txtFirefoxNotLocated	= "Firefox wurde auf dem Rechner nicht gefunden. Bitte installieren Sie Firefox. Die Installation von JonDoFox wird abgebrochen."

	txtFirefoxNotButProfileLocated	= "Firefox ist wahrscheinlich nicht installiert, soll das JonDoFox-Profil dennoch eingerichtet werden?"

	txtFirefoxStillNotLocated	= "Der angegebene Pfad wurde nicht gefunden. Wiederholen Sie die Eingabe oder klicken Sie auf 'Abbrechen'"

	txtProfileFolderNotLocated	= "Der Ordner '" & sJonDoProfileNameSource & "' wurde nicht gefunden. Das zu installierende Profil muss im selben Ordner wie das Skript liegen."
	
	txtCopyError = "Das Kopieren von " & vbCRLF & "[source]" & vbCRLF & " nach " & vbCRLF & "[target]" & vbCRLF & " schlug fehl."
	
	txtBackupError = "Backup des bestehenden profils konnte nicht erstellt werden. Installation wird abgebrochen."
	
	txtProfilesIniNotLocated = "Die Datei profiles.ini wurde nicht gefunden, die Installation wird abgebrochen."

  else


	txtTitel	 	= sJonDoFoxName & " profile installation"

	txtShouldInstall 	= "Should the " & sJonDoFoxName & " profile installation start?"
	txtShouldOverwrite	= "The JonDoFox profile is already installed, should it be overwritten?"

	txtAbort	 	= "The installation has been aborted"
	txtWait			= "Now, the profile will be imported" & vbCRLF & "Please wait a moment for the process to complete." & vbCRLF & "A follow-up message will inform you about the end of the copy process."
	txtReady		= "Installation of JonDoFox completed!"

	txtFirefoxRuns		= "Firefox is still running. Please close all instances of Firefox and retry & vbCRLF & vbCRLF & If Firefox is closed and you still got this message please reboot your windows and run this script again."

	txtFirefoxNotLocated	= "Firefox have not been located. Please install Firefox. The installation of JonDoFox is aborted."

	txtFirefoxNotButProfileLocated	= "Firefox probably not installed, should the profile although copied?"

	txtFirefoxStillNotLocated	= "Path not located. Repeat your Input or click 'Abort'"

	txtProfileFolderNotLocated	= "JonDoFox profile '" & sJonDoProfileNameSource & "' not located. The profile and this script must be in the same folder"

	txtCopyError = "Copy folder from " & vbCRLF & "[source]" & vbCRLF & " to " & vbCRLF & "[target]" & vbCRLF & " failed."

	txtBackupError = "Could not create backup. Installation will be aborted."
	
	txtProfilesIniNotLocated = "profiles.ini not located. Installation will be aborted."

  end if


' *******************************************************



' ****************************************************************************
' Prozesse auswerten
' ****************************************************************************

Function IsProcessRunning( strServer, strProcess )
    Dim Process, strObject
    IsProcessRunning = False
    strObject   = "winmgmts://" & strServer
    For Each Process in GetObject( strObject ).InstancesOf( "win32_process" )
	If UCase( Process.name ) = UCase( strProcess ) Then
            IsProcessRunning = True
            Exit Function
        End If
    Next
End Function


' ****************************************************************************
' Firefox suchen
' ****************************************************************************

Sub CheckFireFox()

	const HKEY_CURRENT_USER = &H80000001
	const HKEY_LOCAL_MACHINE = &H80000002


	Set oReg=GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\default:StdRegProv")

' Aktuelle Version auslesen

	strValueName = "CurrentVersion"
 
	strKeyPath = "SOFTWARE\Mozilla\Mozilla Firefox"

	oReg.GetStringValue HKEY_LOCAL_MACHINE,strKeyPath,strValueName,sCurrentVersion
 

' Sprache auslesen  // Wird nicht mehr benötigt


'	strValueName = "CurrentVersion"
 
'	strKeyPath = "SOFTWARE\Mozilla\Mozilla Firefox"

'	oReg.GetStringValue HKEY_LOCAL_MACHINE,strKeyPath,strValueName,strValue

'	sLeft = InStr(strValue, "(")
'	sRight = InStr(strValue, ")")

'	sLength = sRight - sLeft

'	sLanguage = Mid(strValue, sLeft + 1, sLength - 1)

' Installationspfad auslesen


	strValueName = "Install Directory"
 
	strKeyPath = "SOFTWARE\Mozilla\Mozilla Firefox\" & sCurrentVersion & "\Main"

	oReg.GetStringValue HKEY_LOCAL_MACHINE,strKeyPath,strValueName, sFirefoxFolder

	if IsNull(sFirefoxFolder) then


		if (objFSO.FolderExists(sFirefoxProfilePath) = true) then

			bFirefoxPossibleInstalled = true

		else

			MsgBox txtFirefoxNotLocated, vbOKOnly, txtTitel
			WScript.Quit

		End if


	End if

End Sub

' ---------------------------------------------------------- '
' Backup
' ---------------------------------------------------------- '

Sub BackItUp()

' Vorhandenes Profil sichern
		
	On Error Resume Next

	source = sFirefoxProfilePath & chr(92) & sJonDoProfileName

	target = source & "-backup"

	if (objFSO.FolderExists(source) = true) then

		' Pruefen ob Backup-Verzeichnis schon vorhanden, wenn ja loeschen
		
		if (objFSO.FolderExists(target) = true) then

			objFSO.DeleteFolder target

			if Err.Number > 0 then

				MsgBox txtBackupError & vbCRLF & err.Description, vbOKOnly, txtTitel

				MsgBox txtAbort, vbOKOnly, txtTitel
				WScript.Quit
				
			end if

		end if

		' Name aendern
		
		Set f = objFSO.GetFolder(source)
		f.Name = sJonDoProfileName & "-backup"
		
		'objFSO.CopyFolder source, target, true

		if Err.Number > 0 then

			MsgBox txtBackupError & vbCRLF & err.Description, vbOKOnly, txtTitel

			MsgBox txtAbort, vbOKOnly, txtTitel
			WScript.Quit
			
		end if
		
		if (objFSO.FolderExists(target) = false) then
					
			MsgBox txtBackupError & vbCRLF & err.Description, vbOKOnly, txtTitel

			MsgBox txtAbort, vbOKOnly, txtTitel
			WScript.Quit
			
		end if
		
		objFSO.CreateFolder source

	End if

' Backup der Bookmarks erstellen

'				if (objFSO.FileExists(sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sBookmarkFileName) = true) then
'					fSourceBookmark = sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sBookmarkFileName
'					fTargetBookmark = sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sBookmarkFileName & ".bak"
'					objFSO.CopyFile  fSourceBookmark, fTargetBookmark, true 
'				End if

' Backup der places.sqlite erstellen

'				if (objFSO.FileExists(sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sPlacesFileName) = true) then
'					fSourcePlaces = sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sPlacesFileName
'					fTargetPlaces = sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sPlacesFileName & ".bak"
'					objFSO.CopyFile  fSourcePlaces, fTargetPlaces, true 
'				End if

End Sub

' ---------------------------------------------------------- '
' Restore Bookmarks
' ---------------------------------------------------------- '

Sub RestoreBookmarks()

On Error Resume Next

		' Bookmarks wiederherstellen

			if (objFSO.FileExists(sFirefoxProfilePath & chr(92) & sJonDoProfileName & "-backup" & chr(92) & sBookmarkFileName) = true) then
				
				fSourceBookmark = sFirefoxProfilePath & chr(92) & sJonDoProfileName & "-backup" & chr(92) & sBookmarkFileName
				
				fTargetBookmark = sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sBookmarkFileName
				
				objFSO.CopyFile  fSourceBookmark, fTargetBookmark, true
				
				if Err.Number > 0 then
					MsgBox "Restore Bookmark Error" & vbCRLF & err.Description, vbOKOnly, txtTitel
					WScript.Quit
				end if
				
			End if

		' places.sqlite wiederherstellen

			if (objFSO.FileExists(sFirefoxProfilePath & chr(92) & sJonDoProfileName & "-backup" & chr(92) & sPlacesFileName) = true) then
				
				fSourcePlaces = sFirefoxProfilePath & chr(92) & sJonDoProfileName & "-backup" & chr(92) & sPlacesFileName
				
				fTargetPlaces = sFirefoxProfilePath & chr(92) & sJonDoProfileName & chr(92) & sPlacesFileName
				
				objFSO.CopyFile  fSourcePlaces, fTargetPlaces, true 
				
				if Err.Number > 0 then
					MsgBox "Restore Bookmark Error" & vbCRLF & err.Description, vbOKOnly, txtTitel
					WScript.Quit
				end if
				
			End if

End Sub

' ---------------------------------------------------------- '
' Restore Backup
' ---------------------------------------------------------- '

Sub RestoreBackup()

' Vorhandenes Backup wiederherstellen
		
	On Error Resume Next

	source = sFirefoxProfilePath & chr(92) & sJonDoProfileName & "-backup"

	target = sFirefoxProfilePath & chr(92) & sJonDoProfileName

	if (objFSO.FolderExists(source) = true) then

		if (objFSO.FolderExists(target) = true) then
			target = sFirefoxProfilePath & chr(92) & sJonDoProfileName
			
			objFSO.DeleteFolder(target)
			
		end if
		
		objFSO.CopyFolder source, target, true

		if Err.Number > 0 then

			MsgBox "Restore Error" & vbCRLF & err.Description, vbOKOnly, txtTitel

			MsgBox txtAbort, vbOKOnly, txtTitel
			WScript.Quit
			
		end if

	End if

End Sub


' ---------------------------------------------------------- '
' Install
' ---------------------------------------------------------- '

Sub InstallProfile

' Profil kopieren

On Error Resume Next

objFSO.CopyFolder sourceFolder, targetFolder, true

DateiSystemDurchsuchen(targetFolder) 

if Err.Number > 0 then

	RestoreBackup()

	txtCopyError = Replace(txtCopyError, "[source]", sourceFolder)
	txtCopyError = Replace(txtCopyError, "[target]", targetFolder)
	
	MsgBox txtCopyError & vbCRLF & err.Description, vbOKOnly, txtTitel

	MsgBox txtAbort, vbOKOnly, txtTitel
	WScript.Quit
	
end if

RestoreBookmarks()

End Sub


' ---------------------------------------------------------- '
' Rekursives Unterprogramm um das Dateisystem zu durchsuchen
' ---------------------------------------------------------- '

Private Sub DateiSystemDurchsuchen(Pfad)
    Dim Ordner, UnterOrdner, Datei

    If objFSO.FolderExists(Pfad) Then
        ' Then: Falls Ordner übergeben wurde
        Set Ordner = objFSO.GetFolder(Pfad)
		
        ' Papierkorb nicht bearbeiten
        If LCase(Ordner.Name) = "recycled" Then Exit Sub
		
		Ordner.Attributes = Ordner.Attributes And Not 1
		
        ' Funktion Bearbeiten() für Ordner aufrufen
        If Not Bearbeiten(Ordner, False) Then Exit Sub

        ' Alle Dateien im Ordner bearbeiten
        For Each Datei In Ordner.Files
            ' Prozedur Bearbeiten() für Dateien aufrufen
            If Not Bearbeiten(Datei, True) Then Exit For
        Next

         ' Alle Unterordner rekursiv bearbeiten
        For Each UnterOrdner In Ordner.SubFolders
            ' Einstieg In die Rekursion
            DateiSystemDurchsuchen UnterOrdner
        Next

    ElseIf objFSO.FileExists(Pfad) Then
        ' Else: Falls eine einzelne Datei übergeben wurde
        Bearbeiten objFSO.GetFile(Pfad), True
    End If
End Sub

' Hier wird festgelegt, wie Dateien bearbeitet werden sollen.
Private Function Bearbeiten(Datei, IstDatei)
    ' Schreibschutz-Attribut einer/s Datei/Ordners löschen
    Datei.Attributes = Datei.Attributes And Not 1
    Anzahl = Anzahl + 1
    Bearbeiten = True
End Function 

' ****************************************************************************
' Main
' ****************************************************************************

CheckFireFox()


' Profil da?

if (objFSO.FolderExists("." & chr(92) & sJonDoProfileNameSource & chr(92)) = true) then

	sourceFolder = objFSO.GetFolder("." & chr(92) & sJonDoProfileNameSource & chr(92))
	DateiSystemDurchsuchen (sourceFolder)

else

	MsgBox txtProfileFolderNotLocated, vbOKOnly, txtTitel
	WScript.Quit	

end if


if (bFirefoxPossibleInstalled = true) then

	bButton = MsgBox (txtFirefoxNotButProfileLocated, vbYesNo, txtTitel)

else

	bButton = MsgBox (txtShouldInstall, vbYesNo, txtTitel)

End if



if (bButton = 7) then

	MsgBox txtAbort, vbOKOnly, txtTitel

else

	'Warnung Firefox schließen
	bFFRun = true


	While (bFFRun = true)

		If( IsProcessRunning( strComputer, strProcess ) = True ) Then

			bButton = MsgBox (txtFirefoxRuns, vbRetryCancel, txtTitel)

			if (bButton = 2) then
				MsgBox txtAbort, vbOKOnly, txtTitel
				WScript.Quit
			End if
		else
			bFFRun = false
		End if

	Wend




	' Prüfen ob Profil schon eingetragen ist

	
	if (objFSO.FileExists(fileProfile) = true) then
	
		Set objTextFile = objFSO.OpenTextFile(fileProfile, ForReading)
	else
	
		MsgBox txtProfilesIniNotLocated, vbOKOnly, txtTitel
		WScript.Quit
	
	end if



	Text = ""

	Do Until objTextFile.AtEndOFStream
	   strNextLine = objTextFile.Readline
	   Text = Text & strNextLine & vbCRLF
	Loop


	i = 0
	MyPos = 1

	while (MyPos > 0)

		MyPos = InStr(Text, "[Profile" & i & "]")
		
		if (MyPos > 0) then
			i = i + 1
		end if
		
	wend

	sProfile = "Profile" & i

	MyPos = 0

	MyPos = InStr(Text, "Name=" & sJonDoProfileName)

	bButton = 6
	bOverwrite = false

	if (MyPos > 0) then

		bButton = MsgBox (txtShouldOverwrite, vbYesNo, txtTitel)
		
		if (bButton = 6) then
			bOverwrite = true
		End if

	End if


	if (bButton = 6) then


		MsgBox txtWait, vbOKOnly, txtTitel


		
		DateiSystemDurchsuchen (sFirefoxProfilePath)

		' Profilordner erstellen
		
		BackItUp()
				
		if (objFSO.FolderExists(sFirefoxProfilePath & chr(92) & sJonDoProfileName) = false) then
			objFSO.CreateFolder sFirefoxProfilePath & chr(92) & sJonDoProfileName
		end if

		InstallProfile()
				

		' profiles.ini erweitern

		if (bOverwrite = false) then

			' MsgBox "test", vbOKOnly, txtTitel

			' Default Profil deaktivieren
				MyText = Replace(Text, "Default=1", "Default=0")
				MyText = Replace(Text, "StartWithLastProfile=1", "StartWithLastProfile=0")


			' Dateiinhalt um JonDoProfil erweitern

				MyText = MyText & vbCRLF & "[" & sProfile & "]" & vbCRLF & "Name=" & sJonDoProfileName & vbCRLF & "IsRelative=1" & vbCRLF & "Path=Profiles/" & sJonDoProfileName & vbCRLF & "Default=1" & vbCRLF


				set objTextFile = objFSO.OpenTextFile (fileProfile, ForWriting, true)
				objTextFile.WriteLine(MyText)
				objTextFile.Close
		else
		
			' Default Profil deaktivieren
				MyText = Replace(Text, "Default=1", "Default=0")
				MyText = Replace(Text, "StartWithLastProfile=1", "StartWithLastProfile=0")
				
				set objTextFile = objFSO.OpenTextFile (fileProfile, ForWriting, true)
				objTextFile.WriteLine(MyText)
				objTextFile.Close
		End if

		MsgBox txtReady, vbOKOnly, txtTitel

	else

		MsgBox txtAbort, vbOKOnly, txtTitel

	End if

End if

