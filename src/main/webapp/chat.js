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
 * Loads chat history and adds it to the index page
  */
function loadChatHistory() {
  // TODO(astepin): Fetch from history URL when it is created

  let quote = "Test quote"
  document.getElementById('past-comments').innerText = quote;
}

let chatOpen = false;

function toggleChat() {
  if (chatOpen) {
    closeChat();
  } else {
    openChat();
  }
}

function openChat() {
  document.getElementById("myForm").classList.add("chatOpen");
  document.getElementById("map").classList.remove("expanded");
  chatOpen =  true;
}

function closeChat() {
  document.getElementById("myForm").classList.remove("chatOpen");
  document.getElementById("map").classList.add("expanded");
  chatOpen = false;
}
