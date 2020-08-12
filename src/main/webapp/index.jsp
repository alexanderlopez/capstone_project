<!DOCTYPE html>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<html>
    <head>
        <script src="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.js"></script>
        <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />

        <!-- The core Firebase JS SDK is always required and must be listed first -->
        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js"></script>

        <!-- TODO: Add SDKs for Firebase products that you want to use
            https://firebase.google.com/docs/web/setup#available-libraries -->

        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-auth.js"></script>

        <script src="welcome.js"></script>

        <link href='//fonts.googleapis.com/css?family=Marmelad' rel='stylesheet' type='text/css'>
        <link rel='stylesheet' type='text/css' href='welcomeStyle.css'>
        <title>CHAP</title>

    </head>
    <body>
        <div id="header">
          <h1>CHAP</h1>
          <h4 id="welcome-message"></h4>
        </div>
        <div id="pageContent">
          <div id="loading">Loading...</div>
          
          <div id="user-details" class="panel">
            <h2 id="profile" class="panel-header">Profile</h2>
          </div>

          <div id="firebaseui-auth-container"></div>

          <div id="username-form" class="panel form">
            <label for="input-username" class="panel-header">My Username:
              </label>
            <textarea id="input-username" placeholder="Enter name..."></textarea>
            <input type="button" value="Submit" onclick="submitUsername()">
          </div>

          <div id="new-map-form" class="panel form">
            <label for="map-name" class="panel-header">New Map:</label>
            <textarea id="map-name" placeholder="Enter name..."></textarea>
            <input type="button" value="Submit" onclick="submitMap()">
          </div>

          <div id="maps-wrapper" class="panel">
            <h2 id="my-maps" class="panel-header">My Maps</h2>
            <div id="user-maps"></div>
          </div>
        </div>

        <button id="sign-out" onclick="logOut()">Sign Out
            </button>
    </body>
</html>
