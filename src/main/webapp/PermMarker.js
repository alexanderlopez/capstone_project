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

class PermMarker {

  /** The google.maps.Marker object visible on the map*/
  googleMarker;

  /** Displayed title of this marker */
  title;

  /** Displayed description of this marker */
  body;

  /** This marker is being edited*/
  editing;

  /**
   * @param {google.maps.LatLng} coords the coordinates for the marker
   */
  constructor(coords) {
    this.googleMarker = new google.maps.Marker(
      {
        position: coords,
        map: myMap.googleMap
      });
    this.editing = true;
    this.setMarkerListeners();
    myMap.openInfoWindow(this);
  }

  /**
   * Sets marker-triggered events
   */
  setMarkerListeners() {
    this.googleMarker.addListener('click', () => {
      myMap.openInfoWindow(this);
    });
  }

  /**
   * Removes the marker from the map
   */
  remove() {
    this.googleMarker.setMap(null);
  }

  /** Returns whether this marker already has infowindow content*/
  isEditing() {
    return (!this.title && !this.body) || this.editing;
  }

  /**
   * Sets the title and body of this marker to the given values
   * @param {String} title the title of this marker
   * @param {String} body the body of this marker
   */
  setContent(title, body) {
    this.title = title;
    this.body = body;
  }
}
