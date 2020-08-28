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

  /** The google.maps.Map that will be displayed on the page. */
  googleMap_;

  /** The temporary marker visible on this map */
  tempMarker_;

  /** PermMarker currently being edited */
  editedPermMarker_;

  /** State determining whether the client can add markers or not */
  addingMarkers_;

  /** object containing all permanent markers visible on the map */
  permMarkers_;

  /** Suggested marker from the search box */
  suggestedMarker_;

  static SELECTED_CLASS = "selected";

  constructor(coords) {
    var lat = coords[0];
    var lng = coords[1];

    this.googleMap_ = new google.maps.Map(document.getElementById("map"), {
      center: { lat: lat, lng: lng },
      zoom: 8
    });

    this.initSearchBox_();

    this.addBtnListeners_();
    this.addMapClickListener_();

    PermMarker.permInfoWindow = new PermInfoWindow();
    this.tempMarker_ = new TempMarker();
    this.addingMarkers_ = false;
    this.editedPermMarker_ = null;

    this.permMarkers_ = {};
    this.loadMarkers_();
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// LISTENERS

  /**
   * @Private
   * Adds a click listener allowing clients to add markers to the map
   */
  addMapClickListener_() {
    this.googleMap_.addListener('click', (e) => {
      closeMarkerMenu();
      if (this.addingMarkers_) {
        this.restoreEditedMarker_();
        this.setTempMarker(e.latLng);
        this.closePermInfoWindow();
      }
    });
  }

  /**
   * @Private
   * Adds click listeners to the map customization buttons.
   * A client can only add markers when the "adding markers" mode is on
   */
  addBtnListeners_() {
    addClickEvent("addMarkerBtnWrapper",
                      () => this.enableAddingMarkers_());
    addClickEvent("backBtnWrapper", () => window.location='/');
    addClickEvent("viewBtnWrapper", () => this.disableAddingMarkers_());
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
    let viewBtn = document.getElementById("viewBtnWrapper");
    let addMarkerBtn = document.getElementById("addMarkerBtnWrapper");

    let enableBtn = enable? addMarkerBtn: viewBtn;
    let disableBtn = enable? viewBtn: addMarkerBtn;

    this.addingMarkers_ = !this.addingMarkers_;

    enableBtn.classList.add(ChapMap.SELECTED_CLASS);
    disableBtn.classList.remove(ChapMap.SELECTED_CLASS);
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// PERM MARKER HANDLERS

  /**
   * Turns the permanent marker to a temporary marker with the same
   * details and prevents the client from creating a new temporary marker
   * @param {PermMarker} permMarker permanent marker to be edited
   */
  editPermMarker(permMarker) {
    this.setTempMarker(permMarker.getPosition());
    permMarker.hide();

    this.editedPermMarker_ = permMarker;
    this.disableAddingMarkers_();
    this.tempMarker_.setColor(permMarker.getColorName());
    this.tempMarker_.openInfoWindow();
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
    this.restoreEditedMarker_();
    this.closePermInfoWindow();

    this.tempMarker_.closeInfoWindow();
    this.tempMarker_.setColor(ColorPicker.DEFAULT_COLOR);
    this.tempMarker_.setPosition(coords);
    this.googleMap_.panTo(coords);

    this.clearSuggestedMarker_();
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

  /**
   * Pans the map to the given marker and opens its information window
   * @param {PermMarker} marker the marker that should be centered
   */
  highlightMarker(marker) {
    this.panTo(marker.getPosition());
    marker.openInfoWindow();
  }

  /**
   * @Private
   * Makes the edited permanent marker visible again
   */
  restoreEditedMarker_() {
    if (!this.editedPermMarker_) return;
    this.editedPermMarker_.getGoogleMarker().setMap(this.googleMap_);
    this.editedPermMarker_ = null;
  }

  /**
   * Returns the permanent marker with the given id
   * @param {String} id the id the marker wanted
   */
  getPermMarker(id) {
    return this.permMarkers_[id];
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// RECEIVE MARKERS FROM THE SERVER

  /**
   * @Private
   * Fetches all the map's markers from the server and loads them to the map
   */
  loadMarkers_() {
    // fetchStr initialized in main.js
    fetch("/map-server"+fetchStr)
      .then(response => response.json())
      .then(markers => myMap.handleMarkers_(markers));
  }

  /**
   * @Private
   * Processes a list of markers and adds them to the map
   * @param {JSON} markers json array of markers that need to be processed
   */
  handleMarkers_(markers) {
    for (const marker in markers) {
      myMap.handleMarker(markers[marker]);
    }
  }

  /**
   * Modifies or creates a new PermMarker with the given details
   * @param {Object} markerJson json containing marker details
  */
  handleMarker(markerJson) {
    let markerId = markerJson.id;

    let permMarker = this.permMarkers_[markerId];

    if (!permMarker) {
      this.makeNewPermMarker_(markerId, markerJson)
    } else {
      removeMarkerFromMenu(permMarker);
      this.updatePermMarker_(permMarker, markerJson);
    }
  }

  /**
   * @Private
   * Creates a new PermMarker with the given details and stores it
   * @param {String} id the id of the marker
   * @param {Object} markerJson json containing marker details
   */
  makeNewPermMarker_(id, markerJson) {
    let permMarker = new PermMarker(id);
    this.permMarkers_[id] = permMarker;
    this.updatePermMarker_(permMarker, markerJson);
  }

  /**
   * @Private
   * Updates an existing perm marker's details with the info from the server
   * @param {PermMarker} permMarker marker that needs to be modified
   * @param {Object} markerJson json containing marker details
   */
  updatePermMarker_(permMarker, markerJson) {
    let title    = markerJson.title;
    let body     = markerJson.body;
    let color    = markerJson.color;
    let lat      = markerJson.lat;
    let lng      = markerJson.lng;

    let coords = new google.maps.LatLng(lat, lng);

    if (coords) {
      permMarker.setPosition(coords);
    }
    if (title) {
      permMarker.setTitle(title);
    }
    if (body) {
      permMarker.setBody(body);
    }
    if (color) {
      permMarker.setColor(color);
    }

    addToMarkerMenu(permMarker);
    if (permMarker === this.editedPermMarker_) {
      permMarker.openInfoWindow();
      this.editedPermMarker_ = null;
    }
  }

  /**
   * Execute marker delete based on the json given by the server
   * @param {Object} markerJson json object with the id of the deleted marker
   */
  deleteMarker(markerJson) {
    let id = markerJson.id;
    let permMarker = this.permMarkers_[id];

    if (permMarker) {
      permMarker.hide();
      delete this.permMarkers_[id];
      removeMarkerFromMenu(permMarker);
    }
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SEND MARKERS TO THE SERVER

  static typeValue = "MAP_SEND";

  /**
   * Sends marker information to the server
   * @param {google.maps.LatLng} coords where to place the marker
   * @param {String} title the title of the marker
   * @param {String} body the body of the marker description
   * @param {String} color the color of the marker
   */
  sendPermMarkerInfo(coords, title, body, color) {
    this.removeTempMarker();
    let editedPermMarker = this.editedPermMarker_;

    if (!editedPermMarker) {
      connection.send(this.makeJson_(coords, title, body, color));
    } else {
      let id = editedPermMarker.getId();
      connection.send(this.makeJson_(coords, title, body, color, id));
    }
  }

  /**
   * @Private
   * Returns a json object with all the information paired with the relevant key
   * @param {google.maps.LatLng} coords where to place the marker
   * @param {String} markerTitle the title of the marker
   * @param {String} markerBody the body of the marker description
   * @param {String} color the color of the marker
   * @param {?String} markerId the datastore id of this marker
   */
  makeJson_(coords, markerTitle, markerBody, markerColor, markerId) {
    var jsonObject = {
        type : ChapMap.typeValue,
        title : markerTitle,
        body : markerBody,
        color: markerColor,
        lat : coords.lat(),
        lng : coords.lng()
    };

    if (markerId) {
      jsonObject.id = markerId;
    }

    return JSON.stringify(jsonObject);
  }

  /**
   * Tells the server to delete this marker from datastore FINISH
   * @param permMarker the permanent marker that needs to be deleted
   */
  sendDeleteRequest(permMarker) {
    var jsonObject = {
        type : "MAP_DEL",
        id: permMarker.getId()
    };

    connection.send(JSON.stringify(jsonObject));
  }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SEARCH BAR

  /**
   * @Private
   * Initialize and setup the search box
   */
  initSearchBox_() {
    const input = document.getElementById("search");
    const searchBox = new google.maps.places.SearchBox(input);
    const map = this.googleMap_;
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // suggest results from current viewport
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places.length == 0) return;

      this.clearSuggestedMarker_();
      const bounds = new google.maps.LatLngBounds();

      places.forEach(place => {
        this.addSuggestedMarker_(place);
        this.adjustMapBounds_(place, bounds);
      });
      map.fitBounds(bounds);
    });
  }

  /**
   * @Private
   * Removes suggested Markers and empties the suggest markers list
   */
  clearSuggestedMarker_() {
    let marker = this.suggestedMarker_;
    if (marker) {
      marker.setMap(null);
      marker = null;
    }
  }

  /**
   * @Private
   * Adds a marker at the location given
   * @param {google.maps.Place} place location to create a suggested marker
   */
  addSuggestedMarker_(place) {
    let icon = ColorPicker.getPermMarkerIcon(ColorPicker.DEFAULT_COLOR);
    let newMarker = new google.maps.Marker({
      map: this.googleMap_,
      title: place.name,
      position: place.geometry.location
    });
    newMarker.setIcon(icon);

    newMarker.addListener('click', () => {
      let coords = newMarker.getPosition()
      this.setTempMarker(coords);
      this.tempMarker_.openInfoWindow();
    });

    this.suggestedMarker_ = newMarker;
  }

  /**
   * @Private
   * Adjusts the zoom and bounds of the map to center a location
   * @param {google.maps.Place} place where to center the map
   * @param {google.maps.LatLngBounds} bounds object to apply new bounds to
   */
  adjustMapBounds_(place, bounds) {
    if (place.geometry.viewport) {
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
}
