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

  static markerColors_ = {
      yellow: "#FDF569",
      red: "#EA4335",
      purple: "#8E67FD",
      pink: "#E661AC",
      orange: "#FF9900",
      blue: "#6991FD",
      green: "#00E64D",
      ltblue: "#67DDDD"
  }

  static DELETE_ID = "markerDelete";
  static EDIT_ID = "markerEdit";
  static COLOR_ID = "markerColor";
  static CONTENT_WRAPPER = "contentWrapper";
  static LEFT_COLUMN = "leftColumn";
  static RIGHT_COLUMN = "rightColumn";
  static COLOR_PICKER = "colorPicker";
  static COLOR_BTN = "colorBtn";

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
    contentWrapper.appendChild(this.makeColorPicker_());
    contentWrapper.appendChild(this.makeLeftColumn_());
    contentWrapper.appendChild(this.makeRightColumn_());

    let result = contentWrapper.outerHTML;
    contentWrapper.remove();

    return result;
  }

  /**
   * @Private
   * Builds the color picker for the marker
   */
   makeColorPicker_() {
     let pickerWrapper = myMap.makeEl("div", /* class= */ null, InfoWindowTemplate.COLOR_PICKER);

     let colorNames = Object.keys(InfoWindowTemplate.markerColors_);

     colorNames.forEach(colorName => {
       let colorCode = InfoWindowTemplate.markerColors_[colorName];

       let colorBtn = myMap.makeEl("button", InfoWindowTemplate.COLOR_BTN,
            colorName);
       colorBtn.style.backgroundColor = colorCode;

       pickerWrapper.appendChild(colorBtn);
     });

     return pickerWrapper;
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

    let colorBtn = myMap.makeEl("button", /* class= */ null,
        InfoWindowTemplate.COLOR_ID);

    leftCol.appendChild(deleteBtn);
    leftCol.appendChild(editBtn);
    leftCol.appendChild(colorBtn);
    return leftCol;
  }

  /**
   * Builds the right side of the information window
   * @abstract
   */
  makeRightColumn_() {}
}
