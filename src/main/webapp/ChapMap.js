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

  /** Id Token of the current user*/
  idToken_;

  static SELECTED_CLASS = "selected";

  
  constructor(coords) {
    var lat = coords[0];
    var lng = coords[1];

    this.googleMap_ = new google.maps.Map(document.getElementById("map"), {
      center: { lat: lat, lng: lng },
      zoom: 8
    });

    this.addBtnListeners_();
    this.addMapClickListener_();
    this.setMapShareEvents_();

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
  addBtnListeners_() {
    let addMarkerBtn = this.getEl_("addMarkerBtnWrapper");
    let backBtn = this.getEl_("backBtnWrapper");
    let viewBtn = this.getEl_("viewBtnWrapper");
    let chatBtn = this.getEl_("chatBtnWrapper");

    addMarkerBtn.addEventListener('click', () => this.enableAddingMarkers_());
    viewBtn.addEventListener('click', () => this.disableAddingMarkers_());
    chatBtn.addEventListener('click', () => toggleChat());
    backBtn.addEventListener('click', () => window.location='/');
  }

  /**
   * @Private
   * Returns the element with the given id.
   * @param {String} id the id of the DOM element
   */
  getEl_(id) {
    return document.getElementById(id);
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
    let viewBtn = this.getEl_("viewBtnWrapper");
    let addMarkerBtn = this.getEl_("addMarkerBtnWrapper");

    let enableBtn = enable? addMarkerBtn: viewBtn;
    let disableBtn = enable? viewBtn: addMarkerBtn;

    this.addingMarkers_ = !this.addingMarkers_;
    this.removeTempMarker();

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
  getMarkers(userIdToken) {
    this.idToken = userIdToken;
    fetch(`/map-server?idToken=${userIdToken}&idRoom=${roomId}`)
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
   * @param {JSON} markerJson json containing marker details
  */
  handleMarker(markerJson) {
    let markerId = markerJson.id;
    let title    = markerJson.title;
    let body     = markerJson.body;
    let lat      = markerJson.lat;
    let lng      = markerJson.lng;

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
   * @param {JSON} markerJson json object with the id of the deleted marker
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
        type : ChapMap.typeValue,
        title : markerTitle,
        body : markerBody,
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
// MAP SHARING

  /**
   * @Private
   * Sets the events related to sharing the map with another user
   */
  setMapShareEvents_() {
    let shareFn = () => this.openSharePopup_();
    this.addClickEvent_("shareBtnWrapper", shareFn);

    let addEmailFn = () => this.addEmail_();
    this.addClickEvent_("addEmail", addEmailFn);

    let submitFn = () => this.submitSharing_();
    this.addClickEvent_("share", submitFn);

    let closeFn = () => this.closeSharePopup_();
    this.addClickEvent_("close", closeFn);
  }


  /**
   * @Private
   * Sets a click-trigger event to the DOM element with the given id and
   * sets the callback function to the one given
   * @param {String} id the id of the element to be added
   * @param {} fn the anonymous function to be called on click
   */
  addClickEvent_(id, fn) {
    let btn = this.getEl_(id);
    btn.addEventListener('click', fn);
  }

  /**
   * @Private
   * Opens the sharing popup and prevents the client from clicking on the map
   */
  openSharePopup_() {
    let overlay = this.getEl_("share-popup");
    overlay.classList.add("cover");

    // let popup = this.getEl_("popup-window");
    // popup.style.display="block";
  }

  /**
   * @Private
   * Closes the pop and allows clients to click on the map again
   */
  closeSharePopup_() {
    let overlay = this.getEl_("share-popup");
    overlay.classList.remove("cover");

    // let popup = this.getEl_("popup-window");
    // popup.style.display="none";

    this.clearPopupInput_();
  }

  /**
   * @Private
   * Adds the given email to the email bank
   */
  addEmail_() {
    let input = this.getEl_("email");
    let emailDiv = this.createEmailDiv_(input.value);
    input.value="";
    let emailBank = this.getEl_("email-bank");
    emailBank.appendChild(emailDiv);
  }

  /**
   * @Private
   * Creates a DOM element with the email and a delete button and adds it
   * to the email bank
   */
  createEmailDiv_(email) {
    let emailWrapper = document.createElement("div");
    emailWrapper.classList.add("emailWrapper");
    emailWrapper.id = email;

    let emailText = document.createElement("p");
    emailText.innerHTML = email;

    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "x";
    deleteBtn.addEventListener('click', () => emailWrapper.remove());

    emailWrapper.appendChild(emailText);
    emailWrapper.appendChild(deleteBtn);

    return(emailWrapper);
  }

  clearPopupInput_() {
    let emailInput = this.getEl_("email");
    emailInput.value = "";

    let emailBank = this.getEl_("email-bank");
    emailBank.innerHTML = "";
  }

  submitSharing_() {
    let shareEmails = this.getEmailsFromBank_();
    let currRoomId = roomId;
    let params = {
      emails: shareEmails,
      roomId: currRoomId,
      id: this.idToken
    };

    fetch("/share-server", {
      method:'POST',
      headers: { 'Content-Type': 'text/html' },
      body: JSON.stringify(params)
    }).then((response) => response.text())
      .then((worked) => {
       if (worked == 'true') {
         myMap.clearPopupInput_();
       }
       else {
         alert("Submit failed, please try again");
       }
     });
  }

  getEmailsFromBank_() {
    let emailBank = this.getEl_("email-bank");
    var emailWrappers = emailBank.childNodes;
    let emails = [];
    emailWrappers.forEach(function(node) {
      emails.push(node.id);
    });
    return emails;
  }
}
