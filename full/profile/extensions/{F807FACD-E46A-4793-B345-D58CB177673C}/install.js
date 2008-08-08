var XpiInstaller = {

	// --- Editable items begin ---
	extFullName: 'ScribeFire', // The name displayed to the user (don't include the version)
	extShortName: 'performancing', // The leafname of the JAR file (without the .jar part)
	extVersion: '2.3pre',
	extAuthor: 'Christopher Finke',
	extLocaleNames: ['en-US','bg-BG','cs-CZ','de-DE','es-ES','fr-FR','he-IL','id-ID','is-IS','it-IT','ja-JP','ko-KR','nl-NL','pl-PL','pt-BR','ru-RU','sr-RS','sr-YU','sv-SE','th-TH','tr-TR','zh-CN','zh-TW'],
	prefs : ["scribefire.js"],
	extPostInstallMessage: 'Please restart your browser to finish the installation.', // Set to null for no post-install message
	// --- Editable items end ---

	profileInstall: true,
	silentInstall: false,

	install: function()
	{
		var jarName = this.extShortName + '.jar';
		var profileDir = Install.getFolder('Profile', 'chrome');

		// Parse HTTP arguments
		this.parseArguments();

		// Check if extension is already installed in profile
		if (File.exists(Install.getFolder(profileDir, jarName)))
		{
			if (!this.silentInstall)
			{
				Install.alert('Updating existing Profile install of ' + this.extFullName + ' to version ' + this.extVersion + '.');
			}
			this.profileInstall = true;
		}
		else if (!this.silentInstall)
		{
			// Ask user for install location, profile or browser dir?
			this.profileInstall = Install.confirm('Install ' + this.extFullName + ' ' + this.extVersion + ' to your Profile directory (OK) or your Browser directory (Cancel)?');
		}

		// Init install
		var dispName = this.extFullName + ' ' + this.extVersion;
		var regName = '/' + this.extAuthor + '/' + this.extShortName;
		Install.initInstall(dispName, regName, this.extVersion);

		// Find directory to install into
		var installPath;
		if (this.profileInstall) installPath = profileDir;
		else installPath = Install.getFolder('chrome');

		// Add JAR file
		Install.addFile(null, 'chrome/' + jarName, installPath, null);

		// Register chrome
		var jarPath = Install.getFolder(installPath, jarName);
		var installType = this.profileInstall ? Install.PROFILE_CHROME : Install.DELAYED_CHROME;

		// Register content
		Install.registerChrome(Install.CONTENT | installType, jarPath, 'content/');

		// Register locales
		for (var locale in this.extLocaleNames)
		{
			var regPath = 'locale/' + this.extLocaleNames[locale] + '/';
			Install.registerChrome(Install.LOCALE | installType, jarPath, regPath);
		}

		// Register skin
		var regPath = 'skin/';
		Install.registerChrome(Install.SKIN | installType, jarPath, regPath);

		for (var i = 0; i < this.prefs.length; i++) {
			addFile(this.extShortName + " Defaults", this.extVersion, "defaults/preferences/" + this.prefs[i], getFolder(getFolder("Program", "defaults"), "pref"), this.prefs[i], true);
		}

		// Perform install
		var err = Install.performInstall();
		if (err == Install.SUCCESS || err == Install.REBOOT_NEEDED)
		{
			if (!this.silentInstall && this.extPostInstallMessage)
			{
				Install.alert(this.extPostInstallMessage);
			}
		}
		else
		{
			this.handleError(err);
			return;
		}
	},

	parseArguments: function()
	{
		// Can't use string handling in install, so use if statement instead
		var args = Install.arguments;
		if (args == 'p=0')
		{
			this.profileInstall = false;
			this.silentInstall = true;
		}
		else if (args == 'p=1')
		{
			this.profileInstall = true;
			this.silentInstall = true;
		}
	},

	handleError: function(err)
	{
		if (!this.silentInstall)
		{
			Install.alert('Error: Could not install ' + this.extFullName + ' ' + this.extVersion + ' (Error code: ' + err + ')');
		}
		Install.cancelInstall(err);
	}
};

XpiInstaller.install();