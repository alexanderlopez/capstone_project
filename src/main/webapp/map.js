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

/** The google.maps.Map that will be displayed on the page. */
let map;

/**
 * Creates a new map.
 */
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
 * Adds a temporary marker to the map whenever it is clicked on
 */
function setMapEvents() {
  map.addListener('click', function(e) {
    var coords = e.latLng;
    if (tempMarker) {
      tempMarker.setPosition(coords);
    } else {
      makeTempMarker(coords);
    }
    this.panTo(coords);
  });
}

/**
 * Stores the most recently added marker to the map which has not
 * been uploaded to the server yet.
 */
var tempMarker = null;

/**
 * Creates a new temp marker at the given coordinates with click and drag events
 * @param {google.maps.LatLng} coords coordinates where to make the marker
 */
function makeTempMarker(coords) {
  tempMarker = new google.maps.Marker(
    {
      position: coords,
      map: map,
      label: "+"
    });
  tempMarker.setDraggable(true);

  // clicking on a temp marker deletes it from the map
  tempMarker.addListener("click", () => {
    makePermMarker(tempMarker.getPosition());
    deleteTempMarker();
  });
  tempMarker.addListener('dragend', () => {
    map.panTo(tempMarker.getPosition());
  });
}

/** all permanent markers on the page */
var permMarkers = new Set();

/**
 * Creates a permanent marker at the given coordinates
 * @param {google.maps.Marker} marker marker to be made permanent
 */
function makePermMarker(coords) {
  let marker = new google.maps.Marker(
    {
      position: coords,
      map: map
    });

  marker.addListener('click', () => {
    deletePermMarker(marker);
    deleteTempMarker();
  });

  permMarkers.add(marker);
}

/**
 * Removes the temp marker from the map.
 */
function deleteTempMarker() {
  if (tempMarker) {
    tempMarker.setMap(null);
    tempMarker = null;
  }
}

/**
 * Deletes a given permanent marker
 * @param {google.maps.Marker} marker to be deleted
 */
function deletePermMarker(marker) {
  permMarkers.delete(marker);
  marker.setMap(null);
}
