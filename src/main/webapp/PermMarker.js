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

class PermMarker extends MarkerTemplate{

  /** Displayed title of this marker */
  title_;

  /** Displayed description of this marker */
  body_;

  /**
   * @param {google.maps.LatLng} coords the coordinates for the marker
   */
  constructor(coords) {
    super();
    this.googleMarker_ = new google.maps.Marker(
      {
        position: coords,
        map: myMap.getGoogleMap()
      });
    this.setMarkerListeners_();
  }

  /** Opens the information window for this marker */
  openInfoWindow() {
    myMap.openInfoWindow(this);
  }

  /**
   * Sets the title this marker to the given value
   * @param {String} title the title of this marker
   */
  setTitle(title) {
    this.title_ = title;
  }

  /** Returns the title describing this marker */
  getTitle() {
    return this.title_;
  }

  /**
   * Sets the body property of this marker to the given value
   * @param {String} body the body of this marker
   */
  setBody(body) {
    this.body_ = body;
  }

  /** Returns the body describing this marker */
  getBody() {
    return this.body_;
  }
}
