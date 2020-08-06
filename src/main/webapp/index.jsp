<!DOCTYPE html>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ page import="com.google.sps.HelloAppEngine" %>

<!-- [START_EXCLUDE] -->

<!-- [END_EXCLUDE] -->

<html>
    <head>
       <script src="chat.js"></script>
        <script src="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.js"></script>
        <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />

        <!-- The core Firebase JS SDK is always required and must be listed first -->
        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js"></script> 

        <!-- TODO: Add SDKs for Firebase products that you want to use
            https://firebase.google.com/docs/web/setup#available-libraries -->

        <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-auth.js"></script>

        <script src="authentication.js"></script>

        <link href='//fonts.googleapis.com/css?family=Marmelad' rel='stylesheet' type='text/css'>
        <title>Hello App Engine Flexible</title>

    </head>
    <body onload="loadChatHistory(); getServerUrl()">
        

        <ul id="past-comments"></ul>

        <ul id="chat"></ul>

        <form>
            <textarea rows="8" cols="80" id="message"></textarea>
            <br>
            <button type="submit">Send</button>
        </form>

        <h1>Hello App Engine -- Flexible!!!</h1>

        <p>This is <%= HelloAppEngine.getInfo() %>.</p>
        <table>
            <tr>
                <td colspan="2" style="font-weight:bold;">Available Servlets:</td>
            </tr>
            <tr>
                <td><a href='chatroom.html'>The servlet</a></td>
            </tr>
        </table>
        <div id="firebaseui-auth-container"></div>
        
        <div id="loader">Loading...</div>

        <button id="send-auth" onclick="sendAuth()">SendAuth</button>
        <button id="sign-out" onclick="logOut()">Sign Out</button>

    </body>
</html>


