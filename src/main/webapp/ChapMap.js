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

class ChapMap {
  /** The google.maps.Map that will be displayed on the page. */
  googleMap;

  /** The temporary marker visible on this map */
  tempMarker;

  /** The info window used for all markers*/
  myInfoWindow;

  /** all permanent markers on the page */
  permMarkers;

  /**
   * Adds a temporary marker to the map whenever it is clicked on
   */
  setMapEvents() {
    this.googleMap.addListener('click', (e) => {
      var coords = e.latLng;
      this.myInfoWindow.close();
      this.tempMarker.setTempMarker(coords);
      this.googleMap.panTo(coords);
    });
  }

  constructor() {
    this.googleMap = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
      });
    this.permMarkers = new Set();
    this.tempMarker = new TempMarker();
    this.myInfoWindow = new MarkerInfoWindow();
    this.setMapEvents();
  }

  /**
   * @param {PermMarker} marker permanent marker to be deleted
   */
  deletePermMarker(myMarker) {
    this.myInfoWindow.close();
    myMarker.remove();
    this.permMarkers.delete(myMarker);
  }

  /**
   * @param {PermMarker} marker permanent marker to be deleted
   */
  addPermMarker(myMarker) {
    this.permMarkers.add(myMarker);
  }

  /**
   *  Removes the  temporary marker from the map
   */
  removeTempMarker() {
    this.tempMarker.remove();
  }

  /** Opens the map's information window at the given marker*/
  openInfoWindow(myMarker) {
    this.myInfoWindow.open(myMarker);
  }
}
