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

class Marker {

  /** The google.maps.Marker object visible on the map*/
  marker;

  constructor(coords) {
    this.marker = new google.maps.Marker(
      {
        position: coords,
        map: myMap.map
      });
    this.setMarkerListeners();
  }

  /**
   * Sets marker-triggered events
   */
  setMarkerListeners() {
    let _self = this;
    _self.marker.addListener('click', () => {
      _self.remove();
      myMap.removeTempMarker();
    });
  }

  /**
   * Removes the marker from the map
   */
  remove() {
    myMap.deletePermMarker(this);
    this.marker.setMap(null);
  }
}
