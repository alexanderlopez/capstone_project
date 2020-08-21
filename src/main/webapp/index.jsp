<!DOCTYPE html>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<html>
    <head>
        <script src="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.js"></script>
        <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />

        <!-- The core Firebase JS SDK is always required and must be listed first -->
        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js"></script>

        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-auth.js"></script>

        <link href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css" rel="stylesheet">
        <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>

        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

        <script src="welcome.js"></script>

        <link href='//fonts.googleapis.com/css?family=Marmelad' rel='stylesheet' type='text/css'>
        <link rel='stylesheet' type='text/css' href='welcomeStyle.css'>
        <title>CHAP</title>

    </head>
    <body>
        <div id="panel">
          <div id="nav">
            <button onclick="showUserDetails()" class="mdc-tab mdc-tab--active" role="tab" aria-selected="true">
              <span class="mdc-tab__content">
                <span class="mdc-tab__icon material-icons" aria-hidden="true">person</span>
                <span class="mdc-tab__text-label">Profile</span>
              </span>
              <span class="mdc-tab-indicator mdc-tab-indicator--active">
                <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
              </span>
              <span class="mdc-tab__ripple"></span>
            </button>
            <button onclick="showUserMaps()" class="mdc-tab" role="tab" aria-selected="false" tabindex="-1">
              <span class="mdc-tab__content">
                <span class="mdc-tab__icon material-icons" aria-hidden="true">map</span>
                <span class="mdc-tab__text-label">Maps</span>
              </span>
              <span class="mdc-tab-indicator">
                <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
              </span>
              <span class="mdc-tab__ripple"></span>
            </button>
          </div>

          <div id="maps-wrapper" class="panel-content">
            <h2 id="my-maps" class="panel-header">My Maps</h2>
            <input type="button" id="add-map" class="panel-icon" onclick="showMapForm()">
            <input type="submit" id="submit-map" class="panel-icon" onclick="submitMap()" value="">
            <div id="user-maps">
              <button id="map-form-wrapper" class="roomBtn">
                <textarea id="new-map-form" placeholder="Name..."></textarea>
              </button>
            </div>
          </div>

          <div id="user-details" class="panel-content">
            <h2 id="profile" class="panel-header">Profile</h2>
            <input type="button" id="edit-details" class="panel-icon" onclick="enableUsernameForm()" value="">
            <input type="submit" id="save-details" class="panel-icon" onclick="submitUsername()" value="">

            <label class="mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon">
              <i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading" tabindex="0" role="button">mail</i>
              <input type="text" class="mdc-text-field__input" aria-labelledby="my-label-id">
              <span class="mdc-notched-outline">
                <span class="mdc-notched-outline__leading"></span>
                <span class="mdc-notched-outline__notch" style="font-size: 1rem;">
                <span class="mdc-floating-label" id="my-label-id">Email</span>
                </span>
                <span class="mdc-notched-outline__trailing"></span>
              </span>
            </label>

            <p></p>

            <label class="mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon">
              <i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading" tabindex="0" role="button">person</i>
              <input type="text" class="mdc-text-field__input" aria-labelledby="my-label-id">
              <span class="mdc-notched-outline">
                <span class="mdc-notched-outline__leading"></span>
                <span class="mdc-notched-outline__notch" style="font-size: 1rem;">
                <span class="mdc-floating-label" id="my-label-id">Username</span>
                </span>
                <span class="mdc-notched-outline__trailing"></span>
              </span>
            </label>

            

          </div>
        </div>

        <div id="header">
          <h1>CHAP</h1>
          <h4 id="welcome-message"></h4>
        </div>

        <div id="loading">Loading...</div>
        <div id="firebaseui-auth-container"></div>

        <!--<button id="sign-out" onclick="logOut()">Sign Out
      </button>-->
      <button id="sign-out" onclick="logOut()" class="mdc-button">
        <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">Sign Out</span>
      </button>
    </body>
</html>
