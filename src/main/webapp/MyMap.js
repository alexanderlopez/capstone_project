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

class MyMap {
  /** The google.maps.Map that will be displayed on the page. */
  googleMap;

  /** The temporary marker visible on this map */
  tempMarker;

  /** all permanent markers on the page */
  permMarkers = new Set();

  /**
   * Adds a temporary marker to the map whenever it is clicked on
   */
  setMapEvents() {
    let _self = this;
    this.googleMap.addListener('click', function(e) {
      var coords = e.latLng;
      _self.tempMarker.setTempMarker(coords);
      this.panTo(coords);
    });
  }

  constructor() {
    this.googleMap = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
      });
    this.tempMarker = new TempMarker();
    this.setMapEvents();
  }

  /**
   * @param {MyMarker} marker permanent marker to be deleted
   */
  deletePermMarker(marker) {
    this.permMarkers.delete(marker);
  }

  /**
   * @param {MyMarker} marker permanent marker to be deleted
   */
  addPermMarker(marker) {
    this.permMarkers.add(marker);
  }

  /**
   *  Removes the  temporary marker from the map
   */
  removeTempMarker() {
    this.tempMarker.remove();
  }
}
