/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is FoxyTunes Mozilla Extension and Engine.
 * The Initial Developer of the Original Code is Alex Sirota <alex@elbrus.com>. 
 * Portions created by Alex Sirota are Copyright (C) 2004-2006 Alex Sirota. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 
 /*
 * This file's contents (performancingReposition.js) have been based entirely on code by Alex Sirota for the Foxy Tunes Extension, with permission, and in accordance to it's respective licenses.
 * See http://www.foxytunes.com/ for more information.
 */

function performancingInstallDragDropObserversForElementById(elementId, bInstall) {
   var elem = document.getElementById(elementId);
   if (elem == null) {
    //gperFormancingUI.printLog("\nAdding observer, cannot find element: " + elementId + "\n");
    return;
   }

   if (bInstall) {
    elem.addEventListener("dragover", performancingOnTargetDragOver, false);
    elem.addEventListener("dragexit", performancingOnTargetDragExit, false);
    elem.addEventListener("dragdrop", performancingOnTargetDragDrop, false);
   } else {
    elem.removeEventListener("dragover", performancingOnTargetDragOver, false);
    elem.removeEventListener("dragexit", performancingOnTargetDragExit, false);
    elem.removeEventListener("dragdrop", performancingOnTargetDragDrop, false);
   }
}

function performancingInstallUninstallDragDropObservers(bInstall) {
  performancingInstallDragDropObserversForElementById('status-bar', bInstall);

  // all the toolboxes:
  var toolboxes = document.getElementsByTagName('toolbox');
  for (var i = 0; i < toolboxes.length; i++) {
    performancingInstallDragDropObserversForElementById(toolboxes[i].id, bInstall);
  }

  // performancingInstallDragDropObserversForElementById('navigator-toolbox', bInstall);
}

function performancingInstallDragDropObservers() {
   performancingInstallUninstallDragDropObservers(true);
}

function performancingUnInstallDragDropObservers() {
   performancingInstallUninstallDragDropObservers(false);
}


function performancingHasDropClass(className) {
  var classNames = className.split(" ");
  for (var i = 0; i < classNames.length; i++) {
    if (classNames[i].indexOf('performancing-drop-target-') != -1) {
        return true;
    }
  }
  return false;
}

function performancingRemoveDropClass(className) {
  var classNames = className.split(" ");

  if (classNames.length < 1) {
    return className;
  }

  // see if the last class is performancing drop class:
  if (classNames[classNames.length - 1].indexOf('performancing-drop-target-') != -1) {
    classNames.length--; // truncate the array
        if (classNames.length > 0) {
        className = classNames.join(" ");
    } else {
        className = "";
    }
  } 
  return className;
}

function performancingElementIsToolbarOrStatusbar(elem) {
  return (elem.localName == "toolbar") || (elem.localName == "statusbar") || (elem.localName == "menubar");
}

function performancingSetDropTargetMarker(node, bSet) {
  var target = node;
  var side = 'left';
  if (performancingElementIsToolbarOrStatusbar(node)) {
    target = node.lastChild;
    side = "right";
  }
  
  if (target == null) {
    return;
  }

  if (bSet) {
    if (!performancingHasDropClass(target.className)) {
      var dropClassName = 'performancing-drop-target-' + side;
      target.className = target.className + " " + dropClassName;
    }
  } else {
    target.className = performancingRemoveDropClass(target.className);
  } 
}


function performancingOnTargetDragOver(event)
{
  nsDragAndDrop.dragOver(event, perFormancingTargetObserver);
}

function performancingOnTargetDragExit(event)
{
   if (gPerFormancingCurrentDropTarget != null) {
       performancingSetDropTargetMarker(gPerFormancingCurrentDropTarget, false);
   }
}

function performancingOnTargetDragDrop(event)
{
  nsDragAndDrop.drop(event, perFormancingTargetObserver);
}

var perFormancingDragStartObserver =
{
  onDragStart: function (event, transferData, action) {
    performancingInstallDragDropObservers();
    transferData.data = new TransferData();
    transferData.data.addDataForFlavour('id/performancing-widget', 'performancing-statusbar-panel');
  }
}


var perFormancingTargetObserver =
{
  onDragOver: function (event, flavour, session)
  {
   //gperFormancingUI.printLog("over\n");
   var topElement = event.target;
   var target = event.target;
   while (topElement && !performancingElementIsToolbarOrStatusbar(topElement)) {
          target = topElement;
          topElement = topElement.parentNode;
   } 
   
   var previousDragItem = gPerFormancingCurrentDropTarget;

   if (performancingElementIsToolbarOrStatusbar(target)) {
     gPerFormancingCurrentDropTarget = target;
   } else {
         var targetWidth = target.boxObject.width;
         var targetX = target.boxObject.x;

         gPerFormancingCurrentDropTarget = null;
         if (event.clientX > (targetX + (targetWidth / 2))) {
            gPerFormancingCurrentDropTarget = target.nextSibling;
            if (gPerFormancingCurrentDropTarget == null) {
              // last element in its parent, set target to parent
                  gPerFormancingCurrentDropTarget = topElement;
        }
         } else {
            gPerFormancingCurrentDropTarget = target;
         }    
   }

 //  gperFormancingUI.printLog("\nprev: " + previousDragItem.id + ", next: " + gPerFormancingCurrentDropTarget.id + "\n");
   if (previousDragItem && (gPerFormancingCurrentDropTarget != previousDragItem)) {
     performancingSetDropTargetMarker(previousDragItem, false);
   }
 
   if (gPerFormancingCurrentDropTarget.id.indexOf('performancing') == -1) { 
       performancingSetDropTargetMarker(gPerFormancingCurrentDropTarget, true);
       session.canDrop = true;
   } else {
     // cannot drop on myself: 
       performancingSetDropTargetMarker(gPerFormancingCurrentDropTarget, false);
       gPerFormancingCurrentDropTarget = null;
       session.canDrop = false;
   }
  },
 
  onDragExit: function (event, session) 
  {
    //gperFormancingUI.printLog("On Performancing Drag Exit");
  },

  onDrop: function (event, dropData, session)
  {
    //gperFormancingUI.printLog("On Performancing Drag Drop");
    performancingUnInstallDragDropObservers();
    if (gPerFormancingCurrentDropTarget == null) {
      return; 
    }
    performancingSetDropTargetMarker(gPerFormancingCurrentDropTarget, false);
    
    var draggedItemId = dropData.data;
    // sanity, should never happen:
    if (gPerFormancingCurrentDropTarget.id == draggedItemId) {
      return;
    }
  
    var topElement = event.target;
    while (topElement && !performancingElementIsToolbarOrStatusbar(topElement)) {
      topElement = topElement.parentNode;
    }
  
    // save the new settings:
    gPerFormancingParentElementID = topElement.id;
    gPerFormancingInsertBeforeElementId = gPerFormancingCurrentDropTarget.id;
  
    // for the case when the "insert before" element is a dynamic one, remember the 
    // "insert after" element
    if (gPerFormancingCurrentDropTarget.previousSibling) {	
      gPerFormancingInsertAfterElementId = gPerFormancingCurrentDropTarget.previousSibling.id;
    }
    
    gperformancing.savePositionPrefs();//Save Prefs
    
    performancingSetPerFormancingPosition();
  
    //gperFormancingUI.printLog("Inserted to: " + topElement.id + ", before " + gPerFormancingCurrentDropTarget.id);
    gPerFormancingCurrentDropTarget = null;
  },
  
  
  getSupportedFlavours: function ()
  {
    var flavours = new FlavourSet();
    flavours.appendFlavour("id/performancing-widget");
    return flavours;
  }
}


function performancingRenameTagName(elem, newTagName) {
    var newElem = document.createElement(newTagName);
    
    // copy all the attributes of the element
    for (var i=0; i < elem.attributes.length; i++) {
            newElem.setAttribute(elem.attributes[i].nodeName, elem.attributes[i].nodeValue);
    }
    
    // move all the children
    var children = elem.childNodes;
    for (var i=children.length-1; i >=0 ; i--) {
    var currentNode = children[i];
            elem.removeChild(currentNode);
            newElem.insertBefore(currentNode, newElem.firstChild);
    }
    return newElem;
}


function performancingSetPerFormancingPosition() {
  if ((gPerFormancingParentElementID == '') || (gPerFormancingInsertBeforeElementId == '')) {
  // nothing's set, return
  return;
  }

    var performancingWidget = document.getElementById('performancing-statusbar-panel');

    var parentElement = document.getElementById(gPerFormancingParentElementID);
    if (parentElement == null) {
        return;
    }
    //gperFormancingUI.printLog("\nParent element: " + gPerFormancingParentElementID + "\n");

    var insertBeforeElement = document.getElementById(gPerFormancingInsertBeforeElementId);
    var insertAfterElement = document.getElementById(gPerFormancingInsertAfterElementId);

    if ((insertBeforeElement == null) && (insertAfterElement == null)) {
        return;
    }

    //gperFormancingUI.printLog("\nInsert before element: " + gPerFormancingInsertBeforeElementId + "\n");
    //gperFormancingUI.printLog("\nInsert after element: " + gPerFormancingInsertAfterElementId + "\n");

    var oldParentNode = performancingWidget.parentNode;

    performancingWidget.parentNode.removeChild(performancingWidget);

    try {
        // make PerFormancing toolbaritem and not statubarpanel if needed:
        if ((parentElement.localName == 'toolbar') && (performancingWidget.localName == 'statusbarpanel')) {
            performancingWidget = performancingRenameTagName(performancingWidget, 'toolbaritem');
        }

        // make PerFormancing statusbarpanel and not toolbaritem if needed:
        if ((parentElement.localName == 'statusbar') && (performancingWidget.localName == 'toolbaritem')) {
            performancingWidget = performancingRenameTagName(performancingWidget, 'statusbarpanel');
        }

        // convention, if the parent equals insertbefore, insert as last
        if (parentElement != insertBeforeElement) {
            if (insertBeforeElement) {
                parentElement.insertBefore(performancingWidget, insertBeforeElement);
            } else {
                //gperFormancingUI.printLog('insert before failed try inserting after ' + gPerFormancingInsertAfterElementId + '\n');
                if (insertAfterElement.nextSibling) {
                    parentElement.insertBefore(performancingWidget, insertAfterElement.nextSibling);
                } else {
                    parentElement.appendChild(performancingWidget);
                }
            }
        } else {
            parentElement.appendChild(performancingWidget);
        }

        // need to re-setup the volume slider listeners:
        //performancingRegisterVolumeSliderEvents();
    } catch (err) {
        //gperFormancingUI.printLog("\nCouldn't reposition PerFormancing: " + err + "\n");
        oldParentNode.appendChild(performancingWidget);
    }
}

// the current drop target:
var gPerFormancingCurrentDropTarget = null;
