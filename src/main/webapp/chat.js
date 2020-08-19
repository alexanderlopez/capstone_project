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
  } else {
    openChat_();
  }
}

/**
 * @Private
 * Opens the chat
 */
function openChat_() {
  addClass_("myForm", "chatOpen");
  removeClass_("mapOverlay", "expanded");
  chatOpen =  true;
}

/**
 * @Private
 * Closes the chat
 */
function closeChat_() {
  removeClass_("myForm", "chatOpen");
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
  // setChatDiv();
  firebase.auth().currentUser.getIdToken(/* forceRefresh= */ true)
      .then(idToken => getChatHistory_(idToken))
      .catch(error => {
        throw "Problem getting chat history";
      });
}

/**
 * @Private
 * Retrieves chat history from the server and adds them to the page
 * @param{number} idToken The ID associated with the current user
 */
function getChatHistory_(idToken) {
  fetch(`/chat-server?idToken=${idToken}&idRoom=${roomId}`)
        .then(response => response.json())
        .then((comments) => {
          for (const index in comments) {
            let comment = comments[index];
            handleChatMessage(comment);
          }
          //Thread.doneLoading();
        });
}


/**
 * Sends nonempty chat comment from text area to server
*/
function addChatComment() {
    var commentContent = document.getElementById('comment-container').value;

    if(commentContent.indexOf("\n")==0 || commentContent===""){
      document.getElementById('comment-container').value = "";
    } else {
      var commentObj = {
        type : "MSG_SEND",
        message : commentContent
        // tag : Thread.getCurrThreadName()
      };

      document.getElementById('comment-container').value = "";

      if (connection) {
          connection.send(JSON.stringify(commentObj));
      }
    }
}

/**
 * Sends the chat message to Thread to be added to the DOM
 * @param{!Object} obj A JSON Object that represents the comment to be added
 */
function handleChatMessage(obj) {
  let name = obj.name;
  let message = obj.message;
  let thread = obj.tag;
  let isCurrUser = obj.uid === userId;

  Thread.addMessage(name, message, thread, isCurrUser);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CHAT THREADS

/** Prevents the user from sending messages */
function disableMessageSend() {}

/** Allows the user to send messages */
function enableMessageSend() {}

/** Shows or hides the chat thread menu accordingly */
function toggleThreadMenu() {}

/**
 * @Private
 * Builds the menu item for the given thread wrapper
 * @param {Thread} thread the Thread associated with this menu item
 */
function createThreadMenuItem(thread) {}

/** Gives Thread the DOM element that should contain the chat messages */
function setChatDiv() {}
