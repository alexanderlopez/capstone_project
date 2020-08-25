// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let chatOpen = false;

/**
 * Changes the status of the chat's open-ness
 */
function toggleChat() {
  if (chatOpen) {
    closeChat_();
    closeThreadMenu();
  } else {
    openChat_();
    visibleThread.scrollToBottom();
  }
}

/**
 * @Private
 * Opens the chat
 */
function openChat_() {
  addClass_("chat-popup", "chatOpen");
  removeClass_("mapOverlay", "expanded");
  chatOpen =  true;
}

/**
 * @Private
 * Closes the chat
 */
function closeChat_() {
  removeClass_("chat-popup", "chatOpen");
  addClass_("mapOverlay", "expanded");
  chatOpen = false;
}

/**
 * @Private
 * Adds a classname to a DOM element with the given id
 * @param {String} id the id of the DOM element
 * @param {String} className the class name to be added
 */
function addClass_(id, className) {
  document.getElementById(id).classList.add(className);
}


/**
 * @Private
 * Removes a classname to a DOM element with the given id
 * @param {String} id the id of the DOM element
 * @param {String} className the class name to be removed
 */
function removeClass_(id, className) {
  document.getElementById(id).classList.remove(className);
}

/**
 * Loads chat
 * @throws Will throw an error if cannot get chat history associated with current user
 */
function loadChatHistory() {
  // fetchStr initialized in main.js
  fetch("/chat-server"+fetchStr)
        .then(response => response.json())
        .then((comments) => {
          for (const index in comments) {
            let comment = comments[index];
            handleChatMessage(comment);
          }
          doneLoading();
        });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// PROCESS CHAT MESSAGES

const CHAT_INPUT = "comment-container";
const CHAT_SEND = "submitBtn";
const MAP_TRIGGER = "/MAP";
const ADD_COMMAND = "ADD";
const HELP_COMMAND = "HELP";
const COMMAND_BODY = "Generated by map commands";

/**
 * Sends nonempty chat comment from text area to server
 */
function addChatComment() {
  var chatInput = document.getElementById(CHAT_INPUT);
  var commentContent = chatInput.value;
  
  if(commentContent.indexOf("\n") !== 0 && commentContent !== "") {
    if(commentContent.split(" ")[0].toUpperCase() === MAP_TRIGGER) {
      handleMapCommand(commentContent);
    } else {
      sendMessage(commentContent, visibleThread.getName());
      chatInput.value = ""; 
    }
  }
}

/**
 * Sends a message to a chat thread
 * @param {String} content the content of the message
 * @param {String} currThread the thread this message should be sent to
 */
function sendMessage(content, currThread) {
  var commentObj = {
    type : "MSG_SEND",
    message : content,
    thread : currThread
  };
  connection.send(JSON.stringify(commentObj));
}

/**
 * Sends the chat message to Thread to be added to the DOM
 * @param{!Object} obj A JSON Object that represents the comment to be added
 */
function handleChatMessage(obj) {
  let name = obj.name;
  let message = obj.message;
  let thread = obj.thread;
  let isCurrUser = obj.uid === userId;

  addMessage(name, message, thread, isCurrUser);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CHAT THREADS

/**
 * Changes whether a user can or cannot send messages in the chat
 * @param {Boolean} enable if message sending should be enabled
 */
function toggleMessageSend(enable) {
  [CHAT_INPUT, CHAT_SEND].forEach((id) => {
      let el = document.getElementById(id);
      if (enable) {
        el.removeAttribute("disabled");
      } else {
        el.setAttribute("disabled", "");
      }
  });
}

const THREAD_MENU = "thread-menu";

var menuOpen;

/** Shows or hides the chat thread menu accordingly */
function toggleThreadMenu() {
  if (menuOpen) {
    closeThreadMenu();
  } else {
    openThreadMenu();
  }
}

/** Closes the thread menu */
function closeThreadMenu() {
  let menu = document.getElementById(THREAD_MENU);
  menu.classList.remove("open");
  hideTempThread();
  toggleMessageSend(/* enable= */ true);
  menuOpen = false;
}

/** Opens the thread menu */
function openThreadMenu() {
  let menu = document.getElementById(THREAD_MENU);
  menu.classList.add("open");
  toggleMessageSend(/* enable= */ false);
  menuOpen = true;
}

/**
 * Deals with all map commands written in the chat
 * @param {string} commentContent Represents the content of user's comment
 * @returns {!Object} Command to be executed
 */
function handleMapCommand(commentContent){
  var commentContentArr = commentContent.split(" ");
  var commentContentSize = commentContentArr.length;
  var commentAddress = commentContent.split(' ').slice(2).join(' ');

  if(commentContentSize > 1 && commentContentArr[1].toUpperCase() === ADD_COMMAND) {

    if(!isNaN(parseFloat(commentContentArr[2])) && !isNaN(parseFloat(commentContentArr[3]))){
      var position = new google.maps.LatLng(commentContentArr[2], commentContentArr[3]);
      myMap.sendPermMarkerInfo(position, commentAddress, COMMAND_BODY);
      myMap.panTo(position);
    } else {
      let commentContentUrl = commentAddress.replace(/ /g, "+");
      let addressUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${commentContentUrl}&key=AIzaSyDhchLLErkJukOoDeEbXfvtvYfntXh-z7I`;

      getCoordsFromAddress(addressUrl).then(position => {
        myMap.sendPermMarkerInfo(position, commentAddress, COMMAND_BODY);
        myMap.panTo(position);
      });
    }  
  } else if (commentContentSize > 1 && commentContentArr[1] === HELP_COMMAND){
    // TODO(astepin): Open list of commands
  } else {
    // TODO(astepin): Signal that command not understood, open help
  }
}

function getCoordsFromAddress(addressUrl) {
  return httpGetAsync(addressUrl).then(result => {
    var addressObj = JSON.parse(result);
    if(addressObj.status === "OK"){
      let lat = addressObj.results[0].geometry.location.lat;
      let lng = addressObj.results[0].geometry.location.lng;
      position = new google.maps.LatLng(lat, lng);
      return position;
      
    } else {
      // TODO(astepin): Signal address not understood, open help
    }
  });
}

/**
 * Asynchronously retrieves information about a given location
 * @param {string} contentUrl URL which provides location information 
 * @returns {string} JSON text representing all information about given location
 */
function httpGetAsync(contentUrl) {
  return new Promise(function(resolve){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            resolve(xmlHttp.responseText);
    }
    xmlHttp.open("GET", contentUrl, true); 
    xmlHttp.send(null);
  })  
}
