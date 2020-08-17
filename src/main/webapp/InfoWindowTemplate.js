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

/** Defines the basic functions that all infoWindows must have */
class InfoWindowTemplate {

  static DELETE_ID = "markerDelete";
  static EDIT_ID = "markerEdit";
  static CONTENT_WRAPPER = "contentWrapper";
  static LEFT_COLUMN = "leftColumn";
  static RIGHT_COLUMN = "rightColumn";

  /** google.maps.Marker object this info window is anchored to */
  myMarker_;

  /** The google.maps.InfoWindow object visible on the map */
  googleInfoWindow_;

  constructor() {
    this.googleInfoWindow_ = new google.maps.InfoWindow();
    this.googleInfoWindow_.addListener('domready', () => {
        this.setDeleteEvent_();
      });
  }

  /** Closes the displayed info window */
  close() {
    this.googleInfoWindow_.close();
    this.googleInfoWindow_.setContent(null);
  }

  /** Displays the info window on the map */
  open() {
    this.close();
    this.googleInfoWindow_.setContent(this.makeContent_());
    this.googleInfoWindow_.open
        (myMap.getGoogleMap(), this.myMarker_.getGoogleMarker());
  }

  /**
   * @Private
   * Sets the click event for the information window buttons
   */
  setDeleteEvent_() {
    let deleteBtn = document.getElementById(InfoWindowTemplate.DELETE_ID);
    deleteBtn.onclick = () => this.myMarker_.remove();
  }

  /**
   * @Private
   * Returns the html string to be displayed in this info window
   */
  makeContent_() {
    let contentWrapper = myMap.makeEl("div", InfoWindowTemplate.CONTENT_WRAPPER);
    contentWrapper.appendChild(this.makeLeftColumn_());
    contentWrapper.appendChild(this.makeRightColumn_());

    let result = contentWrapper.outerHTML;
    contentWrapper.remove();

    return result;
  }

  /**
   * @Private
   * Puts together info window buttons
   */
  makeLeftColumn_() {
    let leftCol = myMap.makeEl("div", InfoWindowTemplate.LEFT_COLUMN);

    let deleteBtn = myMap.makeEl("button", /* class= */ null,
        InfoWindowTemplate.DELETE_ID);

    let editBtn = myMap.makeEl("button", /* class= */ null,
        InfoWindowTemplate.EDIT_ID);

    leftCol.appendChild(deleteBtn);
    leftCol.appendChild(editBtn);
    return leftCol;
  }

  /**
   * Builds the right side of the information window
   * @abstract
   */
  makeRightColumn_() {}
}
