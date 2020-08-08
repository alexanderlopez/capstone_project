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

/**
 * Loads available chat rooms to the user
  */
function loadChatRooms() { 

  // TODO(astepin): Access user's chat rooms dynamically by fetching from server
  var a = document.createElement('a');
  var linkText = document.createTextNode("Chat Room");
  a.appendChild(linkText);
  a.title = "Chat Room Link";
  a.href = "/chatroom.html?roomId=1234goroom";
  document.body.appendChild(a); 
}
