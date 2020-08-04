// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function loadDoc() {
  var xhttp = new XMLHttpRequest();
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  const url = "https://chap-2020-capstone.appspot.com/";
  xhttp.onload = function() {
      alert("ready state: "+ this.readyState + " status is: " + this.status);
    if (this.readyState == 4 && this.status == 200) {
        alert("aaaabbb");
      document.getElementById("demo").innerHTML =
      this.responseText;
    }
  };
  xhttp.open("GET", url ,false);
    xhttp.setRequestHeader('Cache-Control', 'no-cache');
  alert("hello world");
  xhttp.send(null);
  alert("xxx");
}


//var connection = new WebSocket('https://chap-2020-capstone.appspot.com/');
var connection = new WebSocket(getServerlUrl());

connection.onopen = () => {
  console.log('connected');
};

connection.onclose = () => {
  console.error('disconnected');
};

connection.onerror = (error) => {
  console.error('failed to connect', error);
};

connection.onmessage = (event) => {
  console.log('received', event.data);
  let li = document.createElement('li');
  li.innerText = event.data;
  document.querySelector('#chat').append(li);
};

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  let message = document.querySelector('#message').value;
  connection.send(message);
  document.querySelector('#message').value = '';
});



function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}



function getServerUrl() {
    
    var defaultChatRoomID = "1234goroom";

    if (location.protocol !== 'https:' && location.hostname != 'localhost:8080') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
    return location.protocol + "://" + location.hostname + "/chat/" + defaultChatRoomID + "?idToken=" +tokenID;
}
