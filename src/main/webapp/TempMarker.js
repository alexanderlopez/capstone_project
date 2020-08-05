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
class TempMarker {

  /** google.maps.Marker object acting as the temporary marker */
  googleTempMarker_;

  constructor() {
    this.googleTempMarker_ = new google.maps.Marker(
      {
        label: "+"
      });
    this.googleTempMarker_.setDraggable(true);
    this.setListeners_();
  }

  /**
   * Creates or modifies a temparker at the given coordinates
   * @param {google.maps.LatLng} coords coordinates where to make the marker
   */
  setTempMarker(coords) {
    let marker = this.googleTempMarker_;
    marker.setPosition(coords);
    if (!marker.getMap()) {
      marker.setMap(myMap.getGoogleMap());
    }
  }

  /**
   * @Private
   * Sets click and drag events to the marker
   */
  setListeners_() {
    // clicking on a temp marker deletes it from the map
    this.googleTempMarker_.addListener("click", () => {
      let coords = this.googleTempMarker_.getPosition()
      let marker = new PermMarker(coords);
      myMap.addPermMarker(marker);
      this.remove_();
    });

    this.googleTempMarker_.addListener('dragend', () => {
      myMap.panTo(this.googleTempMarker_.getPosition());
    });
  }

  /**
   * @Private
   * Removes the temp marker from the map.
   */
  remove_() {
    if (this.googleTempMarker_.getMap()) {
      this.googleTempMarker_.setMap(null)
    }
  }
}
