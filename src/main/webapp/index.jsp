<!DOCTYPE html>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ page import="com.google.sps.HelloAppEngine" %>

<html>
    <head>
        <script src="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.js"></script>
        <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />

        <!-- The core Firebase JS SDK is always required and must be listed first -->
        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js"></script>

        <!-- TODO: Add SDKs for Firebase products that you want to use
            https://firebase.google.com/docs/web/setup#available-libraries -->

        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-auth.js"></script>

        <script src="authentication.js"></script>

        <link href='//fonts.googleapis.com/css?family=Marmelad' rel='stylesheet' type='text/css'>
        <link rel='stylesheet' type='text/css' href='welcomeStyle.css'>
        <title>CHAP</title>

    </head>
    <body>
        <div id="header">
          <h1>CHAP</h1>
        </div>
        <div id="pageContent">
          <div id="firebaseui-auth-container"></div>

          <input type="submit" value="My Map" onclick="location='/chatroom.html?roomId=1'" id="myMaps" class="myBtn">

          <button id="sign-out" onclick="logOut()" class="myBtn">Sign Out</button>
        </div>
    </body>
</html>
