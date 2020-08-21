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
    this.addClickEvent_("addMarkerBtnWrapper",
                      () => this.enableAddingMarkers_());
    this.addClickEvent_("backBtnWrapper", () => window.location='/');
    this.addClickEvent_("viewBtnWrapper", () => this.disableAddingMarkers_());
    this.addClickEvent_("chatBtnWrapper", () => toggleChat());
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
   * @param {Object} markerJson json containing marker details
  */
  handleMarker(markerJson) {
    let markerId = markerJson.id;

    let permMarker = this.permMarkers_[markerId];

    if (!permMarker) {
      this.makeNewPermMarker_(markerId, markerJson)
    } else {
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
// MAP SHARING

  /**
   * @Private
   * Sets the events related to sharing the map with another user
   */
  setMapShareEvents_() {
    this.addClickEvent_("shareBtnWrapper", () => this.openSharePopup_());
    this.addClickEvent_("addEmail", () => this.addEmail_());
    this.addClickEvent_("share", () => this.submitSharing_());
    this.addClickEvent_("close", () => this.closeSharePopup_());
    this.addClickEvent_("share-popup", () => this.closeSharePopup_());
  }

  /**
   * Sets a click-trigger event to the DOM element with the given id and
   * sets the callback function to the one given
   * @param {String} id the id of the element to be added
   * @param {*} fn the anonymous function to be called on click
   */
  addClickEvent_(id, fn) {
    let btn = document.getElementById(id);
    btn.addEventListener('click', fn);
  }

  /**
   * @Private
   * Opens the sharing popup and prevents the client from clicking on the map
   */
  openSharePopup_() {
    let overlay = document.getElementById("share-popup");
    overlay.classList.add("cover");
  }

  /**
   * @Private
   * Closes the pop and allows clients to click on the map again
   */
  closeSharePopup_() {
    let overlay = document.getElementById("share-popup");
    overlay.classList.remove("cover");
    this.clearPopupInput_();
  }

  /**
   * @Private
   * Adds the given email to the email bank
   */
  addEmail_() {
    let input = document.getElementById("email");
    let emailDiv = this.createEmailDiv_(input.value);
    input.value="";
    let emailBank = document.getElementById("email-bank");
    emailBank.appendChild(emailDiv);
  }

  /**
   * @Private
   * Creates a DOM element with the email and a delete button and adds it
   * to the email bank
   */
  createEmailDiv_(email) {
    let emailWrapper = makeEl("div", "emailWrapper");
    emailWrapper.setAttribute("data-email", email);

    let emailText = document.createElement("p");
    emailText.innerHTML = email;

    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "x";
    deleteBtn.addEventListener('click', () => emailWrapper.remove());

    emailWrapper.appendChild(emailText);
    emailWrapper.appendChild(deleteBtn);

    return(emailWrapper);
  }

  /**
   * @Private
   * Clears the email input and email bank in the sharing popup
   */
  clearPopupInput_() {
    let emailInput = document.getElementById("email");
    emailInput.value = "";

    let emailBank = document.getElementById("email-bank");
    emailBank.innerHTML = "";
  }

  /**
   * @Private
   * Shares the map with all the emails in the email bank
   */
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

  /**
   * @Private
   * Retrieves all the emails the email bank in the sharing popup
   */
  getEmailsFromBank_() {
    let emailBank = document.getElementById("email-bank");
    var emailWrappers = emailBank.childNodes;
    let emails = [];
    emailWrappers.forEach(function(node) {
      emails.push(node.getAttribute("data-email"));
    });
    return emails;
  }
}
