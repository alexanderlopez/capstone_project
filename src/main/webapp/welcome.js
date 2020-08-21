const MDCTab = mdc.tab.MDCTab;
const MDCTextField = mdc.textField.MDCTextField;
const MDCRipple = mdc.ripple.MDCRipple;

var tabRegions;
var textRegions;
var buttonRipple;

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

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      firebase.auth().currentUser
        .getIdToken(/* forceRefresh= */ true)
        .then(idToken => getUserInfo_(user, idToken))
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
 */
function getUserInfo_(user, userIdToken) {
  idToken = userIdToken;
  let userEmail = firebase.auth().currentUser.email;
  let userDetails = fetch(`/user-server?idToken=${idToken}&getUserDetails=true`)
        .then(response => response.json())
        .then((userJson) => displayUserInfo_(userJson, userEmail));
}

/**
 * @Private
 * Retrieves the current user's details and customizes the page accordingly
 * @param {Object} userJson json containing the user's details
 * @param {String} email the current user's email
 */
function displayUserInfo_(userJson, email) {
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

/**
 * @Private
 * Displays the form where users can create a new map and hides the
 * username form if it is visible
 */
function showMapForm() {
  showEl_(document.getElementById("map-form-wrapper"));
  hideEl_(document.getElementById('add-map'));
  showEl_(document.getElementById('submit-map'));
}

/**
 * Sends the submitted map name to the server
 */
function submitMap() {
  let input = document.getElementById('new-map-form');
  submitNewItem("room-server", input);
}

/**
 * Sends the submitted username to the server
 */
function submitUsername() {
  let input = textRegions[1];
  submitNewItem("user-server", input);
}

/**
 * Retrieves input value, sends to the given server, and handles server response
 */
 function submitNewItem(server, input) {
   var params = {
       name: input.value,
       id: idToken
   };

   fetch(`/${server}`, {
         method:'POST',
         headers: { 'Content-Type': 'text/html' },
         body: JSON.stringify(params)
     }).then((response) => response.text())
       .then((worked) => {
        if (worked == 'true') {
          location.href = "/";
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
 * @param {String} showBtnId id of the tab button to be selected
 * @param {String} hideDivId id of the content to be hidden
 * @param {String} hideBtnId id of the tab button to be deselected
 */
function togglePanel_(showDivId, showBtnId, hideDivId, hideBtnId) {
  showEl_(document.getElementById(showDivId));
  hideEl_(document.getElementById(hideDivId));

  let showBtn = document.getElementById(showBtnId);
  showBtn.classList.add("show");

  let hideBtn = document.getElementById(hideBtnId);
  hideBtn.classList.remove("show");
}

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
  let currentActive = getCurrentActiveTab().computeIndicatorClientRect();
  tabRegions[0].activate(currentActive);
  tabRegions[1].deactivate();
  togglePanel_(/* showDivId= */ DETAILS_EL, /* showBtnId= */ "profile-btn", /* hideDivId= */ MAPS_WRAPPER, /* hideBtnId= */ "maps-btn");
}

/**
 * Hides the user's profile tab and shows the map tab instead
 */
function showUserMaps() {
  let currentActive = getCurrentActiveTab().computeIndicatorClientRect();
  tabRegions[0].deactivate();
  tabRegions[1].activate(currentActive);
  togglePanel_(/* showDivId= */ MAPS_WRAPPER, /* showBtnId= */ "maps-btn", /* hideDivId= */ DETAILS_EL, /* hideBtnId= */ "profile-btn");
}

/**
 * @Private
 * Creates buttons to navigate the user to the given maps
 * @param {JSON} mapsJson json array containing map ids and names
 */
function loadUserMaps_(mapsJson) {
  let rooms = document.getElementById('user-maps');
  let roomWrapper = document.getElementById(MAPS_WRAPPER);

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
  let roomBtn = makeEl("button", "roomBtn");
  roomBtn.innerHTML = name;
  roomBtn.addEventListener('click', () => {
     location.href=`/chatroom.html?roomId=${id}`;
  });
  return roomBtn;
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
