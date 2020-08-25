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

const MDCTextField = mdc.textField.MDCTextField;
const MDCRipple = mdc.ripple.MDCRipple;

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

let currRoomId = (new URLSearchParams(location.search)).get('roomId');

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
let userEmail = null;
let idToken = null;

/** Waits until all promises are fullfilled before opening the websocket and
 * setting up the map and chat
 */
Promise.all([mapPromise, domPromise, firebasePromise])
       .then((values) => {
         let currUser = firebase.auth().currentUser;
         userId = currUser.uid;
         userEmail = currUser.email;

         firebase.auth().currentUser.getIdToken(/* forceRefresh= */ true)
             .then(token => {
               idToken = token;
               fetchStr = `?idToken=${idToken}&idRoom=${currRoomId}`;

               validateUser(values);
               initChatroom();
             });
       });

/**
 * Sends the user back to the home page if they do not have access to this
 * chatroom
 */
function validateUser(values) {
  let user = values[2];
  fetch("/authentication"+fetchStr)
    .then((response) => response.text())
    .then((allowed) => {
      if (!user || allowed == "false") {
        location.href = "/";
      }
    });
}

var fetchStr;

/** Opens the websocket and initalizes all the chatroom components */
function initChatroom() {
  getServerUrl()
      .then(result => {
        connection = new WebSocket(result);
        
        initMaterial();
        initWebsocket();
        initMarkerMenu();
        initThreads();
        initMap();
        initChat();
        initSharing();
      });
}

/**
 * Builds the content of the fetch call with a method, headers, and body
 * @param {String} type the fetch method
 * @param {Object} params the parameters that need to be sent
 */
function buildFetchContent(type, params) {
  return {
    method: type,
    headers: { 'Content-Type': 'text/html' },
    body: JSON.stringify(params)
  };
}

/**
 * Adds the user id token and room id to fetch parameters
 * @param {Object} params the existing customized parameters
 */
function buildFetchParams(params) {
  params.id = idToken;
  params.roomId = currRoomId;
  return params;
}

const DEFAULT_LAT = -34.397;
const DEFAULT_LNG =  150.644;

/** Initalizes the map */
function initMap() {
  getCoords().then(coords => {
    myMap = new ChapMap(coords);
  }).catch(() => {
    myMap = new ChapMap([DEFAULT_LAT, DEFAULT_LNG]);
  })
}

/**
 * Sets up chat listeners
 */
function initChat() {
  loadChatHistory();

  textInput = new MDCTextField(document.getElementById("comment-container-material"));
  textInput.listen('keydown', (keyEvent) => {
    if (keyEvent.key === 'Enter') {
      addChatComment();
    }
  });
}

var textFields;
var ripples;

function initMaterial() {
  ripples = [].map.call(document.querySelectorAll('.mdc-button'), function(el) {
    return new MDCRipple(el);
  });

  textFields = [].map.call(document.querySelectorAll('.mdc-text-field'), function(el) {
    return new MDCTextField(el);
  });
}

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
  });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// HELPER FUNCIONS

/**
 * Returns a DOM element of the given type with a certain id and class
 * @param {String} type the type of DOM element to be created
 * @param {?String} elClass the classname to be given to the element
 * @param {?String} elId the id the element should be given
 */
function makeEl(type, elClass, elId) {
  let el = document.createElement(type);
  if (elId) {
    el.id = elId;
  }
  if (elClass) {
    el.classList.add(elClass);
  }
  return el;
}

/**
 * Sets a click-trigger event to the DOM element with the given id and
 * sets the callback function to the one given
 * @param {String} id the id of the element to be added
 * @param {*} fn the anonymous function to be called on click
 */
function addClickEvent(id, fn) {
  let btn = document.getElementById(id);
  btn.addEventListener('click', fn);
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

    return protoSpec + "//" + location.host + "/chat/" + currRoomId + "?idToken=" + idToken;
}
