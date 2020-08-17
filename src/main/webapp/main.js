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

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDhchLLErkJukOoDeEbXfvtvYfntXh-z7I",
  authDomain: "chap-2020-capstone.firebaseapp.com",
  databaseURL: "https://chap-2020-capstone.firebaseio.com",
  projectId: "chap-2020-capstone",
  storageBucket: "chap-2020-capstone.appspot.com",
  messagingSenderId: "155287718044",
  appId: "1:155287718044:web:e7daa339ab8dffe2c98559"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// MAP

let myMap;
let roomId = (new URLSearchParams(location.search)).get('roomId');

/** Waits for the page HTML to load */
let domPromise = new Promise(function(resolve) {
      document.addEventListener("DOMContentLoaded", resolve);
    });

/** Waits for the google Maps API to load */
let mapPromise = new Promise(function(resolve) {
      document.getElementById("mapAPI").addEventListener("load", resolve);
    });

/** Waits for the firebase authenticator to initialize */
let firebasePromise = new Promise(function(resolve) {
      firebase.auth().onAuthStateChanged(resolve)
    });

let connection = null;
let userId = null;

const DEFAULT_LAT = -34.397;
const DEFAULT_LNG =  150.644;

/** Waits until all promises are fullfilled before opening the websocket and
 * setting up the map and chat
 */
Promise.all([mapPromise, domPromise, firebasePromise]).then((values) => {
      let user = values[2];
      if (!user) {
        location.href = "/";
      }

      userId = firebase.auth().currentUser.uid;
      getServerUrl().then(result => {
        connection = new WebSocket(result);
        initWebsocket();
        
        getCoords().then(coords => {
          myMap = new ChapMap(coords);
        }).catch(() => {
          myMap = new ChapMap([DEFAULT_LAT, DEFAULT_LNG]);
        })
       
        initChat();
      });
    });

/**
 * Returns the user's coordinates, if possible
 * @returns{!Promise<Array<Number>>} Promise for a tuple representing
 * the user's latitude and longitude.
 */
function getCoords(){

  return new Promise(function(resolve, reject){
    
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        if(position.coords.latitude && position.coords.longitude){
          resolve([position.coords.latitude, position.coords.longitude]);
        } else {
          reject();
        }
      }, reject);
    } else {
      reject();
    }    
  })
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// WEBSOCKET

/** Sets up all websocket listeners */
function initWebsocket() {
  connection.onopen = () => {
  };

  connection.onclose = () => {
    getServerUrl().then(result => {
      connection = new WebSocket(result);
    });
  };

  connection.onerror = (error) => {
    throw 'Error'
  };

  connection.onmessage = (event) => {

    var obj = JSON.parse(event.data);

    switch(obj.type) {
        case 'MSG_RECV':
            handleChatMessage(obj);
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
}


/**
 * Returns the server's URL, forcing it to HTTPS, if necessary
 * @return {String} The server's URL.
  */
async function getServerUrl() {
    var protoSpec;

    if (location.protocol !== 'https:' && location.host != 'localhost:8080') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    if(location.protocol === 'https:'){
        protoSpec = 'wss:';
    } else {
        protoSpec = 'ws:';
    }

    let idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh= */ true);

    return protoSpec + "//" + location.host + "/chat/" + roomId + "?idToken=" + idToken;
}

/**
 * Sets up chat listeners
 */
function initChat() {
  loadChatHistory();

  var input = document.getElementById("comment-container");
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("submitBtn").click();
    }
  });
}
