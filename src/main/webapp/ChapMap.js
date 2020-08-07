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

  static SELECTED_CLASS = "selected";

  /** The google.maps.Map that will be displayed on the page. */
  googleMap_;

  /** The temporary marker visible on this map */
  tempMarker_;

  /** The info window used for all markers */
  myInfoWindow_;

  /** PermMarker currently being edited */
  editedPermMarker_;

  /** State determining whether the client can add markers or not */
  addingMarkers_;

  constructor() {
    this.googleMap_ = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
      });

    this.makeMapButtons_();
    this.addMapClickListener_();

    this.myInfoWindow_ = new PermInfoWindow();
    this.tempMarker_ = new TempMarker();
    this.addingMarkers_ = false;
    this.editedPermMarker_ = null;
  }
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// LISTENERS

  /**
   * @Private
   * Adds a click listener allowing clients to add markers to the map
   */
  addMapClickListener_() {
    this.googleMap_.addListener('click', (e) => {
      if (this.addingMarkers_) {
        this.editedPermMarker_ = null;
        this.setTempMarker(e.latLng);
        this.closeInfoWindow();
      }
    });
  }

  /**
   * @Private
   * Adds click listeners to the map customization buttons.
   * A client can only add markers when the "adding markers" mode is on
   */
  addBtnListeners_(viewBtn, addMarkerBtn) {
    addMarkerBtn.addEventListener('click', () => this.enableAddingMarkers_());
    viewBtn.addEventListener('click', () => this.disableAddingMarkers_());
  }

  /**
   * @Private
   * Disable marker-adding state remove temp marker
   */
  disableAddingMarkers_() {
    if (this.addingMarkers_) {
      this.toggleAddingMarkers_(/*enable=*/ false);
    }
  }

  /**
   * @Private
   * Enable marker-adding state remove temp marker
   */
  enableAddingMarkers_() {
    if (!this.addingMarkers_) {
      this.toggleAddingMarkers_(/*enable=*/ true);
    }
  }

  /**
   * @Private
   * Toggles the ability for clients to add markers on the map
   * @param {Boolean} enable whether this mode should be enabled or disabled
   */
  toggleAddingMarkers_(enable) {
    let addMarkerBtn = this.getAddMarkerBtn_();
    let viewBtn = this.getViewBtn_();

    let enableBtn = enable? addMarkerBtn: viewBtn;
    let disableBtn = enable? viewBtn: addMarkerBtn;

    this.addingMarkers_ = !this.addingMarkers_;
    this.removeTempMarker();

    enableBtn.classList.add(ChapMap.SELECTED_CLASS);
    disableBtn.classList.remove(ChapMap.SELECTED_CLASS);
  }

  /**
   * @Private
   * Retrieves the button disabling marker-adding from the DOM
   */
  getViewBtn_() {
    return document.getElementById("viewBtnWrapper");
  }

  /**
   * @Private
   * Retrieves the button enabling marker-adding from the DOM
   */
  getAddMarkerBtn_() {
    return document.getElementById("addMarkerBtnWrapper");
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// BUILD MAP BUTTONS

  /**
   * @Private
   * Overlays add-marker state toggler buttons on the map
   */
  makeMapButtons_() {
    let map = document.getElementById("map");
    let viewBtn = this.makeViewBtn_();
    let addMarkerBtn = this.makeAddMarkerBtn_();

    this.addBtnListeners_(viewBtn, addMarkerBtn);

    map.appendChild(viewBtn);
    map.appendChild(addMarkerBtn);
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
   * Removes a permanent marker from the map
   * @param {PermMarker} myMarker permanent marker to be deleted
   */
  deletePermMarker(myMarker) {
    this.myInfoWindow_.close();
    myMarker.hide();
  }

  /**
   * Turns the permanent marker to a temporary marker with the same
   * details and prevents the client from creating a new temporary marker
   * @param {PermMarker} permMarker permanent marker to be edited
   */
  editPermMarker(permMarker) {
    this.closeInfoWindow();
    permMarker.hide();

    this.editedPermMarker_ = permMarker;
    this.disableAddingMarkers_();

    this.setTempMarker(permMarker.getPosition());
    this.tempMarker_.openTempInfoWindow();
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

    this.openInfoWindow(permMarker);
    this.editedPermMarker_ = null;
  }

  /** Returns the PermMarker currently being edited */
  editingPermMarker() {
    return this.editedPermMarker_;
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// TEMP MARKER HANDLERS

  /**
   * Makes the temporary marker visible at the given coordinates
   * @param {google.maps.LatLng} coords coordinates where to show the marker
   */
  setTempMarker(coords) {
    this.myInfoWindow_.close();
    this.tempMarker_.setPosition(coords);
    this.googleMap_.panTo(coords);
  }

  /** Removes the  temporary marker from the map */
  removeTempMarker() {
    this.tempMarker_.hide();
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// INFO WINDOW HANDLERS

  /**
   * Opens the map's information window at the given marker
   * @param {PermMarker} myMarker permanent marker whose content should be
   * visible
   */
  openInfoWindow(myMarker) {
    this.myInfoWindow_.open(myMarker);
  }

  /**
   * Closes the map's information openWindow
   */
  closeInfoWindow() {
    this.myInfoWindow_.close();
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
