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
 * Sends nonempty chat comment from text area to server
*/
function addChatComment() {
    var commentContent = document.getElementById('comment-container').value;

    if(commentContent.indexOf("\n")==0 || commentContent===""){
      document.getElementById('comment-container').value = "";
    } else {
      var commentContentArr = commentContent.split(" ");
      var commentContentSize = commentContentArr.length;
      if(commentContentArr[0] === "/MAP") {
        if(commentContentSize === 6 && commentContentArr[1]==="ADD") {
          // add the marker / do something with the marker 
          position = new google.maps.LatLng(commentContentArr[4], commentContentArr[5]);
          myMap.sendPermMarkerInfo(position, commentContentArr[2], commentContentArr[3]);
          myMap.panTo(position);
          document.getElementById('comment-container').value = "";
        } else if (commentContentSize > 1 && commentContentArr[1] === "HELP"){
          // help the user 
          console.log("Help is on the way!");
        } else {
          // command not understood, pull up help
          console.log("Command not understood, help is on the way");
        }
      } else {
        var commentObj = {
          type : "MSG_SEND",
          message : commentContent
        };
  
        document.getElementById('comment-container').value = "";
  
        if (connection) {
            connection.send(JSON.stringify(commentObj));
        }
      }
      
    }
}

/**
 * @param{!Object} obj A JSON Object that represents the comment to be added
 * Adds comment to page
 */
function handleChatMessage(obj) {
  //TODO(astepin): Include timestamp in the message

  var node = document.createElement("div");
  var textnode = document.createTextNode(obj.name + ": " + obj.message);

  let userId = firebase.auth().currentUser.uid;
  if(obj.uid === userId) {
    node.classList.add("myMessage");
  } else {
    node.classList.add("otherMessage");
  }
  node.classList.add("message");

  node.appendChild(textnode);
  document.getElementById("past-comments").appendChild(node);
}


