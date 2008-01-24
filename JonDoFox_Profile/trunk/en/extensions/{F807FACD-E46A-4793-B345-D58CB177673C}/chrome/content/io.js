// Basic JavaScript File and Directory IO module
// Based on MonkeeSage's code, v0.1
// A few modifications were made (By asquella), see 
//  <http://bugzilla.mozdev.org/show_bug.cgi?id=9070>
// The original version is available at <http://gratisdei.com/io.js>
// For more information about file I/O see
//  <http://kb.mozillazine.org/Dev_:_Extensions_:_Example_Code_:_File_IO>

if (typeof(PerFormancing_IO_Module) != 'boolean') {
    var PerFormancing_IO_Module = true;

    var PerFormancingFileIO = {
        localfileCID  : '@mozilla.org/file/local;1',
        localfileIID  : Components.interfaces.nsILocalFile,

        finstreamCID  : '@mozilla.org/network/file-input-stream;1',
        finstreamIID  : Components.interfaces.nsIFileInputStream,

        foutstreamCID : '@mozilla.org/network/file-output-stream;1',
        foutstreamIID : Components.interfaces.nsIFileOutputStream,

        sinstreamCID  : '@mozilla.org/scriptableinputstream;1',
        sinstreamIID  : Components.interfaces.nsIScriptableInputStream,

        suniconvCID   : '@mozilla.org/intl/scriptableunicodeconverter',
        suniconvIID   : Components.interfaces.nsIScriptableUnicodeConverter,

        open   : function(path) {
            try {
                var file = Components.classes[this.localfileCID]
                                .createInstance(this.localfileIID);
                file.initWithPath(path);
                return file;
            }
            catch(e) {
                return false;
            }
        },

        read   : function(file, charset) {
            try {
                var data     = new String();
                var fiStream = Components.classes[this.finstreamCID]
                                    .createInstance(this.finstreamIID);
                var siStream = Components.classes[this.sinstreamCID]
                                    .createInstance(this.sinstreamIID);
                fiStream.init(file, 1, 0, false);
                siStream.init(fiStream);
                data += siStream.read(-1);
                siStream.close();
                if (charset) {
                    data = this.toUnicode(charset, data);
                }
                return data;
            } 
            catch(e) {
                return false;
            }
        },

        write  : function(file, data, mode, charset) {
            try {
                var foStream = Components.classes[this.foutstreamCID]
                                    .createInstance(this.foutstreamIID);
                if (charset) {
                    data = this.fromUnicode(charset, data);
                }
                var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
                if (mode == 'a') {
                    flags = 0x02 | 0x10; // wronly | append
                }
                foStream.init(file, flags, 0664, 0);
                foStream.write(data, data.length);
                // foStream.flush();
                foStream.close();
                return true;
            }
            catch(e) {
                return false;
            }
        },

        create : function(file) {
            try {
                file.create(0x00, 0664);
                return true;
            }
            catch(e) {
                return false;
            }
        },

        unlink : function(file) {
            try {
                file.remove(false);
                return true;
            }
            catch(e) {
                return false;
            }
        },

        path   : function(file) {
      // file is nsIFile
      var ios = Components.classes["@mozilla.org/network/io-service;1"].
        getService(Components.interfaces.nsIIOService);
      var fileHandler = ios.getProtocolHandler("file").
        QueryInterface(Components.interfaces.nsIFileProtocolHandler);
      return fileHandler.getURLSpecFromFile(file);
        },

        toUnicode   : function(charset, data) {
            try{
                var uniConv = Components.classes[this.suniconvCID]
                                    .createInstance(this.suniconvIID);
                uniConv.charset = charset;
                data = uniConv.ConvertToUnicode(data);
            } 
            catch(e) {
                // foobar!
            }
            return data;
        },

        fromUnicode : function(charset, data) {
            try {
                var uniConv = Components.classes[this.suniconvCID]
                                    .createInstance(this.suniconvIID);
                uniConv.charset = charset;
                data = uniConv.ConvertFromUnicode(data);
                data += uniConv.Finish();
            }
            catch(e) {
                // foobar!
            }
            return data;
        }

    }

    var PerFormancingDirIO = {
        dirservCID : '@mozilla.org/file/directory_service;1',
        propsIID   : Components.interfaces.nsIProperties,
        fileIID    : Components.interfaces.nsIFile,

        get    : function(type) {
            try {
                var dir = Components.classes[this.dirservCID]
                                .getService(this.propsIID) //changed by <asqueella@gmail.com>
                                .get(type, this.fileIID);
                return dir;
            }
            catch(e) {
                return false;
            }
        },

        open   : function(path) {
            return PerFormancingFileIO.open(path);
        },

        create : function(dir) {
            try {
                dir.create(0x01, 0664);
                return true;
            }
            catch(e) {
                return false;
            }
        },

        read   : function(dir, recursive) {
            var list = new Array();
            try {
                if (dir.isDirectory()) {
                    if (recursive == null) {
                        recursive = false;
                    }
                    var files = dir.directoryEntries;
                    list = this._read(files, recursive);
                }
            }
            catch(e) {
                // foobar!
            }
            return list;
        },

        _read  : function(dirEntry, recursive) {
            var list = new Array();
            try {
                while (dirEntry.hasMoreElements()) {
                    list.push(dirEntry.getNext()
                                    .QueryInterface(PerFormancingFileIO.localfileIID));
                }
                if (recursive) {
                    var list2 = new Array();
                    for (var i = 0; i < list.length; ++i) {
                        if (list[i].isDirectory()) {
                            files = list[i].directoryEntries;
                            list2 = this._read(files, recursive);
                        }
                    }
                    for (i = 0; i < list2.length; ++i) {
                        list.push(list2[i]);
                    }
                }
            }
            catch(e) {
               // foobar!
            }
            return list;
        },

        unlink : function(dir, recursive) {
            try {
                if (recursive == null) {
                    recursive = false;
                }
                dir.remove(recursive);
                return true;
            }
            catch(e) {
                return false;
            }
        },

        path   : function (dir) {
            return PerFormancingFileIO.path(dir);
        }
    }
}
