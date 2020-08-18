
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
const MAP_FORM = 'new-map-form';
const USERNAME_FORM = 'username-form';
const SIGNOUT_BTN ='sign-out';
const PROFILE_SAVE_BTN = 'save-details';
const PROFILE_EDIT_BTN = 'edit-details';
const MAP_SUBMIT_BTN = 'submit-map';
const MAP_ADD_BTN = 'add-map';
const PANEL = "panel";

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
  document.getElementById(LOADING_EL).style.display = 'none';
  document.getElementById("header").classList.add("logged-in");
  showEl_(document.getElementById(PANEL));
  let isNewUser = Object.keys(userJson).length === 0;

  loadUserDetails_(email, userJson.name);

  if (isNewUser) {
    setWelcomeMessage_();
    disableMapCreating_();
    showUsernameForm();
  } else {
    setWelcomeMessage_(userJson.name);
    loadUserMaps_(userJson.rooms);
  }

  showEl_(document.getElementById(SIGNOUT_BTN));
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
function showUsernameForm() {
  let usernameForm = document.getElementById(USERNAME_FORM);
  let usernameGroup = usernameForm.parentNode;
  let prevUsername = usernameGroup
      .getElementsByClassName("groupContent")[0];

  hideEl_(document.getElementById(PROFILE_EDIT_BTN));
  showEl_(document.getElementById(PROFILE_SAVE_BTN));

  hideEl_(prevUsername);
  usernameForm.innerHTML = prevUsername.innerHTML;
  showEl_(usernameForm);
}

/**
 * @Private
 * Displays the form where users can create a new map and hides the
 * username form if it is visible
 */
function showMapForm() {
  showEl_(document.getElementById("map-form-wrapper"));
  hideEl_(document.getElementById(MAP_ADD_BTN));
  showEl_(document.getElementById(MAP_SUBMIT_BTN));
}

/**
 * Sends the submitted map name to the server
 */
function submitMap() {
  let input = document.getElementById(MAP_FORM);
  submitNewItem("room-server", input);
}

/**
 * Sends the submitted username to the server
 */
function submitUsername() {
  let input = document.getElementById(USERNAME_FORM);
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
  var emailBlock = makeDetailsGroup_("email", email, /* editable= */ false);

  if (username) {
    var usernameBlock = makeDetailsGroup_("username", username, true);
  } else {
    var usernameBlock = makeDetailsGroup_("username", "", true);
  }

  let displayDiv = document.getElementById(DETAILS_EL);
  displayDiv.appendChild(emailBlock);
  displayDiv.appendChild(usernameBlock);
  showEl_(displayDiv);
}

function showUserDetails() {
  showEl_(document.getElementById(DETAILS_EL));
  hideEl_(document.getElementById(MAPS_WRAPPER));

  let profileBtn = document.getElementById("profile-btn");
  let mapsBtn = document.getElementById("maps-btn");

  profileBtn.classList.add("show");
  mapsBtn.classList.remove("show");
}

function showUserMaps() {
  showEl_(document.getElementById(MAPS_WRAPPER));
  hideEl_(document.getElementById(DETAILS_EL));

  let profileBtn = document.getElementById("profile-btn");
  let mapsBtn = document.getElementById("maps-btn");

  profileBtn.classList.remove("show");
  mapsBtn.classList.add("show");
}

/**
 * @Private
 * Returns div containing a piece of user information determined by
 * the group name and value
 * @param {String} name the name of this group of information
 * @param {String} val the value of the group of information
 */
function makeDetailsGroup_(name, val, editable) {
  let wrapper = makeEl("div", "detailsGroup", name);

  let label = makeEl("h4", "groupLabel");
  label.innerHTML = name;

  let content = makeEl("p", "groupContent");
  content.innerHTML = val;

  wrapper.appendChild(label);
  wrapper.appendChild(content);

  if (editable) {
    let editForm = makeEl("textarea", /* class= */ null, USERNAME_FORM);
    editForm.style.display = 'none';
    editForm.placeholder = "Username...";
    wrapper.appendChild(editForm);
  }

  return wrapper;
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
  toHide.forEach((id) => document.getElementById(id).style.display = 'none');

  document.getElementById("header").classList.remove("logged-in");

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
