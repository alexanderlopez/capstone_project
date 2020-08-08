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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// MAP

let myMap;
let connection = new WebSocket(getServerlUrl());

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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// WEBSOCKET

connection.onopen = () => {
};

connection.onclose = () => {
};

connection.onerror = (error) => {
  throw 'Error'
};

connection.onmessage = (event) => {

  var obj = JSON.parse(event.data);

  switch(obj.type) {
      case 'MSG_RECV':
          let li = document.createElement('li');
          li.innerText = obj.uid + ": " + obj.message;
          document.querySelector('#chat').append(li);
          break;
      case 'MAP_RECV':
          myMap.handleMarker(obj);
          break;
      case 'MAP_DEL':
          myMap.deleteMarker(obj);
          break;
      default:
          throw 'Type not found';
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

    return protoSpec + "//" + location.hostname + "/chat/" + defaultChatRoomID + "?idToken=" + idToken;
}
