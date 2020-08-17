
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
const MIDDLE_PANEL = 'middle-panel';

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

  let isNewUser = Object.keys(userJson).length === 0;

  if (isNewUser) {
    setWelcomeMessage_();
    showUserMaps_({});
    showEl_(document.getElementById(USERNAME_FORM));
  } else {
    setWelcomeMessage_(userJson.name);
    showUserMaps_(userJson.rooms);
  }

  showUserDetails_(email, userJson.name);
  showEl_(document.getElementById(MIDDLE_PANEL));
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

function hideForm(formChild) {
  hideEl_(formChild.parentNode);
}

function showUsernameForm() {
  showEl_(document.getElementById(USERNAME_FORM));
}

function showMapForm() {
  showEl_(document.getElementById(MAP_FORM));
}

/**
 * Sends the submitted map name to the server
 */
function submitMap() {
  let input = document.getElementById("map-name");
  hideForm(input);
  submitNewItem_("room-server", input);
}

/**
 * Sends the submitted username to the server
 */
function submitUsername() {
  let input = document.getElementById("input-username");
  hideForm(input);
  submitNewItem_("user-server", input);
}

/**
 * @Private
 * Retrieves input value, sends to the given server, and handles server response
 */
 function submitNewItem_(server, input) {
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
function showUserDetails_(email, username) {
  var emailBlock = makeDetailsGroup_("email", email);

  if (username) {
    var usernameBlock = makeDetailsGroup_("username", username);
  } else {
    var usernameBlock = makeDetailsGroup_("username", "");
  }

  let displayDiv = document.getElementById(DETAILS_EL);
  displayDiv.appendChild(emailBlock);
  displayDiv.appendChild(usernameBlock);
  showEl_(displayDiv);
}

/**
 * @Private
 * Returns div containing a piece of user information determined by
 * the group name and value
 * @param {String} name the name of this group of information
 * @param {String} val the value of the group of information
 */
function makeDetailsGroup_(name, val) {
  let wrapper = document.createElement("div");
  wrapper.id = name;
  wrapper.classList.add("detailsGroup");

  let label = document.createElement("h4");
  label.classList.add("groupLabel");
  label.innerHTML = name;

  let content = document.createElement("p");
  content.classList.add("groupContent");
  content.innerHTML = val;

  wrapper.appendChild(label);
  wrapper.appendChild(content);
  return wrapper;
}

/**
 * @Private
 * Creates buttons to navigate the user to the given maps
 * @param {JSON} mapsJson json array containing map ids and names
 */
function showUserMaps_(mapsJson) {
  let rooms = document.getElementById('user-maps');
  let roomWrapper = document.getElementById(MAPS_WRAPPER);
  showEl_(roomWrapper);

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
  let roomBtn = document.createElement("button");
  roomBtn.innerHTML = name;
  roomBtn.addEventListener('click', () => {
     location.href=`/chatroom.html?roomId=${id}`;
  });
  roomBtn.classList.add("roomBtn");
  return roomBtn;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// LOGIN/LOGOUT

/**
 * @Private
 * Hides all page content and initializes firebase login buttons
 */
function displayLoginInfo_() {
  let toHide = [LOADING_EL, MAPS_WRAPPER, DETAILS_EL, MAP_FORM, USERNAME_FORM,
                WELCOME_EL];
  toHide.forEach((id) => document.getElementById(id).style.display = 'none');

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
