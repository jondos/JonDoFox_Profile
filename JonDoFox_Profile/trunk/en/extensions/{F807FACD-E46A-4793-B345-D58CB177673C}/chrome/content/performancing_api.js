// Some of the API Functions below are derived from GPL code originally by Flock Inc:
// Released under the same GLP license.
//
// For the original source, see: http://cvs-mirror.flock.com/index.cgi/mozilla/browser/components/flock/blog/content/blogapi.js?rev=1.19&content-type=text/vnd.viewcvs-markup
// and http://cvs-mirror.flock.com/index.cgi/mozilla/browser/components/flock/blog/content/
//
// Usage: myblog.init('blogger', '0123456789ABCDEF', 'http://plant.blogger.com/api/RPC2' ,'3724458', null, 'BillyBob',  'bbBaby'  )


var gPFFDebugTemp = [];

var perFormancingBlogAPI= function () {
    this.addCategories = false;
    this.extendedEntries = false;
	
	this.supportsPages = false;
}

perFormancingBlogAPI.prototype = {
    init: function (aName, aAppKey, aAPILink, aBlogID, aPreferred, aUsername, aPassword, aNeedsAuth) {
        this.name = aName;
        this.appKey = aAppKey;
        this.editLink = "";
        this.apiLink = aAPILink;
        this.appKey = "";
        this.blogID = aBlogID;
        this.username = aUsername;
        this.password = aPassword;
        this.needsAuth = aNeedsAuth;
    },
    setAuth: function (aUsername, aPassword, aURL){},
    doSetup: function (){},
    doAuth: function (aUsername, aPassword) {},
    newPost: function (aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {},
    editPost: function (aPostid, aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {},
    deletePost: function (aPostid, aEditURI) {},
	deletePage: function (pageId) {},
    getUsersBlogs: function () {},
    getRecentPosts: function (aNumber) {},
    setPostCategories: function (aPostid, aCategories) {},
    getCategoryList: function () {},
    publishPost: function (aPostid) {},
    fileUpload: function (aFileName, aMimeType, aDataString) {}
    //newMediaObject: function (aFileName, aMimeType, aB64DataStr) {}
}

//This Function is derived from GPL code originally by Flock Inc:
//myblog = new perFormancingBloggerAPI()
var perFormancingBloggerAPI = function () {
    this.newPost = function (aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {
        var argArray = [this.apiLink, this.appKey, this.blogID, this.username, this.password, aDescription, aPublish];
        return performancingAPICalls.blogger_newPost(argArray);
    };
    this.editPost = function (aPostid, aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) { 
        var argArray = [this.apiLink, this.appKey, aPostid, this.username, this.password, aDescription, aPublish];
        return performancingAPICalls.blogger_editPost(argArray);
    };
    this.deletePost = function (aPostid) {
        var argArray = [this.apiLink, this.appKey, aPostid, this.username, this.password, true];
        return performancingAPICalls.blogger_deletePost(argArray);
    };
	this.deletePage = function (pageId) {
		return false;
	};
    this.getUsersBlogs = function () {
        var argArray = [this.apiLink, this.appKey, this.username, this.password];
        return performancingAPICalls.blogger_getUsersBlogs(argArray);
    };
    this.getRecentPosts = function (aNumber) {
        var argArray = [this.apiLink, this.appKey, this.blogID, this.username, this.password, aNumber];
        return performancingAPICalls.blogger_getRecentPosts(argArray);
    };
    this.getCategoryList = function (argArray) { //Not available
		return false;
    };
    this.setPostCategories = function (aPostid, aCategories) { //Not Available
        return false;
    };
    this.publishPost = function (aPostid) {
        return false;
    };
}
perFormancingBloggerAPI.prototype = new perFormancingBlogAPI();

//This Function is derived from GPL code originally by Flock Inc:
var performancingMetaweblogAPI = function () {
    this.newPost = function (aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {
        var content_t =
        {
            title: aTitle,
            description: aDescription,
            categories: aArrayOfCats
        };
        //var argArray = [];
        var argArray = [this.apiLink, this.blogID, this.username, this.password, content_t, aPublish];
        return performancingAPICalls.metaWeblog_newPost(argArray);
    };
    this.editPost = function (aPostid, aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {
        var ourNewDate = "";
        if(aDateCreated != ""){
           ourNewDate = new Date(aDateCreated)
        }
        var content_t =
        {
            title: aTitle,
            description: aDescription,
            dateCreated: ourNewDate,
            categories: aArrayOfCats
            //dateCreated: "",
        };
        var argArray = [this.apiLink, aPostid, this.username, this.password, content_t, aPublish];
        return performancingAPICalls.metaWeblog_editPost(argArray);
    };
    this.deletePost = function (aPostid) {
        var argArray = [this.apiLink, this.appKey, aPostid, this.username, this.password, true];
        return performancingAPICalls.blogger_deletePost(argArray);
    };
	this.deletePage = function (pageId){
		return false;
	};
    this.getUsersBlogs = function () {
        var argArray = [this.apiLink, this.appKey, this.username, this.password];
        return performancingAPICalls.blogger_getUsersBlogs(argArray);
    };
    this.getRecentPosts = function (aNumber) {
        var argArray = [this.apiLink, this.blogID, this.username, this.password, aNumber];
        return performancingAPICalls.metaWeblog_getRecentPosts(argArray);
        //return blogger_getRecentPosts(this.apiLink, this.appKey, this.blogID, this.username, this.password, aNumber);
    };
    /*
    metaWeblog.getCategories 
    metaWeblog.getCategories (blogid, username, password) returns struct
    The struct returned contains one struct for each category, containing the following elements: description, htmlUrl and rssUrl.
    This entry-point allows editing tools to offer category-routing as a feature.
    */
    this.getCategoryList = function () { //Not Available
        //return false;
        var argArray = [this.apiLink, this.blogID, this.username, this.password];
        return performancingAPICalls.metaWeblog_getCategoryList(argArray);
        
    };
    this.setPostCategories = function (aPostid, aCategories) { //Not Available
        //var argArray = [];
        return false;
    };
    this.publishPost = function (aPostid) {
        return false;
    };
    
    //metaWeblog.newMediaObject (blogid, username, password, struct)
    this.fileUpload = function (aFileName, aMimeType, aDataString) {
        var content_t =
        {
            name: aFileName,
            type: aMimeType,
            bits: aDataString.toString() //aBase64Data
        };
        var argArray = [this.apiLink, this.blogID, this.username, this.password, content_t];
        return performancingAPICalls.metaWeblog_newMediaObject(argArray);
    };
}
performancingMetaweblogAPI.prototype = new perFormancingBlogAPI();

var perFormancingMovableTypeAPI = function () {
	this.newPost = function (aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {
		var content_t = {
			title : aTitle,
			description : aDescription,
			categories : aArrayOfCats
		};

		var argArray = [this.apiLink, this.blogID, this.username, this.password, content_t, aPublish];
		return performancingAPICalls.metaWeblog_newPost(argArray);
	};
	
	this.newPage = function (aTitle, aDescription, aDateCreated, aPublish) {
		var content_t = {
			title : aTitle,
			description : aDescription
		};

		var argArray = [this.apiLink, this.blogID, this.username, this.password, content_t, aPublish];
		return performancingAPICalls.wp_newPage(argArray);
	};
	
	this.editPost = function (aPostid, aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {
		var ourNewDate = "";
		
		if(aDateCreated != ""){
			ourNewDate = new Date(aDateCreated)
		}

		var content_t = {
			title: aTitle,
			description: aDescription,
			categories: aArrayOfCats,
			dateCreated: ourNewDate
		};
		
		var argArray = [this.apiLink, aPostid, this.username, this.password, content_t, aPublish];
		return performancingAPICalls.metaWeblog_editPost(argArray);
	};
	
	this.deletePost = function (aPostid) {
		var argArray = [this.apiLink, this.appKey, aPostid, this.username, this.password, true];
		return performancingAPICalls.blogger_deletePost(argArray);
	};
	
	this.deletePage = function (pageId) {
        var argArray = [this.apiLink, this.blogID, this.username, this.password, pageId, true];
        return performancingAPICalls.wp_deletePage(argArray);
	};
	
	this.getUsersBlogs = function () {
		var argArray = [this.apiLink, this.appKey, this.username, this.password];
		return performancingAPICalls.blogger_getUsersBlogs(argArray);
	};
	
	this.getRecentPosts = function (aNumber) {
		var argArray = [this.apiLink, this.blogID, this.username, this.password, aNumber];
		return performancingAPICalls.metaWeblog_getRecentPosts(argArray);
	};
	
	this.getPages = function () {
		var argArray = [this.apiLink, this.blogID, this.username, this.password];
		return performancingAPICalls.wp_getPages(argArray);
	};
	
	this.getPageList = function () {
		var argArray = [this.apiLink, this.blogID, this.username, this.password];
		return performancingAPICalls.wp_getPageList(argArray);
	};
	
	this.getCategoryList = function () {
		var argArray = [this.apiLink, this.blogID, this.username, this.password];
		return performancingAPICalls.mt_getCategoryList(argArray);
	};
	
	this.newCategory = function (aCategory) {
		var argArray = [this.apiLink, this.blogID, this.username, this.password, { name : aCategory} ];
		return performancingAPICalls.wp_newCategory(argArray);
	};
	
	this.setPostCategories = function (aPostid, aCategories) {
		var argArray = [this.apiLink, aPostid, this.username, this.password, aCategories];
		return performancingAPICalls.mt_setPostCategories(argArray);
	};

	this.publishPost = function (aPostid) {
		var argArray = [this.apiLink, aPostid, this.username, this.password];
		return performancingAPICalls.mt_publishPost(argArray);
	};

	this.fileUpload = function (aFileName, aMimeType, aDataString) {
		var content_t = {
			name: aFileName,
			type: aMimeType,
			bits: aDataString.toString()
		};
		
		var argArray = [this.apiLink, this.blogID, this.username, this.password, content_t];
		return performancingAPICalls.metaWeblog_newMediaObject(argArray);
	};
	
	this.supportsPages = true;
};

perFormancingMovableTypeAPI.prototype = new perFormancingBlogAPI();

var perFormancingAtomAPI = function () {
    this.newPost = function (aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {
        var J = new perFormancingAtomAPIObject();
        J.init2(this.apiLink, this.username, this.password);
        J.newPost(aTitle, aDescription, aDateCreated, aPublish);
    };
    this.editPost = function (aPostid, aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish, aEditURI, aAtomID) {
        var J = new perFormancingAtomAPIObject();
        J.init2(this.apiLink, this.username, this.password);
        J.editPost(aPostid, aTitle, aDescription, aDateCreated, aPublish, aEditURI, aAtomID);
    };
    this.deletePost = function (aPostid, aEditURI) {
        var J = new perFormancingAtomAPIObject();
        J.init2(this.apiLink, this.username, this.password);
        J.deletePost(aPostid, aEditURI);
    };
    this.getUsersBlogs = function () {
        var J = new perFormancingAtomAPIObject();
        J.init2(this.apiLink, this.username, this.password);
        J.getUsersBlogs();
    };
    this.getRecentPosts = function (aNumber) {
        var J = new perFormancingAtomAPIObject();
        J.init2(this.apiLink, this.username, this.password);
        J.getRecentPosts();
    };
    this.getCategoryList = function () {
        //aListener.onResult(null);
        return false;
    };
    this.setPostCategories = function (aPostid, aCategories) {
        //aListener.onResult(null);
        return false;
    };
    
    this.publishPost = function (aPostid) {
         return false;
    };
	
	this.deletePage = function () {
		return false;
	};
}
perFormancingAtomAPI.prototype = new perFormancingBlogAPI();

//BLOGGER BETA
var perFormancingBloggerAtomAPI = function () {
    this.theObject = new perFormancingBloggerAtomAPIObject();
    this.theObject.authToken = null;
    this.theObject.isLoggedIn = null;
    
    this.newPost = function (aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish) {
        //var J = new perFormancingBloggerAtomAPIObject();
        this.theObject.init2(this.apiLink, this.username, this.password);
        this.theObject.newPost(aTitle, aDescription, aDateCreated, aPublish);
    };
    this.editPost = function (aPostid, aTitle, aDescription, aArrayOfCats, aDateCreated, aPublish, aEditURI, aAtomID) {
        //var J = new perFormancingBloggerAtomAPIObject();
        this.theObject.init2(this.apiLink, this.username, this.password);
        this.theObject.editPost(aPostid, aTitle, aDescription, aDateCreated, aPublish, aEditURI, aAtomID);
    };
    this.deletePost = function (aPostid, aEditURI) {
        //var J = new perFormancingBloggerAtomAPIObject();
        this.theObject.init2(this.apiLink, this.username, this.password);
        this.theObject.deletePost(aPostid, aEditURI);
    };
    this.getUsersBlogs = function () {
        //var J = new perFormancingBloggerAtomAPIObject();
        this.theObject.init2(this.apiLink, this.username, this.password);
        this.theObject.getUsersBlogs();
    };
    this.getRecentPosts = function (aNumber) {
        //var J = new perFormancingBloggerAtomAPIObject();
        this.theObject.init2(this.apiLink, this.username, this.password);
        this.theObject.getRecentPosts();
    };
    this.getCategoryList = function () {
        //aListener.onResult(null);
        return false;
    };
    this.setPostCategories = function (aPostid, aCategories) {
        //aListener.onResult(null);
        return false;
    };
    this.publishPost = function (aPostid) {
         return false;
    };
    this.doAuth = function () {
        //var J = new perFormancingBloggerAtomAPIObject();
        this.theObject.init2(this.apiLink, this.username, this.password);
        this.theObject.doAuth();
    };
    this.doSetup = function () {
        //var J = new perFormancingBloggerAtomAPIObject();
        //this.theObject.init2(this.apiLink, this.username, this.password);
        this.theObject.doSetup();
    };
    
	this.deletePage = function () {
		return false;
	};
	
    this.addCategories = true;
}
perFormancingBloggerAtomAPI.prototype = new perFormancingBlogAPI();


var performancingAPICalls = new Object();

performancingAPICalls = {
    //myParams  = [url, appkey, blogid, username, password, content, publish]
    blogger_newPost: function(myParams) {
      return bfXMLRPC.makeXML("blogger.newPost", myParams);
    },
    
    //myParams  = [url, appkey, postid, username, password, content, publish]
    blogger_editPost: function(myParams) {
      return bfXMLRPC.makeXML("blogger.editPost", myParams);
    },
    
    //myParams  = [url, appkey, postid, username, password, publish]
    blogger_deletePost: function(myParams) {
        //alert(appkey + " " + postid + " " + username + " " + password + " " + publish + " ");
      return bfXMLRPC.makeXML("blogger.deletePost", myParams);
    },
    
    //myParams  = [url, appkey, blogid, username, password, numberOfPosts]
    blogger_getRecentPosts: function(myParams) {
      return bfXMLRPC.makeXML("blogger.getRecentPosts", myParams);
    },
    
    //myParams  = [url, appkey, username, password]
    blogger_getUsersBlogs: function(myParams) {
      return bfXMLRPC.makeXML("blogger.getUsersBlogs", myParams);
    },
    
    //myParams  = [url, appkey, username, password]
    blogger_getUserInfo: function(myParams) {
      return bfXMLRPC.makeXML("blogger.getUserInfo", myParams);
    },
    
    //myParams  = [url, blogid, username, password, content_t, publish]
    metaWeblog_newPost: function(myParams) {
      return bfXMLRPC.makeXML("metaWeblog.newPost", myParams);
    },
    
    metaWeblog_editPost: function(myParams) {
      return bfXMLRPC.makeXML("metaWeblog.editPost", myParams);
    },
    
    //myParams  = [url, blogid, username, password, numberOfPosts]
    metaWeblog_getRecentPosts: function(myParams) {
      return bfXMLRPC.makeXML("metaWeblog.getRecentPosts", myParams);
    },
    
    //myParams  = [url, blogid, username, password]
    metaWeblog_getCategoryList: function(myParams) {
      return bfXMLRPC.makeXML("metaWeblog.getCategories", myParams);
    },
    
    //myParams  = [url, blogid, username, password, mediaStruct]
    metaWeblog_newMediaObject: function(myParams) {
      return bfXMLRPC.makeXML("metaWeblog.newMediaObject", myParams);
    },
    
    //myParams  = [url, blogid, username, password, numberOfPosts]
    mt_getRecentPostTitles: function(myParams) {
      return bfXMLRPC.makeXML("mt.getRecentPostTitles", myParams);
    },
    
    //myParams  = [url, blogid, username, password]
    mt_getCategoryList: function(myParams) {
      return bfXMLRPC.makeXML("mt.getCategoryList", myParams);
    },
    
    //myParams  = [url, postid, username, password, categories]
    mt_setPostCategories: function(myParams) {
      return bfXMLRPC.makeXML("mt.setPostCategories", myParams);
    },
    //mt_publishPost
    //myParams  = [url, postid, username, password]
    mt_publishPost: function(myParams) {
      return bfXMLRPC.makeXML("mt.publishPost", myParams);
    },
	
	wp_getPage : function (myParams) {
		return bfXMLRPC.makeXML("wp.getPage", myParams);
	},
	wp_getPages : function (myParams) {
		//	    $blog_id    = $args[0];
		//      $username    = $args[1];
		//      $password    = $args[2];
		return bfXMLRPC.makeXML("wp.getPages", myParams);
	},
	wp_newPage : function (myParams) {
		return bfXMLRPC.makeXML("wp.newPage", myParams);
	},
	wp_deletePage : function (myParams) {
		return bfXMLRPC.makeXML("wp.deletePage", myParams);
	},
	wp_editPage : function (myParams) {
		return bfXMLRPC.makeXML("wp.editPage", myParams);
	},
	wp_getPageList : function (myParams) {
		return bfXMLRPC.makeXML("wp.getPageList", myParams);
	},
	wp_getAuthors : function (myParams) {
		return bfXMLRPC.makeXML("wp.getAuthors", myParams);
	},
	wp_newCategory : function (myParams) {
		return bfXMLRPC.makeXML("wp.newCategory", myParams);
	},
	wp_suggestCategories : function (myParams) {
		return bfXMLRPC.makeXML("wp.suggestCategories", myParams);
	}
}

function perFormancingAtomAPIObject() {
}

perFormancingAtomAPIObject.prototype = {
    _req: null,
    _url: null,

    ERROR_HTTP:   10,
    ERROR_FAULT:   11,
    ERROR_PARSER:   12,

    init2: function(aUrl, aUsername, aPassword) {
        this._url = aUrl;
        this._user = aUsername;
        this._pass = aPassword;
    },

    doRequest: function( method, url, body, processor) {
        var fault =  {
                    faultString: "Due to Blogger.com's recent API changes, you will need to re-add this Blogger account to PFF\n(Click the 'Add' Button to re-add your account)\nIf you have problems, please visit the Performancing.com support forums for assistance.\nhttp://performancing.com/forum/firefox"
                };
                alert(fault.faultString);
    },

    getRecentPosts: function() {
        //var url = this._url; 
        //url.match(/(.+\/)(.+)/);
        //if(RegExp.$2=="post") {
        //    url = RegExp.$1 + "feed";
        //}
        this.doRequest("GET", this._url,null, this.parseRecentPosts);
        return true;
    },
    getUsersBlogs: function() {
        //var url = this._url.match(/(.+)\//);
        //url = RegExp.$1;
        //this.doRequest("GET", url, null, this.parseUsersBlogs);
        this.doRequest("GET", this._url, null, this.parseUsersBlogs);
    },

    parseUsersBlogs: function( inst) {
        //dump("\n\n parseUsersBlogs ATOM \n\n");
        try {
            var rval = new Array();
            var dom = inst._req.responseXML;
            var links = dom.getElementsByTagName("link");
            for(var i=0;i<links.length;++i)
            {
                var link = links[i];
                var title = link.getAttribute("title");
                var rel = link.getAttribute("rel");
                var href = link.getAttribute("href");
                if(rel!="service.post") continue;

                href.match(/.+\/(.+)/);
                var bid = RegExp.$1;

                var obj  =
                {
                    blogName: title,
                    blogid:  bid,
                    url:  href
                };
                rval[rval.length++] = obj;
            }
            //listener.onResult(rval);
            performancing_xmlcall.processData(rval, null, 'accountwizard', "", true);
        }
        catch(e) {
            //alert(e + " " + e.lineNumber);
            //dump("\n\n Error ParsingBlogs: " + e + "\n\n");
        }
    },

    parseRecentPosts: function( inst) {
        //dump("\n\n parseRecentPosts ATOM \n\n");
        var rval = new Array();
        var dom = inst._req.responseXML;
        var entries = dom.getElementsByTagName("entry");
        for(var i=0;i<entries.length;++i)
        {
            try
            {
                var entry_n = entries[i];
                var content_n = inst.getNamedChild(entry_n, "content");
                var title_n = inst.getNamedChild(entry_n, "title");
                var created_n = inst.getNamedChild(entry_n, "issued");
                var author_n = inst.getNamedChild(entry_n, "author");
                var link_n = null;
                var atomid_n = inst.getNamedChild(entry_n, "id");
                var atomid = "";
                if(atomid_n) atomid = atomid_n.firstChild.nodeValue;

                for(var j=0;j<entry_n.childNodes.length;++j) {
                    if(entry_n.childNodes[j].nodeName=="link") {
                        var tmp = entry_n.childNodes[j];
                        if(tmp.getAttribute("rel").match(/edit/)) {
                            link_n = tmp;
                        }
                    }
                }

                var href = link_n.getAttribute("href");
                href.match(/.+\/(.+)/);
                var postid = RegExp.$1;

                var dateval = created_n.firstChild.nodeValue;
                //var date = flock_parseDate(dateval);
                var val = dateval;
                var dateutc =  Date.UTC(val.slice(0, 4), val.slice(4, 6) - 1, 
                        val.slice(6, 8), val.slice(9, 11), val.slice(12, 14), 
                        val.slice(15));
                var date =  new Date(dateutc);

                var xs = new XMLSerializer();

                var data = "";
                if(content_n) {
                    for(var j=0;j<content_n.childNodes.length;++j) {
                        data += xs.serializeToString(content_n.childNodes.item(j));
                    }
                }
                data = data.replace(/&lt;/g,"<");
                data = data.replace(/&gt;/g,">");
                data = data.replace(/&quot;/g,"\"");
                data = data.replace(/&amp;/g,"&");

                var obj  =
                {
                    description: data,
                    title: title_n.firstChild.nodeValue,
                    dateCreated: date,
                    postid:  postid,
                    editURI:  href,
                    atomid:  atomid
                };
                rval[rval.length] = obj;
            }
            catch(e)
            {
                //alert(e);
                //dump("\n\n parseRecentPosts ATOM ERROR:" + e + "\n\n");
            }
        }
        //listener.onResult(rval);
        //dump("\n\n parseRecentPosts ATOM Finished \n\n");
        //gLastPostID = postid;
        performancing_xmlcall.processData(rval, null, 'historycall', "", true);
    },
    getNamedChild: function(node, name) {
        for(var i=0;i<node.childNodes.length;++i) {
            if(node.childNodes[i].nodeName==name) return node.childNodes[i];
        }
        return null;
    },
    deletePost: function ( postid, aEditURI) {
        var url = this._url;
        if(postid) url += "/" + postid;
        if(aEditURI) url = aEditURI;
        this.doRequest("DELETE", url,null, this.handleDelete);
    },
    doPost: function ( method, postid, title, description, date_created, doPublish, aEditURI, aAtomID, isEdit) {

        var url = this._url;
        if(postid) url += "/" + postid;

        //if(aEditURI) url += "/" + aEditURI;

        //var date = bfXMLRPC.iso8601Format(date_created);
        var date = "";
        try{
            date = bfXMLRPC.iso8601Format(date_created);
        }catch(e){
            //foo
        }

        var body = "";
        var version = "ScribeFire 1.4.2";
        var theBlogCharType = gPerformancingUtil.getCharType();
        body += '<?xml version="1.0" encoding="UTF-8" ?>';
        body += '<entry xmlns="http://purl.org/atom/ns#">';

        var draft = "false";
        if(doPublish == false || doPublish == 'bool0') draft = "true";
        //alert("Is Draft? " + draft + " doPublish: " + doPublish);
        
        var useEntities = true;
        try{
            useEntities = gPerformancingUtil.prefs.getBoolPref('publish.usehtmlentities')
        }catch(e){
            useEntities = false;
        }
        //Use HTML Entities, thanks Theo
        if(useEntities){
            var entity_description = "";
            for (var desc_i=0; desc_i < description.length; desc_i++){
                entity_description += "&#" + description.charCodeAt(desc_i) + ";";
            }
        
            var entity_title = "";
            for (var title_i=0; title_i < title.length; title_i++){
                entity_title += "&#" + title.charCodeAt(title_i) + ";";
            }
            
            description = entity_description;
            title = entity_title;
            body += '  <title type="text/plain" mode="escaped">' + title + '</title>';
            body += '  <issued>' + date + '</issued>';
            body += '  <generator url="http://performancing.com/firefox">' + version + '</generator>';
            body += '  <content type="text/plain" mode="escaped">' + description + '</content>';
            body += '  <draft xmlns="http://purl.org/atom-blog/ns#">' + draft + '</draft> ';
            body += '</entry>';
        }else{
            body += '<draft xmlns="http://purl.org/atom-blog/ns#">' + draft + '</draft> ';
            body += '<title mode="escaped" type="text/plain">' + title + '</title>';
            body += '<issued>' + date + '</issued>';
            if(aAtomID && !url.match(/blogger.com/)) body += '<id>' + aAtomID + '</id>';
            body += '<generator url="http://performancing.com/firefox">' + version + '</generator>'
            body += '<content type="application/xhtml+xml">'
            description = description.replace(/(&\S+)/g, "");
            var containsDIV = description.indexOf("<div xmlns=\"http://www.w3.org/1999/xhtml\">");
            if(containsDIV >= 0){
                body += description;
            }else{
                body += '<div xmlns="http://www.w3.org/1999/xhtml">' + description + '</div>';
                //body += description;
            }
            body += '</content> </entry>';
        }
        
        dump("\n\n********** \nDescription: " + description +"\n\n********** \title: "+ title);
        //dump(body);
        this.doRequest(method,url,body,this.parsePosts, doPublish);
    },
    editPost: function ( postid, title, description, date_created, isDraft, aEditURI, aAtomID) {
        this.doPost( "PUT", postid, title, description, date_created, isDraft, aEditURI, aAtomID, "isEdit");
    },
    newPost: function ( title, description, date_created, isDraft) {
        this.doPost( "POST", null, title, description, date_created, isDraft);
    },
    parsePosts: function( inst) {
        //dump("\n\n NewPost response: " + inst +"\n\n");
        var dom = inst._req.responseXML;
        if(!dom)
        {
            // LiveJournal - everone wants to be different, don't they?
            if(inst._req.responseText.match(/OK/)) {
                //listener.onResult(1);
                performancing_xmlcall.processData(1, null, null, "", true);
                return;
            }
            else {
                var fault =  {
                    faultString: "Due to Blogger.com's recent API changes,you will need to re-add your Blogger account to PFF\nIf you have problems, please visit the Performancing.com support forums for assistance.\nhttp://performancing.com/forum/firefox"
                };
                //fault.faultString += inst._req.responseText;
                //listener.onFault(fault);
                var localeString = performancingUI.getLocaleString('atomservererror', []);
                alert(localeString +"\n"+ fault.faultString);
                return;
            }
        }
        var entries = dom.getElementsByTagName("entry");
        var rval = new Object();
        try
        {
            var entry_n = entries[0];
            var link_n = null;
            var perm_link_n = null;
            var atomid_n = inst.getNamedChild(entry_n, "id");
            var atomid = "";
            if(atomid_n) atomid = atomid_n.firstChild.nodeValue;
            for(var j=0;j<entry_n.childNodes.length;++j) {
                if(entry_n.childNodes[j].nodeName=="link") {
                    var tmp = entry_n.childNodes[j];
                    if(tmp.getAttribute("rel").match(/edit/)) {
                        link_n = tmp;
                    }
                    else if(tmp.getAttribute("rel").match(/alternate/)) {
                        perm_link_n = tmp;
                    }
                }
            }
            var href = link_n.getAttribute("href");
            rval.editURI = href;
            rval.atomid = atomid;
            href.match(/.+\/(.+)/);
            rval.uid = RegExp.$1;;
            //Livejournal hackage
            if(rval.editURI.length>0 && rval.atomid.length==0) {
                var perm_link = perm_link_n.getAttribute("href");
                if(perm_link.match(/livejournal/)) {
                    perm_link.match(/.+livejournal.com\/users\/(.+?)\/(.+?)\./);
                    rval.atomid = "urn:lj:livejournal.com:atom1:" + RegExp.$1 + ":" + RegExp.$2;
                    //alert(rval.atomid);
                    //alert(rval.atomid);
                }
            }
        }
        catch(e)
        {
            var localeString = performancingUI.getLocaleString('proccessingposterror', []);
            alert(localeString);
        }
        performancing_xmlcall.processData(rval, null, 'newpostcall', "", true );
        //performancing_xmlcall.processData(rval, 'historycall', null, true);
    },
    
    handleDelete: function( inst) {
        //listener.onResult(1);
        performancing_xmlcall.processData(1, null, 'deletehistorycall', "", true);
    }
}

/*
    Blogger Beta
    -------------------
    GET "http://beta.blogger.com/feeds/214142430004041626/posts/full"
    
    //URL
    theLinks = theGood.getElementsByTagName("link")
    for(i in theLinks){
        if(theLinks[i].getAttribute("rel") == "alternate"){
                 alert(theLinks[i].getAttribute("href") ); 
                 break;
        }
    }
    
    //Title
    theTitles = theGood.getElementsByTagName("title");
    theTitles[0].firstChild.nodeValue;
    
    //ID
    theIDs = theGood.getElementsByTagName("id");
    theIDs[0].firstChild.nodeValue;
*/
function perFormancingBloggerAtomAPIObject() {
}
var pffGoogleAuth = "";
var pffGoogleAuthIsLoggedin = false;

perFormancingBloggerAtomAPIObject.prototype= {
    titleRegExp: /(?:\<title\stype\=\'\w*\'\>)([\s\S\s]*)(?=\<\/title\>)/,
    getFullIDRegExp: /(?:\<id\>)(\S*)(?=\<\/id\>)/,
    urlRegExp: /(?:\<link\srel\=\'\w*\'\stype\=\'[\w\W]*\'\shref\=\')([\s\S\s]*)(?=\<\/link>)/,
    
    idRegexp: /(?:[\S]*feeds\/)([\d]*)(?=\/posts)/,
    postIDRegexp: /(?:[\S]*posts\/full\/)([\d]*)(?=\")/,
    
    _req: null,
    _url: null,
//    _auth: null,
//    _isLoggedin: false,

    ERROR_HTTP:   10,
    ERROR_FAULT:   11,
    ERROR_PARSER:   12,
    
    init2: function( aUrl, aUsername, aPassword) {
        this._url = aUrl;
        this._user = aUsername;
        this._pass = aPassword;
    },
    
    doSetup: function( aUrl, aUsername, aPassword) {
        pffGoogleAuth = "";
        pffGoogleAuthIsLoggedin = false;
    },
    
    doAuth: function(processor) {
        if(!pffGoogleAuthIsLoggedin){
            var theUA = "scribefire-1.4.2";
            var theMsg = "Email="+this._user+"&Passwd="+encodeURIComponent(this._pass)+"&service=blogger&source="+theUA;
            var theCall = new PffXmlHttpReq("https://www.google.com/accounts/ClientLogin", "POST", theMsg, false, null, null);
            var theGood = null; 
            var theBad = null;
            var theProcessor = processor;
            //var theAuth = this._auth;
            var theObject = this;
            theCall.onResult = function( aText, aXML ){ 
                theGood = aText;
                theAuth = theGood.match(/(?:Auth\=)(.*)/);
                pffGoogleAuth = theAuth[1];
                pffGoogleAuthIsLoggedin = true;
                theObject.doRequest("GET", theObject._url, null, theProcessor);
            } 
            theCall.onError = function (aStatusMsg, Msg) {
				var errorType = theCall.request.responseText.split('=')[1].replace(/\s*$/,""); 
				var errorMessage = '';
				
				switch (errorType) {
					case 'BadAuthentication':
						errorMessage = performancingUI.getLocaleString('errors.blogger.badauthentication', []);
						break;
					case 'NotVerified':
						errorMessage = performancingUI.getLocaleString('errors.blogger.notverified', []);
						break;
					case 'TermsNotAgreed':
						errorMessage = performancingUI.getLocaleString('errors.blogger.termsnotagreed', []);
						break;
					case 'AccountDeleted':
						errorMessage = performancingUI.getLocaleString('errors.blogger.accountdeleted', []);
						break;
					case 'ServiceDisabled':
						errorMessage = performancingUI.getLocaleString('errors.blogger.servicedisabled', []);
						break;
					case 'ServiceUnavailable':
						errorMessage = performancingUI.getLocaleString('errors.blogger.serviceunavailable', []);
						break;
					case 'Unknown':
					default:
						errorMessage = performancingUI.getLocaleString('errors.blogger.unknown', []);
						break;
				}
				
                alert(errorMessage);
            }
            theCall.prepCall(); //Set up The call (open connection, etc.)
            theCall.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            theCall.makeCall();
        }else{
            this.doRequest("GET", this._url, null, processor);
        }
    },

    doRequest: function(method, url, body, processor) {
        var inst = this;
        gPFFLastURIPost = url;
        this._req = new XMLHttpRequest();
        this._req.onreadystatechange = function (aEvt) {
            if(inst._req.readyState == 4) {
                //dump("\nRESPONSE\n" + inst._req.responseText);
                if(inst._req.status == 200 || inst._req.status == 201 || inst._req.status == 204)
                {
                    try
                    {
                        processor( inst);
                    }
                    catch(e)
                    {
                        //listener.onError(inst.ERROR_PARSER);
                        var localeString = performancingUI.getLocaleString('atomservererror', []);
                        var localeString2 = performancingUI.getLocaleString('atomerrormessage', [e]);
                        //alert("Processor 2: " + processor);
                        alert(localeString + " #101\n" + localeString2 + "\n" + e + "\nServer Response:" + inst._req.responseText);
                    }
                }
                else {
                    var fault =  {
                        faultString: "The blogger.com server faild with the following message:\n\n"
                    };
                    fault.faultString += inst._req.responseText;
                    //listener.onFault(fault);
                    //alert("Error: 1212121");
                    //var localeString = performancingUI.getLocaleString('atomservererror', []);
                    alert(fault.faultString + "\n\nIf you are embedding a video or any rich html,\nplease make sure any unclosed tags are closed\ni.e. <embed> </embed>");
                }
            }
            //dump("Requested Test 2: this.req.status: " + inst._req.status + "\n");
            //dump("Requested Test 2: this.req.readyState: " + inst._req.readyState + "\n");
        };
        //var aPassword = gPerformancingUtil.usermanagment.getPassword(this.username, this.apiLink);
       // dump("\n\n USERNAME and PASS: " + this._user + " : " + this._pass + "\n\n");
        var rval = this._req.open(method, url, true, this._user, this._pass);
        //dump("\n\n\n\n\nSending: " + method + "\n\n" + url + "\n>>>\n" + body + "\n\n\n\n");
        rval = this._req.setRequestHeader("Authorization", "GoogleLogin auth=" +pffGoogleAuth );
        rval = this._req.setRequestHeader("User-Agent", "Mozilla/5.0 (compatible; ScribeFire; http://www.scribefire.com/)");
        rval = this._req.setRequestHeader("Content-Type", "application/atom+xml");
        rval = this._req.send(body); 
    },

    getRecentPosts: function() {
        //var url = this._url; 
        //url.match(/(.+\/)(.+)/);
        //if(RegExp.$2=="post") {
        //    url = RegExp.$1 + "feed";
        //}
        //this.doRequest("GET", this._url,null, this.parseRecentPosts);
        this.doAuth(this.parseRecentPosts);
        return true;
    },
    getUsersBlogs: function() {
        //var url = this._url.match(/(.+)\//);
        //url = RegExp.$1;
        //this.doRequest("GET", this._url, null, this.parseUsersBlogs);
        this.doAuth(this.parseUsersBlogs);
    },

    parseUsersBlogs: function( inst) {
        //dump("\n\n parseUsersBlogs ATOM \n\n");
        try {
            var rval = new Array();
            var dom = inst._req.responseXML;
            //gPFFDebugTemp.push(dom);
            //gPFFDebugTemp.push(inst._req.responseText);
            var url = "";
            var id = "";
            var title = "";
            //URL
            var theLinks = dom.getElementsByTagName("link")
            for(i in theLinks){
                try{
                    if(theLinks[i].getAttribute("rel") == "alternate"){
                             url = (theLinks[i].getAttribute("href") ); 
                             break;
                    }
                }catch(e){}
            }
            
            //Title
            var theTitles = dom.getElementsByTagName("title");
            title = theTitles[0].firstChild.nodeValue;
            
            //ID
            var theIDs = dom.getElementsByTagName("id");
            try{
                id = theIDs[0].firstChild.nodeValue.match(/(?:[\S]*feeds\/)([\d]*)(?=\/posts)/)[1];
            }catch(e){
                id = "";
            }
            /*
            var links = dom.getElementsByTagName("link");
            for(var i=0;i<links.length;++i)
            {
                var link = links[i];
                var title = link.getAttribute("title");
                var rel = link.getAttribute("rel");
                var href = link.getAttribute("href");
                if(rel!="service.post") continue;

                href.match(/.+\/(.+)/);
                var bid = RegExp.$1;

                var obj  =
                {
                    blogName: title,
                    blogid:  bid,
                    url:  href
                };
                rval[rval.length++] = obj;
            }*/
            var obj  =
                {
                    blogName: title,
                    blogid:  id,
                    url:  url
                };
                //gPFFDebugTemp.push(obj);
                //alert("BlogList:\n" + url + title + id);
                rval[rval.length++] = obj;
            //listener.onResult(rval);
            performancing_xmlcall.processData(rval, null, 'accountwizard', "", true);
        }
        catch(e) {
            alert("Whoops, you found a Blogger error.\n Please contact the author at 'performancing.com/forum/firefox/'\n and give the following info\n" + e + " " + e.lineNumber);
            //dump("\n\n Error ParsingBlogs: " + e + "\n\n");
        }
    },
    
    parseRecentPosts: function( inst) { //Using EX4
        var rval = new Array();
        gPFFDebugTemp.push(inst._req.responseText);
        
        var re = /(\<\?\xml[0-9A-Za-z\D]*\?\>)/;
        var newstr = inst._req.responseText.replace(re, "");
        
        var re = /(\<feed[0-9A-Za-z\D]*["']>)(?=\<id\>)/;
        newstr = newstr.replace(re, "<feed>");
        
        var re = /(\<\openSearch:[0-9A-Za-z]*\>[\d]+\<\/openSearch:[0-9A-Za-z]*\>)/ig;
        var newstr = newstr.replace(re, "");
        
        var theXML = new XML(newstr);
        gPFFDebugTemp.push(theXML);
        
        for(var i=0; i<theXML.entry.length(); i++){
            try{
                var catArray = [];
                //Was 42 and 6
                var theContent = theXML.entry[i].content.toString();
                
                theContent = theContent.replace("<content type=\"xhtml\">\n  ", ""); //Stupid blogger hack
                theContent = theContent.replace("\n</content>", ""); //Stupid blogger hack
                
                var divRegexp = /\<div xmlns\=\'http:\/\/www.w3.org\/1999\/xhtml\'\>|\<div xmlns\=\"http:\/\/www.w3.org\/1999\/xhtml\"\>/;
                var divIndex = theContent.search(divRegexp);
                
                if( divIndex >= 0 && divIndex < 30 ){ //If we have a <div xmlns='http://www.w3.org/1999/xhtml'> at the top
                    theContent = theContent.substring(42, theContent.length - 6); //Get rid of the outer div
                }
                var theTitle = theXML.entry[i].title;
                var theDate = theXML.entry[i].published;
                var thePostURL = theXML.entry[i].id;
                var theHREF =  theXML.entry[i].link.(@rel == 'alternate').@href;
                var theEditHREF =  theXML.entry[i].link.(@rel == 'edit').@href;
                var theCatsObj = theXML.entry[i].category.@term;
                
                //var atomid = thePostURL.match( /(?:\/)(\d{5,})/ )[1];
                //var atomid = thePostURL.match( /(?:\/posts\/)(\d{5,})/ )[1];
                var atomid = thePostURL.match( /(?:\/|post-)(\d{5,})(?!\d*\/)/ )[1];
                
                for(var j=0; j < theCatsObj.length(); j++){
                    catArray.push( theCatsObj[j].toString() );
                }
                
                
                var val = theDate;
                //Date.UTC(year, month[, date[, hrs[, min[, sec[, ms]]]]])
                var dateutc =  Date.UTC( val.slice(0, 4), val.slice(5, 7) - 1, val.slice(8, 10), val.slice(11, 13), val.slice(14, 16) );
                var date =  new Date(dateutc);
                
                
                var obj  =
                {
                    description: theContent,
                    title: theTitle,
                    dateCreated: date,
                    postid:  atomid,
                    editURI:  theEditHREF,
                    atomid:  thePostURL,
                    permaLink: theHREF,
                    categories: catArray
                };
                rval[rval.length] = obj;
                
            }catch(e){
                //alert("Error Parsing Blogger history\n" + e);
            }
        }
        performancing_xmlcall.processData(rval, null, 'historycall', "", true);
        
    },

    parseRecentPosts_dom: function( inst) {
        //dump("\n\n parseRecentPosts ATOM \n\n");
        //gPFFDebugTemp.push(inst._req.responseText);
        var rval = new Array();
        var dom = inst._req.responseXML;
        var entries = dom.getElementsByTagName("entry");
        for(var i=0;i<entries.length;++i)
        {
            try
            {
                var entry_n = entries[i];
                var content_n = inst.getNamedChild(entry_n, "content");
                var title_n = inst.getNamedChild(entry_n, "title");
                var date_n = inst.getNamedChild(entry_n, "updated");
                //var author_n = inst.getNamedChild(entry_n, "author");
                var posturl_n = inst.getNamedChild(entry_n, "id");
                var atomid = "";
                var link_n = "";
                var postlink = "";
                
                var content = content_n.firstChild.nodeValue;
                var title = title_n.firstChild.nodeValue;
                var date = date_n.firstChild.nodeValue;
                var posturl = posturl_n.firstChild.nodeValue;
                //atomid = posturl_n.match(postIDRegexp)[1];
                if(content == null){
                    try{
                        content = content_n.firstChild.firstChild.nodeValue;
                    }catch(e){
                        
                    }
                }
                
                if(content == null){
                    content = "";
                }
                var theCats = [];//Define the categories (labels)
                //if(atomid_n) atomid = atomid_n.firstChild.nodeValue;
                for(var j=0;j<entry_n.childNodes.length;++j) {
                    if(entry_n.childNodes[j].nodeName=="link") {
                        var tmp = entry_n.childNodes[j];
                        if(tmp.getAttribute("rel").match(/edit/)) {
                            link_n = tmp;
                        }
                        if(tmp.getAttribute("rel").match(/alternate/)) {
                            postlink = tmp;
                        }
                    }else if(entry_n.childNodes[j].nodeName=="category") {
                        var tmp = entry_n.childNodes[j];
                        var term = tmp.getAttribute("term");
                        theCats.push(term);
                    }
                }
                
                var href = link_n.getAttribute("href");
                atomid = href.match(/.+\/(.+)/)[1];
                
                var thePostlink = postlink.getAttribute("href");
                
                var val = date;
                var dateutc =  Date.UTC( val.slice(0, 4), val.slice(5, 7), val.slice(8, 10), val.slice(11, 13), val.slice(14, 16) );
                var date =  new Date(dateutc);

                var xs = new XMLSerializer();

                /*
                var data = "";
                if(content_n) {
                    for(var j=0;j<content_n.childNodes.length;++j) {
                        data += xs.serializeToString(content_n.childNodes.item(j));
                    }
                }
                data = data.replace(/&lt;/g,"<");
                data = data.replace(/&gt;/g,">");
                data = data.replace(/&quot;/g,"\"");
                data = data.replace(/&amp;/g,"&"); */
                var obj  =
                {
                    description: content,
                    title: title,
                    dateCreated: date,
                    postid:  atomid,
                    editURI:  href,
                    atomid:  posturl,
                    permaLink: thePostlink,
                    categories: theCats
                };
                rval[rval.length] = obj;
            }
            catch(e)
            {
                //alert(e);
                //dump("\n\n parseRecentPosts ATOM ERROR:" + e + "\n\n");
            }
        }
        //listener.onResult(rval);
        //dump("\n\n parseRecentPosts ATOM Finished \n\n");
        //gLastPostID = postid;
        performancing_xmlcall.processData(rval, null, 'historycall', "", true);
    },
    getNamedChild: function(node, name) {
        for(var i=0;i<node.childNodes.length;++i) {
            if(node.childNodes[i].nodeName==name) return node.childNodes[i];
        }
        return null;
    },
    deletePost: function ( postid, aEditURI) {
        var url = this._url;
        if(postid) url += "/" + postid;
        if(aEditURI) url = aEditURI;
        this.doRequest("DELETE", url,null, this.handleDelete);
    },
	
    doPost: function ( method, postid, title, description, date_created, doPublish, aEditURI, aAtomID, isEdit) {

        var url = this._url;
        if(postid) url += "/" + postid;

        //if(aEditURI) url += "/" + aEditURI;

        //var date = bfXMLRPC.iso8601Format(date_created);
        var date = "";
        try{
            date = bfXMLRPC.iso8601Format(date_created);
        }catch(e){
            //foo
        }
        var body = "";
        var version = "ScribeFire 1.4.2";
        var theBlogCharType = gPerformancingUtil.getCharType();
        body += '<?xml version="1.0" encoding="UTF-8" ?>';
        body += '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://purl.org/atom/app#">';

        var draft = false;
        if(doPublish == false || doPublish == 'bool0') draft = true;
		
		description = description.replace(/&nbsp;/g, ' ');
		description = description.replace(/&amp;/g, '&');
		description = description.replace(/&/g, '&amp;');
		title = title.replace(/&amp;/g, '&');
		title = title.replace(/&/g, '&amp;');
		
       // alert("Is Draft? " + draft + " doPublish: " + doPublish);
        
        var useEntities = true;
        try{
            useEntities = gPerformancingUtil.prefs.getBoolPref('publish.usehtmlentities')
        }catch(e){
            useEntities = false;
        }
		
        //Use HTML Entities, thanks Theo
        useEntities = false;
		
        if(useEntities){
            var entity_description = "";
            for (var desc_i=0; desc_i < description.length; desc_i++){
                entity_description += "&#" + description.charCodeAt(desc_i) + ";";
            }
        
            var entity_title = "";
            for (var title_i=0; title_i < title.length; title_i++){
                entity_title += "&#" + title.charCodeAt(title_i) + ";";
            }
            
            description = entity_description;
            title = entity_title;
            /*
            <entry xmlns='http://www.w3.org/2005/Atom'>
              <title type='text'>Marriage!</title>
              <content type='xhtml'>
                <div xmlns="http://www.w3.org/1999/xhtml">
                  <p>Mr. Darcy has <em>proposed marriage</em> to me!</p>
                  <p>He is the last man on earth I would ever desire to marry.</p>
                  <p>Whatever shall I do?</p>
                </div>
              </content>
              <author>
                <name>Elizabeth Bennet</name>
                <email>liz@gmail.com</email>
              </author>
            </entry>
            */
            body += '  <title type="text/plain" mode="escaped">' + title + '</title>';
            body += '  <issued>' + date + '</issued>';
            body += '  <generator url="http://performancing.com/firefox">' + version + '</generator>';
            body += '  <content type="text/plain" mode="escaped">' + description + '</content>';
            //body += '  <draft xmlns="http://www.w3.org/2005/Atom">' + draft + '</draft> ';
            body += '</entry>';
        }else{
            //Set the Labels (categories)
            var getLabelArray = gPerformancingUtil.getArrOfCatChecked('blog-sidebar-listing-categories', false);
            if( getLabelArray != "" && getLabelArray.length > 0 ){
                for(var i=0; i < getLabelArray.length; i++){
                    body += '<category scheme="http://www.blogger.com/atom/ns#" term="'+getLabelArray[i].replace(/&/g,'&amp;')+'"/>';
                }
            }
            
            body += '<title mode="escaped" type="text">' + title + '</title>';
            body += '<issued>' + date + '</issued>';
            body += '<content type="xhtml">'
           // description = description.replace(/(&\S+)/g, "");
            var containsDIV = description.indexOf("<div xmlns=\"http://www.w3.org/1999/xhtml\">");
            if(containsDIV >= 0){
                body += description;
            }else{
                body += '<div xmlns="http://www.w3.org/1999/xhtml">' + description + '</div>';
            }
            body += '</content>';
            
            if(draft){
                body += '<app:control>';
                body += '  <app:draft>yes</app:draft>';
                body += '</app:control>';
            }else{
               // body += '<app:control>';
                //body += '  <app:draft>no</app:draft>';
                //body += '</app:control>';
            }
            body += ' </entry>';
        }
        dump("\n\n********** \nDescription: " + description +"\n\n********** \title: "+ title);
        
        this.doRequest(method,url,body,this.parsePosts, doPublish);
    },
    editPost: function ( postid, title, description, date_created, isDraft, aEditURI, aAtomID) {
        this.doPost( "PUT", postid, title, description, date_created, isDraft, aEditURI, aAtomID, "isEdit");
    },
    newPost: function ( title, description, date_created, isDraft) {
        this.doPost( "POST", null, title, description, date_created, isDraft);
    },
    parsePosts: function( inst) {
        //dump("\n\n NewPost response: " + inst +"\n\n");
        //gPFFDebugTemp.push(inst._req.responseXML);
        //gPFFDebugTemp.push(inst._req.responseText);
        var dom = inst._req.responseXML;
        //alert("The Post!!:\n"+ inst._req.responseText);
        if(!dom)
        {
            // LiveJournal - everone wants to be different, don't they?
            if(inst._req.responseText.match(/OK/)) {
                //listener.onResult(1);
                performancing_xmlcall.processData(1, null, null, "", true);
                return;
            }
            else {
                var fault =  {
                    faultString: "There was an error posting to your blog.\nPlease make sure you are posting valid HTML and try again."
                };
                fault.faultString += inst._req.responseText;
                //listener.onFault(fault);
                var localeString = performancingUI.getLocaleString('atomservererror', []);
                //alert("Error: 323232" );
                alert(localeString +" #301\nServer Response: "+ inst._req.responseText);
                return;
            }
        }
        var entries = dom.getElementsByTagName("entry");
        var rval = new Object();
        try
        {
            var entry_n = entries[0];
            var link_n = null;
            var perm_link_n = null;
            var atomid_n = inst.getNamedChild(entry_n, "id");
            var atomid = "";
            if(atomid_n) atomid = atomid_n.firstChild.nodeValue;
            for(var j=0;j<entry_n.childNodes.length;++j) {
                if(entry_n.childNodes[j].nodeName=="link") {
                    var tmp = entry_n.childNodes[j];
                    if(tmp.getAttribute("rel").match(/edit/)) {
                        link_n = tmp;
                    }
                    else if(tmp.getAttribute("rel").match(/self/)) {
                        perm_link_n = tmp;
                    }
                }
            }
            var href = link_n.getAttribute("href");
            rval.editURI = href;
            rval.atomid = atomid;
            href.match(/.+\/(.+)/);
            rval.uid = RegExp.$1;;
            //Livejournal hackage
            if(rval.editURI.length>0 && rval.atomid.length==0) {
                var perm_link = perm_link_n.getAttribute("href");
                if(perm_link.match(/livejournal/)) {
                    perm_link.match(/.+livejournal.com\/users\/(.+?)\/(.+?)\./);
                    rval.atomid = "urn:lj:livejournal.com:atom1:" + RegExp.$1 + ":" + RegExp.$2;
                    //alert(rval.atomid);
                    //alert(rval.atomid);
                }
            }
        }
        catch(e)
        {
            var localeString = performancingUI.getLocaleString('proccessingposterror', []);
            alert(localeString);
        }
        performancing_xmlcall.processData(rval, null, 'newpostcall', "", true );
        //performancing_xmlcall.processData(rval, 'historycall', null, true);
    },
    
    handleDelete: function( inst) {
        //listener.onResult(1);
        performancing_xmlcall.processData(1, null, 'deletehistorycall', "", true);
    }
}
//perFormancingBloggerAtomAPIObject.prototype = new perFormancingBlogAPI();

