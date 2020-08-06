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

  /** state determining whether the client can add markers or not */
  addingMarkers_;

  /**
   * @Private
   * Adds a click listener allowing clients to add markers to the map
   */
  addMapClickListener_() {
    this.googleMap_.addListener('click', (e) => {
      if (this.addingMarkers_) {
        var coords = e.latLng;
        this.myInfoWindow_.close();
        this.tempMarker_.setTempMarker(coords);
        this.googleMap_.panTo(coords);
      }
    });
  }

  /**
   * @Private
   * Returns a button that will prevent clients from adding markers
   */
  makeViewBtn_() {
    let viewBtnWrapper = document.createElement("div");
    viewBtnWrapper.id = "viewBtnWrapper";
    viewBtnWrapper.classList.add("btnWrapper");
    viewBtnWrapper.classList.add("selected");

    let viewBtn = document.createElement("button");
    viewBtn.id = "viewBtn";
    viewBtn.classList.add("btnIcon");

    viewBtnWrapper.appendChild(viewBtn);

    return viewBtnWrapper;
  }

  /**
   * @Private
   * Returns a button that will be used to allow clients to add markers
   */
  makeAddMarkerBtn_() {
    let addMarkerBtnWrapper = document.createElement("div");
    addMarkerBtnWrapper.id = "addMarkerBtnWrapper";
    addMarkerBtnWrapper.classList.add("btnWrapper");

    let addMarkerBtn = document.createElement("button");
    addMarkerBtn.id = "addMarkerBtn";
    addMarkerBtn.classList.add("btnIcon");

    addMarkerBtnWrapper.appendChild(addMarkerBtn);

    return addMarkerBtnWrapper;
  }

  /**
   * @Private
   * Adds click listeners to the map customization buttons.
   * A client can only add markers when the "adding markers" mode is on
   */
  addBtnListeners_(viewBtn, addMarkerBtn) {
    let SELECTED_CLASS = "selected";

    addMarkerBtn.addEventListener('click', () => {
      if (!this.addingMarkers_) {
        this.addingMarkers_ = true;
        viewBtn.classList.remove(SELECTED_CLASS);
        addMarkerBtn.classList.add(SELECTED_CLASS);
        this.removeTempMarker();
      }
    });

    viewBtn.addEventListener('click', () => {
      if (this.addingMarkers_) {
        this.addingMarkers_ = false;
        viewBtn.classList.add(SELECTED_CLASS);
        addMarkerBtn.classList.remove(SELECTED_CLASS);
        this.removeTempMarker();
      }
    });
  }

  /**
   * @Private
   * Creates map customization buttons and adds them to the map
   */
  makeMapEditButtons_() {
    let map = document.getElementById("map");
    let viewBtn = this.makeViewBtn_();
    let addMarkerBtn = this.makeAddMarkerBtn_();

    this.addBtnListeners_(viewBtn, addMarkerBtn);

    map.appendChild(viewBtn);
    map.appendChild(addMarkerBtn);

    this.addingMarkers_ = false;
  }

  constructor() {
    this.googleMap_ = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
      });

    this.makeMapEditButtons_();
    this.addMapClickListener_();

    this.myInfoWindow_ = new MarkerInfoWindow();
    this.permMarkers_ = new Set();
    this.tempMarker_ = new TempMarker()
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
