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

/** Creates, displays, and modifies a map's temporary marker*/
class TempMarker extends MarkerTemplate{

  /** TempInfoWindow linked to this marker */
  tempInfoWindow_;

  constructor() {
    super();
    this.googleMarker_ = new google.maps.Marker(
      {
        label: "+"
      });
    this.googleMarker_.setDraggable(true);
    this.tempInfoWindow_ = new TempInfoWindow(this);
    this.setListeners_();
  }

  /**
   * @Private
   * Sets click and drag events to the marker
   */
  setListeners_() {
    // clicking on a temp marker opens its information window
    this.googleMarker_.addListener("click", () => {
      myMap.closeInfoWindow();
      this.tempInfoWindow_.open();
    });

    this.googleMarker_.addListener('dragend', () => {
      myMap.panTo(this.googleMarker_.getPosition());
    });
  }

  /**
   * Sends the marker given marker details to the map to update a PermMarker
   * @param {String} title new title of the marker
   * @param {String} body new body of the marker
   */
  sendPermMarkerInfo(title, body) {
    myMap.setPermMarkerInfo(this.getPosition(), title, body);
  }

  /** Hides this temporary marker and info window from the map */
  hide() {
    super.hide();
    this.googleMarker_.setPosition(null);
    this.tempInfoWindow_.close();
  }

  /** Opens the temporary information window for this temporary marker */
  openTempInfoWindow() {
    this.tempInfoWindow_.open();
  }

  /** Closes the temporary information window for this temporary marker */
  closeTempInfoWindow() {
    this.tempInfoWindow_.close();
  }

  /** Changes this marker's coords and prevents the info window from opening */
  setPosition(coords) {
    super.setPosition(coords);
    this.closeTempInfoWindow();
  }
}
