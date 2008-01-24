var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

var whitelist = prefObj.getCharPref("layerblock.whitelist").split("/");
var blacklist = prefObj.getCharPref("layerblock.blacklist").split("/");
var statustext = prefObj.getBoolPref("layerblock.showStatusText");
var blockeds = 0;
var undo = false;
var state = prefObj.getIntPref("layerblock.state");

function layerblock_init()
{
    window.addEventListener("select", layerblock_block_layers_2 ,true);
    layerblock_block_layers()
    if (state==0)
    layerblock_activate();
    else if (state==1)
    layerblock_deactivate();
    else
    layerblock_debug();
}

window.addEventListener("load",layerblock_init,true);

function layerblock_block_layers_2()
{
    var doc = window._content.document;
    if (!doc._LayerblockWasHere)
        layerblock_block_layers();
    else
    {
        layerblock_show(doc._LayerblockNum);
    }
}

function layerblock_show(blockeds)
{
    if (blockeds == 0)
    {
        document.getElementById("layerboverlay").style.setProperty("background","none","important");
        document.getElementById("layerblockcaption").setAttribute("hidden","true");
    }
    else
    {
        document.getElementById("layerboverlay").style.setProperty("background","url(chrome://layerblock/skin/statusicon_overlay.png) no-repeat","important");
        document.getElementById("layerblockcaption").setAttribute("hidden",statustext?"false":"true");
    }
}

function layerblock_block_layers()
{
    blockeds = 0;
    var doc = window._content.document;
    doc._LayerblockWasHere = true;
    if (state != 1)
    {
        layerblock_do_layer_detection(doc);
        layerblock_check_frames(doc);
    }
    doc._LayerblockNum = blockeds;
    layerblock_show(blockeds);
}

function layerblock_show_blocked_silent()
{
    blockeds = 0;
    undo = true;
    var doc = window._content.document;
    layerblock_do_layer_detection(doc);
    layerblock_check_frames(doc);
    undo = false;
    layerblock_show(0);
}

function layerblock_check_frames(doc)
{
      var frame = 0;
      var frams = doc.getElementsByTagName("frame");
      while (frame < frams.length) {
         var frame_doc = frams[frame].contentDocument;
         //dump ("Loading Frame:" + frame_doc.title);
         layerblock_do_layer_detection(frame_doc);
         layerblock_check_frames(frame_doc);
         frame++;
      }

}
function layerblock_do_layer_detection(doc)
{
    layerblock_detect_elements(doc,"div");
    layerblock_detect_elements(doc,"table");
    //context ads
    iTt = doc.getElementById("iTt");
    if (iTt)
        layerblock_block_elem(doc,iTt);
}

function layerblock_detect_elements(doc,elemname)
{
    var i = 0;
    var elm = doc.getElementsByTagName(elemname);
    while ( i < elm.length )
    {
        //dump("----NEW ELEM-----\n");
        if (layerblock_check_elem(doc,elm[i]))
            layerblock_block_elem(doc,elm[i]);
        i++
    }
}

function layerblock_check_elem(doc,item)
{
    var points = 0;
    if (item.id == "")
    {
        return false;
    }
    var position = doc.defaultView.getComputedStyle(item,"").getPropertyValue("position");
    if (position == "static" || position == "relative")
    {
        return false;
    }
    if (item.id.match(/[0-9a-f]{32}/) && item.className.match(/[0-9A-Za-z]{30,38}/))
    {
        return true;
    }
    if (item.id.match(/pop_[0-9a-f]{12}/))
    {
        return true;
    }
    if (item.childNodes.length >= 3 && item.id.match(/[0-9a-f]{30,38}/))
    {
        if (item.childNodes[0].nodeName == "DIV"
        && item.childNodes[1].nodeName == "DIV"
        && item.childNodes[2].nodeName == "DIV"
        && item.childNodes[1].textContent == ""
        && item.childNodes[2].textContent == "")
            return true;
    }
    if (item.id == "container")
    {
        return false;
    }
    //dump("id:" + item.id + "\n");
    if (item.className == "spMain")
    {
        return true;
    }
    if (item.className == "layer_main")
    {
        return true;
    }
    if (item.className == "window" && item.id=="siteunderDHTML")
    {
        return true;
    }
    if (item.id.indexOf("sponsorads")==0)
    {
        return true;
    }
    if (item.id.indexOf("ad-")==0)
    {
        return true;
    }
    if (item.id.indexOf("ad_")==0)
    {
        return true;
    }
    if (item.id.indexOf("pagepeel_")==0)
    {
        return true;
    }    
    if (item.id.indexOf("adlayer")==0)
    {
        return true;
    }    
    if (item.id.indexOf("pop1")==0)
    {
        return true;
    }
    if (item.id.indexOf("kona")==0)
    {
        return true;
    }
    if (item.id.indexOf("advertisement")==0)
    {
        return true;
    }
    if (item.id.indexOf("phpads_")==0)
    {
        return true;
    }
    if (item.id=="mouselayer")
    {
        return true;
    }
    if (item.id=="floatingad")
    {
        return true;
    }    
   
    if (item.id.indexOf("map")==0)
    {
        return false;
    }
    var txt = item.innerHTML.toLowerCase();
    if (txt.indexOf("http://") < 0 && txt.indexOf("script") < 0)
    {
        return false;
    }
    if (txt.match(/http:\/\/layer-ads.de\/.*\?/))
    {
        return true;
    }
    var f = 0;
    for (f=0;f<whitelist.length;f++)
    {
        if (txt.indexOf(whitelist[f]) >= 0)
        {
            return false;
        }
    }
    var q = 0;
    for (f=0;f<blacklist.length;f++)
    {
    if (txt.indexOf(blacklist[f]) >= 0)
        q++;
    }
    if (q == 0)
    {
        return false;
    }
    points += q;
    if (points > 3)
    {
        return true;
    }
    return false;
}

function layerblock_block_elem(doc,item)
{
    if (state==2)
    {
        if (undo)
        {
            item.style.outline="none";
            item.style.opacity="1";
        }
        else
        {
            item.style.outline="4px dotted #F0F";
            item.style.opacity="0.5";
        }
    }
    else
    {
        if (undo)
        {
            item.style.setProperty("display","block","important");
        }
        else
        {
            item.style.setProperty("display","none","important");
        }
    }
    item.setAttribute("layer-ad","true");
    blockeds++;
}


function layerblock_deactivate()
{
layerblock_show_blocked_silent();
state=1;
prefObj.setIntPref("layerblock.state",state);
document.getElementById("layerb").style.setProperty("background","url(chrome://layerblock/skin/statusicon_inactive.png) no-repeat","important");
layerblock_select();
}

function layerblock_activate()
{
layerblock_show_blocked_silent();
state=0;
prefObj.setIntPref("layerblock.state",state);
document.getElementById("layerb").style.setProperty("background","url(chrome://layerblock/skin/statusicon_active.png) no-repeat","important");
layerblock_select();
layerblock_block_layers()
}

function layerblock_debug()
{
layerblock_show_blocked_silent();
state=2;
prefObj.setIntPref("layerblock.state",state);
document.getElementById("layerb").style.setProperty("background","url(chrome://layerblock/skin/statusicon_debug.png) no-repeat","important");
layerblock_select();
layerblock_block_layers()
}

function layerblock_select()
{
    if (state==0)
    document.getElementById("lbmenact").setAttribute('checked','true');
    if (state==1)
    document.getElementById("lbmendea").setAttribute('checked','true');
    if (state==2)
    document.getElementById("lbmendeb").setAttribute('checked','true');
}