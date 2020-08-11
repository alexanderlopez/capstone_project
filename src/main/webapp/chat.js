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
  document.getElementById("myForm").classList.add("chatOpen");
  document.getElementById("map").classList.remove("expanded");
  chatOpen =  true;
}

/**
 * @Private
 * Closes the chat
 */
function closeChat_() {
  document.getElementById("myForm").classList.remove("chatOpen");
  document.getElementById("map").classList.add("expanded");
  chatOpen = false;
}

/**
 * Loads chat 
 * @throws Will throw an error if cannot get chat history associated with current user
 */
function loadChatHistory() {
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
        });
}


/**
 * Sends chat comment from text area to server
*/
function addChatComment() {
    var commentObj = {
           type : "MSG_SEND",
           message : document.getElementById('comment-container').value
    };

    document.getElementById('comment-container').value = "";

    if (connection) {
        connection.send(JSON.stringify(commentObj));
    }
}

/**
 * @param{!Object} obj A JSON Object that represents the comment to be added 
 * Adds comment to page
 */
function handleChatMessage(obj) {
  //TODO(astepin): Include User ID and timestamp in the message
  var node = document.createElement("div");
  var textnode = document.createTextNode(obj.message);

  let userId = firebase.auth().currentUser.uid;
  if(obj.uid === userId) {
    node.classList.add("myMessage");
  } else {
    node.classList.add("otherMessage");
  }

  node.appendChild(textnode);
  document.getElementById("past-comments").appendChild(node);
}
