function GrabDomain()
{	
			var extensions = new Array('ac','ac.ac','ac.at','ac.be','ac.il','ac.jp','ac.kr','ac.th','ac.uk','af','am','arts.ro','as','asn.au','asso.fr','asso.mc','at','bbs.tr','be','bg','biz','br.com','ca','cc','ch','cn','cn.com','co.ac','co.at','co.il','co.jp','co.kr','co.th','co.uk','com','com.au','com.fr','com.mx','com.pl','com.ro','com.ru','com.sg','com.tr','com.tw','cx','cz','de','dk','edu','edu.au','edu.mx','edu.tr','eu','eu.com','firm.ro','fo','fr','gb.com','gb.net','go.jp','go.kr','go.th','gov.il','gov.sg','gov.tr','gs','gv.ac','gv.at','hu.com','info','info.ro','is','it','k12.il','k12.tr','li','lt','lu','mi.th','mil.tr','ms','muni.il','mx','name','ne.jp','ne.kr','net','net.au','net.il','net.mx','net.pl','net.ru','net.sg','net.th','net.tr','net.tw','net.uk','nl','nm.kr','no','no.com','nom.ro','nt.ro','nu','or.ac','or.at','or.jp','or.kr','or.th','org','org.au','org.il','org.mx','org.pl','org.ro','org.ru','org.sg','org.tr','org.tw','org.uk','pl','presse.fr','pt','qc.com','re.kr','rec.ro','ru','sa.com','se','se.com','se.net','si','sk','st','store.ro','tc','tf','tm','tm.fr','tm.mc','tm.ro','to','tv','uk.com','uk.net','us','us.com','uy.com','vg','ws','www.ro','za.com');
			var uri = gBrowser.selectedBrowser.webNavigation.currentURI;
			var	CurrentDomain=getWebNavigation().currentURI.spec;
			SplitDomain=CurrentDomain.split('/');
			CurrentDomain = SplitDomain[2];
			var i = 0;
			while (extensions[i]) {
				rematch = "." + extensions[i] + "$"
				re = new RegExp(rematch);
				pattern = CurrentDomain.match(re);
				if (pattern)	{
					domain = CurrentDomain.replace(re, '');
					ext = extensions[i];
				}
				i++;
			}
			PartDomain = domain.split('.');
			domain = PartDomain[PartDomain.length-1];
			var url = "http://whois.domaintools.com/" + domain + "." + ext;
			//open in new tab. Thanks to Online Saratoga @ http://www.onlinesaratoga.com
			var tab = getBrowser().addTab( url ); 
			getBrowser().selectedTab = tab; 
}
