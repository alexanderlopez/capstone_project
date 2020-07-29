<!DOCTYPE html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.sps.HelloAppEngine" %>
<!-- [START_EXCLUDE] -->
<!-- [END_EXCLUDE] -->
<html>
    <head>
        <script src="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.js"></script>
        <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />
        <link href='//fonts.googleapis.com/css?family=Marmelad' rel='stylesheet' type='text/css'>
        <title>Hello App Engine Flexible</title>
    </head>
    <body>
        <h1>Hello App Engine -- Flexible!</h1>

        <p>This is <%= HelloAppEngine.getInfo() %>.</p>
        <table>
            <tr>
                <td colspan="2" style="font-weight:bold;">Available Servlets:</td>
            </tr>
            <tr>
                <td><a href='/hello'>The servlet</a></td>
            </tr>
        </table>

        <div id="firebaseui-auth-container"></div>
        <div id="loader">Loading...</div>

        <!-- The core Firebase JS SDK is always required and must be listed first -->
        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js"></script>

        <!-- TODO: Add SDKs for Firebase products that you want to use
             https://firebase.google.com/docs/web/setup#available-libraries -->
        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-auth.js"></script>

        <script>
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
        </script>

        <script>
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
                    }
                },
                signInFlow: 'popup',
                signInSuccessUrl: '/'
            };

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    document.getElementById('firebaseui-auth-container').innerText = 'Hello User!';
                    document.getElementById('loader').style.display = 'none';
                } else {
                    ui.start('#firebaseui-auth-container', uiConfig);
                }
            });
        </script>
    </body>
</html>
