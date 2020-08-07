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

/** map visible on the website */

let myMap;
var connection = new WebSocket(getServerlUrl());

let domPromise = new Promise(function(resolve) {
      document.addEventListener("DOMContentLoaded", resolve);
    });

let mapPromise = new Promise(function(resolve) {
      document.getElementById("mapAPI").addEventListener("load", resolve);
    });

Promise.all([mapPromise, domPromise]).then(() => {
      initMap();
    });

function initMap() {
  myMap = new ChapMap();
}


connection.onopen = () => {
};

connection.onclose = () => {
};

connection.onerror = (error) => {
  console.error(error);
};

connection.onmessage = (event) => {
  let li = document.createElement('li');
  
  var obj = JSON.parse(event.data); 

  if(obj.type !== 'MSG_RECV'){
      // let Alice deal with it;
      // obj is a JSON object
  } else {
      li.innerText = obj.uid + ": " + obj.message;
      document.querySelector('#chat').append(li);
  }  
};

function getServerUrl() {
    
    var defaultChatRoomID = "1234goroom";
    var protoSpec;
    var defaultIDToken = 12;

    if (location.protocol !== 'https:' && location.hostname != 'localhost:8080') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    } 

    if(location.protocol === 'https:'){
        protoSpec = 'wss:';
    } else {
        protoSpec = 'ws:';
    }

    return location.protocol + "//" + location.hostname + "/chat/" + defaultChatRoomID + "?idToken=" + idToken;
}
