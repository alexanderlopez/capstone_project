
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
            document.getElementById('loader').style.display = 'none';
            document.getElementById('sign-out').style.display = 'none';
        }
    },
    signInFlow: 'popup',
    signInSuccessUrl: '/'
};

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('firebaseui-auth-container').innerText = '';
        document.getElementById('loader').style.display = 'none';
        document.getElementById('myMaps').style.display = 'block';
        document.getElementById('sign-out').style.display = 'block';
    } else {
        document.getElementById('firebaseui-auth-container').innerText = '';
        document.getElementById('myMaps').style.display = 'none';
        document.getElementById('loader').style.display = 'block';
        ui.start('#firebaseui-auth-container', uiConfig);
    }
});

function logOut() {
    firebase.auth().signOut();
}

function sendAuth() {
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
        // Send token to your backend via HTTPS
        fetch('/authentication', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/html'
            },
            body: idToken
        }).then(response => response.text()).then(responseText => {
            console.log(responseText);
        });
    }).catch(function(error) {
        // Handle error
        console.log(error);
    });
}
