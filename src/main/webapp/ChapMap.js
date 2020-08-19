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

  constructor() {
    this.googleMap_ = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8
    });

    this.makeMapButtons_();
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
      if (this.addingMarkers_) {
        this.editedPermMarker_ = null;
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
  addBtnListeners_(viewBtn, addMarkerBtn, chatBtn, backBtn) {
    addMarkerBtn.addEventListener('click', () => this.enableAddingMarkers_());
    viewBtn.addEventListener('click', () => this.disableAddingMarkers_());
    chatBtn.addEventListener('click', () => toggleChat());
    backBtn.addEventListener('click', () => window.location = '/');
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

    let enableBtn = enable ? addMarkerBtn : viewBtn;
    let disableBtn = enable ? viewBtn : addMarkerBtn;

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

  static SELECTED_CLASS = "selected";

  /**
   * @Private
   * Overlays add-marker state toggler buttons on the map
   */
  makeMapButtons_() {
    let map = document.getElementById("map");
    let viewBtn = this.makeViewBtn_();
    let addMarkerBtn = this.makeAddMarkerBtn_();
    let chatBtn = this.makeChatBtn_();
    let backBtn = this.makeBackBtn_();

    this.addBtnListeners_(viewBtn, addMarkerBtn, chatBtn, backBtn);

    map.appendChild(viewBtn);
    map.appendChild(addMarkerBtn);
    map.appendChild(chatBtn);
    map.appendChild(backBtn);
  }

  /**
   * @Private
   * Returns a button that will prevent clients from adding markers
   */
  makeViewBtn_() {
    let viewBtnWrapper = document.createElement("div");
    viewBtnWrapper.id = "viewBtnWrapper";
    viewBtnWrapper.classList.add("btnWrapper");
    viewBtnWrapper.classList.add(ChapMap.SELECTED_CLASS);

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
   * Returns a button that will be used to toggle the chat
   */
  makeChatBtn_() {
    let chatBtnWrapper = document.createElement("div");
    chatBtnWrapper.id = "chatBtnWrapper";
    chatBtnWrapper.classList.add("btnWrapper");
    chatBtnWrapper.classList.add("textBtnWrapper");

    let btn = document.createElement("button");
    btn.classList.add("textBtn");
    btn.id = "chatButton";
    btn.innerHTML = "Chat";

    chatBtnWrapper.appendChild(btn);

    return chatBtnWrapper;
  }


  /**
   * @Private
   * Returns a button that will be used to go back to the home page
   */
  makeBackBtn_() {
    let backBtnWrapper = document.createElement("div");
    backBtnWrapper.id = "backBtnWrapper";
    backBtnWrapper.classList.add("btnWrapper");
    backBtnWrapper.classList.add("textBtnWrapper");

    let backBtn = document.createElement("input");
    backBtn.classList.add("textBtn");
    backBtn.id = "backButton";
    backBtn.type = "submit";
    backBtn.value = "Back";

    backBtnWrapper.appendChild(backBtn);

    return backBtnWrapper;
  }
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // PERM MARKER HANDLERS

  /**
   * Turns the permanent marker to a temporary marker with the same
   * details and prevents the client from creating a new temporary marker
   * @param {PermMarker} permMarker permanent marker to be edited
   */
  editPermMarker(permMarker) {
    this.closePermInfoWindow();
    permMarker.hide();

    this.editedPermMarker_ = permMarker;
    this.disableAddingMarkers_();

    this.setTempMarker(permMarker.getPosition());
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

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // RECEIVE MARKERS FROM THE SERVER

  /**
   * @Private
   * Fetches all the map's markers from the server and loads them to the map
   */
  loadMarkers_() {
    firebase.auth().currentUser.getIdToken(/* forceRefresh= */ true)
      .then(idToken => myMap.getMarkers(idToken))
      .catch(error => {
        throw "Problem getting markers";
      });
  }

  /**
   * Retrieves markers from the server and adds them to the map
   * @param {firebase.idToken} idToken the current user's getIdToken
   */
  getMarkers(idToken) {
    fetch(`/map-server?idToken=${idToken}&idRoom=${roomId}`)
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
    let title = markerJson.title;
    let body = markerJson.body;
    let lat = markerJson.lat;
    let lng = markerJson.lng;

    let coords = new google.maps.LatLng(lat, lng);

    let permMarker = this.permMarkers_[markerId];

    if (!permMarker) {
      this.makeNewPermMarker_(markerId, title, body, coords)
    } else {
      this.updatePermMarker_(permMarker, coords, title, body);
    }
  }

  /**
   * @Private
   * Creates a new PermMarker with the given details and stores it
   * @param {String} title the title of the marker
   * @param {String} body the body of the marker description
   * @param {String} id the id of the marker
   * @param {google.maps.LatLng} coords the coordinates of the marker
   */
  makeNewPermMarker_(id, title, body, coords) {
    let permMarker = new PermMarker(id);
    this.permMarkers_[id] = permMarker;
    this.updatePermMarker_(permMarker, coords, title, body);
  }

  /**
   * @Private
   * Updates an existing perm marker's details with the info from the server
   * @param {PermMarker} permMarker marker that needs to be modified
   * @param {String} title the title of the marker
   * @param {String} body the body of the marker description
   * @param {google.maps.LatLng} coords the coordinates of the marker
   */
  updatePermMarker_(permMarker, coords, title, body) {
    if (coords) {
      permMarker.setPosition(coords);
    }
    if (title) {
      permMarker.setTitle(title);
    }
    if (body) {
      permMarker.setBody(body);
    }

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
   */
  sendPermMarkerInfo(coords, title, body) {
    this.removeTempMarker();
    let editedPermMarker = this.editedPermMarker_;

    if (!editedPermMarker) {
      connection.send(this.makeJson_(coords, title, body));
    } else {
      let id = editedPermMarker.getId();
      connection.send(this.makeJson_(coords, title, body, id));
    }
  }

  /**
   * @Private
   * Returns a json object with all the information paired with the relevant key
   * @param {google.maps.LatLng} coords where to place the marker
   * @param {String} markerTitle the title of the marker
   * @param {String} markerBody the body of the marker description
   * @param {String} markerId the datastore id of this marker
   */
  makeJson_(coords, markerTitle, markerBody, markerId) {
    var jsonObject = {
      type: ChapMap.typeValue,
      title: markerTitle,
      body: markerBody,
      lat: coords.lat(),
      lng: coords.lng()
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
      type: "MAP_DEL",
      id: permMarker.getId()
    };

    connection.send(JSON.stringify(jsonObject));
  }  
}

