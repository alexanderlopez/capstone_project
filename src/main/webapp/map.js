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

let map;

function initMap() {
  loadMap();
  setMapEvents();
}

/**
 * Initalized Map object and centers to default coordinates
 */
function loadMap() {
  map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8
    });
}

/**
 * Create a temporary and moveable marker whenever the client clicks on the map
 */
function setMapEvents() {
  map.addListener('click', function(e) {
    var coords = e.latLng;
    makeTempMarker(coords);
  })
}

/**
 * Stores the most recently added marker to the map which has not
 * been uploaded to the server yet.
 */
var tempMarker = null;

/**
 * Adds a marker to the map where clicked and removes the previous tempMarker
 * when applicable
 */
function makeTempMarker(latLng) {
  if (tempMarker) {
    tempMarker.setMap(null);
  }

  tempMarker = new google.maps.Marker({position: latLng, map:map});
  tempMarker.setDraggable(true);

  // clicking on a temp marker deletes it from the map
  tempMarker.addListener("click", () => {
    tempMarker.setMap(null);
  });

  tempMarker.addListener('dragend', () => {
    map.panTo(tempMarker.getPosition());
  });
  map.panTo(latLng);
}
