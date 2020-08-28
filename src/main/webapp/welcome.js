const MDCTab = mdc.tab.MDCTab;
const MDCTextField = mdc.textField.MDCTextField;
const MDCRipple = mdc.ripple.MDCRipple;
const MDCList = mdc.list.MDCList;

var tabRegions;
var textRegions;
var buttonRipple;
var mapList;
var mapListItems = [];

document.addEventListener("DOMContentLoaded", (event) => {
  tabRegions = [].map.call(document.querySelectorAll('.mdc-tab'), function(el) {
    return new MDCTab(el);
  });

  textRegions = [].map.call(document.querySelectorAll('.mdc-text-field'), function(el) {
    return new MDCTextField(el);
  });
  textRegions[0].disabled = true;
  textRegions[1].disabled = true;

  buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));

  mapList = new MDCList(document.querySelector('.mdc-list'));
});

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

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    // Other config options...
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
        },
        uiShown: function() {
            document.getElementById('sign-out').style.display = 'none';
        }
    },
    signInFlow: 'popup',
    signInSuccessUrl: '/'
};

var email;
var user;

firebase.auth().onAuthStateChanged(function(currUser) {
    if (currUser) {
      currUser = user;
      email = firebase.auth().currentUser.email;
      firebase.auth().currentUser
        .getIdToken(/* forceRefresh= */ true)
        .then(idToken => getUserInfo_(user, idToken, showUserDetails))
        .catch(error => {
          throw "Problem getting chat history";
        });
    } else {
      displayLoginInfo_();
    }
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var idToken;

const LOGIN_EL = 'firebaseui-auth-container';
const LOADING_EL ='loading';
const WELCOME_EL ='welcome-message';
const DETAILS_EL = 'user-details';
const MAPS_WRAPPER = 'maps-wrapper';
const USERNAME_FORM = 'username-form';
const PANEL = "panel";
const HEADER = "header";
const LOGGED_IN = "logged-in";

/**
 * @Private
 * Retrieves the current user's information from the server
 * @param {firebase.auth().User} user the current page user
 * @param {firbase.auth().IdToken} userIdToken the current user's idToken
 * @param {*} callback functin to be called after information is loaded
 */
function getUserInfo_(user, userIdToken, callback) {
  idToken = userIdToken;
  let userEmail = firebase.auth().currentUser.email;
  let userDetails = fetch(`/user-server?idToken=${idToken}&getUserDetails=true`)
        .then(response => response.json())
        .then((userJson) => displayUserInfo_(userJson, userEmail, callback));
}

/**
 * @Private
 * Retrieves the current user's details and customizes the page accordingly
 * @param {Object} userJson json containing the user's details
 * @param {String} email the current user's email
 * @param {*} callback function to be called when all info is loaded
 */
function displayUserInfo_(userJson, email, callback) {
  // no information is given if this is a new user
  let isNewUser = Object.keys(userJson).length === 0;

  hideEl_(document.getElementById(LOADING_EL));
  showEl_(document.getElementById('sign-out'));
  document.getElementById(HEADER).classList.add(LOGGED_IN);

  loadUserDetails_(email, userJson.name);

  if (isNewUser) {
    setWelcomeMessage_();
    disableMapCreating_();
    enableUsernameForm();
  } else {
    setWelcomeMessage_(userJson.name);
    loadUserMaps_(userJson.rooms);
  }

  callback();
}


/**
 * @Private
 * Displays a welcome message with the client's username when applicable
 */
function setWelcomeMessage_(userName) {
  let messageDiv = document.getElementById(WELCOME_EL);
  showEl_(messageDiv);

  let message = "";

  if (userName) {
      message = `Welcome ${userName}!`;
  } else {
      message = "Please enter a username to proceed";
  }

  messageDiv.innerHTML = message;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CREATE MAP OR USER

/**
 * @Private
 * Displays the form where users can enter their username and hides the
 * new map form if it is visible
 */
function enableUsernameForm() {
  textRegions[1].disabled = false;

  hideEl_(document.getElementById('edit-details'));
  showEl_(document.getElementById('save-details'));
}

/** Displays the form where users can create a new map */
function showMapForm() {
  document.getElementById("submit-map-form").style.display = 'flex';
  hideEl_(document.getElementById('add-map'));
  showEl_(document.getElementById('submit-map'));
}

/** Hides and resets the form where users can create a new map */
function hideMapForm() {
  hideEl_(document.getElementById("submit-map-form"));
  textRegions[2].value = "";
  showEl_(document.getElementById('add-map'));
  hideEl_(document.getElementById('submit-map'));
}

/** Sends the submitted map name to the server */
function submitMap() {
  let input = textRegions[2];
  if (input.value !== "") {
    submitNewItem("room-server", input, showUserMaps);
  }
}

/** Sends the submitted username to the server */
function submitUsername() {
  let input = textRegions[1];
  submitNewItem("user-server", input, showUserDetails);
}

/**
 * Retrieves input value, sends to the given server, and handles server response
 * @param {String} server the name of the server the info should be sent to
 * @param {Element} input the DOM element containing the relevant content
 * @param {*} callback the function to be called after the information is set
 */
 function submitNewItem(server, input, callback) {
   var params = {
       name: input.value,
       id: idToken
   };
   hideMapForm();
   fetch(`/${server}`, {
         method:'POST',
         headers: { 'Content-Type': 'text/html' },
         body: JSON.stringify(params)
     }).then((response) => response.text())
       .then((worked) => {
        if (worked == 'true') {
          getUserInfo_(user, idToken, callback);
        }
        else {
          alert("Submit failed, please try again");
        }
      });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// USERS AND MAPS ALREADY EXIST

/**
 * @Private
 * Displays the logged-in user's customized details
 * @param {String} email the user's email address
 * @param {?String} username the user's chosen username
 */
function loadUserDetails_(email, username) {
  showEl_(document.getElementById(PANEL));
  let displayDiv = document.getElementById(DETAILS_EL);

  textRegions[0].value = email;

  if (username != null) {
    textRegions[1].value = username;
  }

  showEl_(displayDiv);
}

/**
 * @Private
 * Changes which tab is visible in the main panel
 * @param {String} showDivId id of the content to be shown
 * @param {String} hideDivId id of the content to be hidden
 */
function togglePanel_(showDivId, showTab, hideDivId, hideTab) {
  let currentActive = hideTab.computeIndicatorClientRect();
  hideTab.deactivate();
  showTab.activate(currentActive);
  showEl_(document.getElementById(showDivId));
  hideEl_(document.getElementById(hideDivId));
}

/** Determines which tab is currently visible to the user */
function getCurrentActiveTab() {
  if (tabRegions[0].active) {
    return tabRegions[0]
  }
  else if (tabRegions[1].active) {
    return tabRegions[1];
  }
}

/**
 * Hides the user's maps tab and shows the profile tab instead
 */
function showUserDetails() {
  togglePanel_(/* showDivId= */ DETAILS_EL, /* showTab= */ tabRegions[0], /* hideDivId= */ MAPS_WRAPPER, /* hideTab= */ tabRegions[1]);
}

/**
 * Hides the user's profile tab and shows the map tab instead
 */
function showUserMaps() {
  togglePanel_(/* showDivId= */ MAPS_WRAPPER, /* showTab= */ tabRegions[1], /* hideDivId= */ DETAILS_EL, /* hideTab= */ tabRegions[0]);
}

/**
 * @Private
 * Creates buttons to navigate the user to the given maps
 * @param {JSON} mapsJson json array containing map ids and names
 */
function loadUserMaps_(mapsJson) {
  let rooms = document.querySelector('.mdc-list');
  let roomForm = rooms.firstElementChild;
  rooms.innerHTML = "";
  rooms.appendChild(roomForm);

  for (const i in mapsJson) {
    let room = mapsJson[i];
    let roomId = room.roomId;
    let roomName = room.name;
    rooms.appendChild(makeRoomButton_(roomId, roomName));
  }
}

/**
 * @Private
 * Returns a button that redirects the user to a new chatroom
 * @param {String} id the unique id of the map
 * @param {String} name the given name of the map
 */
function makeRoomButton_(id, name) {
  let roomWrapper = makeEl("div", "roomWrapper");
  let roomBtn = makeEl("li", "mdc-list-item");
  roomBtn.classList.add("map-item");
  roomBtn.appendChild(makeEl("span", "mdc-list-item__ripple"));

  let graphicElement = makeEl("span", "mdc-list-item__graphic");
  let iconElement = makeEl("span", "material-icons");
  iconElement.innerText = "map";

  graphicElement.appendChild(iconElement);

  roomBtn.appendChild(graphicElement);

  let roomText = makeEl("span", "mdc-list-item__text");
  roomText.innerText = name;
  roomBtn.appendChild(roomText);

  roomBtn.addEventListener('click', (clickEvent) => {
    location.href=`/chatroom.html?roomId=${id}`;
  });

  mapListItems.push(new MDCRipple(roomBtn));

  let deleteBtn = makeEl("button", "cancel-btn");
  deleteBtn.addEventListener('click', () => removeRoom(id));

  roomWrapper.appendChild(roomBtn);
  roomWrapper.appendChild(deleteBtn);
  return roomWrapper;
}

/**
 * Removes a room from a user's welcome page. If this is the only user of the
 * chatroom, the chatroom is deleted
 * @param {String} id the id of the room to be removed
 */
function removeRoom(id) {
  fetch(`/share-server?idToken=${idToken}&idRoom=${id}`)
      .then((response) => response.json())
      .then((emails) => {
          let server = "/room-server";
          let params = {
            id: idToken,
            roomId: id
          }

          if (emails.length !== 1) {
            params.email = email;
            server = "/share-server";
          }

          fetch(server, {
                method: 'DELETE',
                headers: { 'Content-Type': 'text/html' },
                body: JSON.stringify(params)}
          ).then(() => getUserInfo_(user, idToken, showUserMaps));
        });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// LOGIN/LOGOUT

/**
 * Prevents the user from creating a new map
 */
function disableMapCreating_() {
  let btn = document.getElementById("add-map");
  btn.onclick = "";
}

/**
 * @Private
 * Hides all page content and initializes firebase login buttons
 */
function displayLoginInfo_() {
  let toHide = [LOADING_EL, PANEL, WELCOME_EL];
  toHide.forEach((id) => hideEl_(document.getElementById(id)));

  // change header styling to default
  let header = document.getElementById(HEADER)
  header.classList.remove(LOGGED_IN);

  showEl_(document.getElementById(LOGIN_EL));

  ui.start('#'+LOGIN_EL, uiConfig);
}

/**
 * Signs the user out and refreshes the page
 */
function logOut() {
    firebase.auth().signOut();
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Helper functions

/**
 * @Private
 * Changes the display style of the DOM element to block
 * @param {Element} el DOM element of object to be modified
 */
function showEl_(el) {
  el.style.display = 'block';
}

/**
 * @Private
 * Changes the display style of the DOM element to none
 * @param {Element} el DOM element of object to be modified
 */
function hideEl_(el) {
  el.style.display = 'none';
}

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
