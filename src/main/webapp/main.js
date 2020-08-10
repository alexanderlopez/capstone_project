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
let chatRoomID = (new URLSearchParams(location.search)).get('roomId');

let connection = new WebSocket(getServerUrl());

let domPromise = new Promise(function(resolve) {
      document.addEventListener("DOMContentLoaded", resolve);
    });

let mapPromise = new Promise(function(resolve) {
      document.getElementById("mapAPI").addEventListener("load", resolve);
    });

Promise.all([mapPromise, domPromise]).then(() => {
      initMap();
      initChat();
    });

function initMap() {
  myMap = new ChapMap();
}

function initChat() {
  document.getElementById('submitBtn').addEventListener('click', (event) => {
      event.preventDefault();
      let message = document.querySelector('#message').value;
      connection.send(message);
      document.querySelector('#message').value = '';
  });
}


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
          // TODO(alicevlasov): Handle MAP_RECV
          break;
      case 'MAP_DEL':
          // TODO(alicevlasov): Handle MAP_DEL
          break;
      default:
          throw 'Type not found';
  }
};

/**
 * Returns the server's URL, forcing it to HTTPS, if necessary
 * @return {string} The server's URL.
  */
function getServerUrl() {
    var protoSpec;
    var defaultIDToken = 12;

    if (location.protocol !== 'https:' && location.host != 'localhost:8080') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    if(location.protocol === 'https:'){
        protoSpec = 'wss:';
    } else {
        protoSpec = 'ws:';
    }

    return protoSpec + "//" + location.host + "/chat/" + chatRoomID + "?idToken=" + defaultIDToken;
}
