function goDoCommand(command)
{
  try {
    var controller = top.document.commandDispatcher.getControllerForCommand(command);
    if ( controller && controller.isCommandEnabled(command))
      controller.doCommand(command);
  }
  catch (e) {
    dump("An error occurred executing the "+command+" command\n");
  }
}

function performancing_cut() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.cut();
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_cut");
    }
}
function performancing_paste() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.paste(1);
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_paste");
    }
}
function performancing_copy() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.copy();
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_copy");
    }
}
function performancing_pastenoformatting() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.pasteNoFormatting(1);
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_paste");
    }
}
function performancing_delete() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.deleteSelection(1);
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_delete");
    }
}
function performancing_undo() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.undo(1);
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_undo");
    }
}
function performancing_redo() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.redo(1);
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_redo");
    }
}

function performancing_selectAll() {
    if (document.getElementById("performancing-editor-tabbox").selectedIndex == 0) {
        var midas = document.getElementById("performancing-message");
        var HTMLEditor = midas.getHTMLEditor(midas.contentWindow);
        HTMLEditor.selectAll();
    } else if (document.getElementById("performancing-editor-tabbox").selectedIndex == 1) {
        goDoCommand("cmd_selectAll");
    }
}