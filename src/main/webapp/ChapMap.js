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
  googleMap_;

  /** The temporary marker visible on this map */
  tempMarker_;

  /** The info window used for all markers*/
  myInfoWindow_;

  /** all permanent markers on the page */
  permMarkers_;

  /**
   * @Private
   * Adds a temporary marker to the map whenever it is clicked on
   */
  setMapEvents_() {
    this.googleMap_.addListener('click', (e) => {
      var coords = e.latLng;
      this.myInfoWindow_.close();
      this.tempMarker_.setTempMarker(coords);
      this.googleMap_.panTo(coords);
    });
  }

  constructor() {
    this.googleMap_ = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
      });

    this.myInfoWindow_ = new MarkerInfoWindow();
    this.permMarkers_ = new Set();
    this.tempMarker_ = new TempMarker();

    this.setMapEvents_();
  }

  /**
   * Pans the map to the given coordinates
   * @param {google.map.LatLng} coords where to pan the map to
   */
  panTo(coords) {
    this.googleMap_.panTo(coords);
  }

  /**
   * @param {PermMarker} myMarker permanent marker to be deleted
   */
  deletePermMarker(myMarker) {
    this.myInfoWindow_.close();
    myMarker.remove();
    this.permMarkers_.delete(myMarker);
  }

  /**
   * Adds the given marker to the list of permanent markers on the map
   * @param {PermMarker} myMarker permanent marker to be deleted
   */
  addPermMarker(myMarker) {
    this.permMarkers_.add(myMarker);
  }

  /** Removes the  temporary marker from the map */
  removeTempMarker() {
    this.tempMarker_.remove();
  }

  /**
   * Opens the map's information window at the given marker
   * @param {PermMarker} myMarker permanent marker whose content should be
   * visible
   */
  openInfoWindow(myMarker) {
    this.myInfoWindow_.open(myMarker);
  }

  /** Returns the google.maps.Map visible on the page */
  getGoogleMap() {
    return this.googleMap_;
  }
}
