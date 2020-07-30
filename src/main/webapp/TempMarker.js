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
  tempMarker;

  constructor() {
    this.tempMarker = new google.maps.Marker(
      {
        label: "+"
      });
    this.tempMarker.setDraggable(true);
    this.setListeners();
  }

  /**
   * Creates or modifies a temparker at the given coordinates
   * @param {google.maps.LatLng} coords coordinates where to make the marker
   */
  setTempMarker(coords) {
    let marker = this.tempMarker;
    marker.setPosition(coords);
    if (!marker.getMap()) {
      marker.setMap(myMap.map);
    }
  }

  /**
   * Sets click and drag events to the marker
   */
  setListeners() {
    let _self = this;
    // clicking on a temp marker deletes it from the map
    _self.tempMarker.addListener("click", () => {
      let coords = _self.tempMarker.getPosition()
      let marker = new Marker(coords);
      myMap.addPermMarker(marker);
      _self.remove();
    });

    _self.tempMarker.addListener('dragend', () => {
      myMap.map.panTo(_self.tempMarker.getPosition());
    });
  }

  /**
   * Removes the temp marker from the map.
   */
  remove() {
    if (this.tempMarker.getMap()) {
      this.tempMarker.setMap(null)
    }
  }
}
