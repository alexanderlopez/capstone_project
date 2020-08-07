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

/** Creates a Google Map where clients can add/edit/removes custom markers */
class ChapMap {

  static SELECTED_CLASS = "selected";

  /** The google.maps.Map that will be displayed on the page. */
  googleMap_;

  /** The temporary marker visible on this map */
  tempMarker_;

  /** PermMarker currently being edited */
  editedPermMarker_;

  /** State determining whether the client can add markers or not */
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
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// PERM MARKER HANDLERS

  /**
   * Turns the permanent marker to a temporary marker with the same
   * details and prevents the client from creating a new temporary marker
   * @param {PermMarker} permMarker permanent marker to be edited
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
   * Updates the edited marker or create a new marker with the given information
   * @param {google.maps.LatLng} coords where to place the marker
   * @param {String} title the title of the marker
   * @param {String} body the body of the marker description
   */
  setPermMarkerInfo(coords, title, body) {
    this.removeTempMarker();
    let permMarker = this.editedPermMarker_;

    if (permMarker) {
      permMarker.setPosition(coords);
    } else {
      permMarker = new PermMarker(coords);
    }

    if (title) {
      permMarker.setTitle(title);
    }
    if (body) {
      permMarker.setBody(body);
    }

    permMarker.openInfoWindow();
    this.editedPermMarker_ = null;
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// TEMP MARKER HANDLERS

  /**
   * Makes the temporary marker visible at the given coordinates
   * @param {google.maps.LatLng} coords coordinates where to show the marker
   */
  setTempMarker(coords) {
    this.closePermInfoWindow();
    this.tempMarker_.setPosition(coords);
    this.googleMap_.panTo(coords);
  }

  /** Removes the  temporary marker from the map */
  removeTempMarker() {
    this.tempMarker_.hide();
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// INFO WINDOW HANDLERS

  /** Closes the map's information window */
  closePermInfoWindow() {
    PermMarker.permInfoWindow.close();
  }

  /** Closes the map's temporary window */
  closeTempInfoWindow() {
    this.tempMarker_.closeInfoWindow();
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// OTHER

  /** Returns the google.maps.Map visible on the page */
  getGoogleMap() {
    return this.googleMap_;
  }

  /**
   * Pans the map to the given coordinates
   * @param {google.map.LatLng} coords where to pan the map to
   */
  panTo(coords) {
    this.googleMap_.panTo(coords);
  }
}
