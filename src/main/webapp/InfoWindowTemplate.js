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
  static COLOR_ID = "markerColor";
  static CONTENT_WRAPPER = "contentWrapper";
  static LEFT_COLUMN = "leftColumn";
  static RIGHT_COLUMN = "rightColumn";
  static COLOR_PICKER = "colorPicker";
  static COLOR_BTN = "colorBtn";
  static WIDE = "wide";
  static PICKED_COLOR = "picked";

  /** google.maps.Marker object this info window is anchored to */
  myMarker_;

  /** The google.maps.InfoWindow object visible on the map */
  googleInfoWindow_;

  /** Keeps track of whether the color picker is visible or not */
  windowIsExpanded_;

  constructor() {
    this.googleInfoWindow_ = new google.maps.InfoWindow();
    this.windowIsExpanded_ = false;
    this.googleInfoWindow_.addListener('domready', () => {
        this.setDeleteEvent_();
        this.setToggleColorPickerEvent_();
        this.setColorChangeEvent_();
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
   * When the color picker button is clicked on, toggle the color picker
   */
  setToggleColorPickerEvent_() {
    let colorBtn = document.getElementById(InfoWindowTemplate.COLOR_ID);
    colorBtn.addEventListener('click', () => this.toggleColorPicker_());
  }

  /**
   * @Private
   * Displays or hides the color picker menu
   */
  toggleColorPicker_() {
    let toggledContent = [InfoWindowTemplate.CONTENT_WRAPPER,
                          InfoWindowTemplate.RIGHT_COLUMN,
                          InfoWindowTemplate.COLOR_PICKER];

    let wideClass = InfoWindowTemplate.WIDE

    for (const id of toggledContent) {
      let el = document.getElementById(id);
      if (this.windowIsExpanded_) {
        el.classList.remove(wideClass);
      } else {
        el.classList.add(wideClass);
      }
    }

    this.windowIsExpanded_ = !this.windowIsExpanded_;
  }

  /**
   * @Private
   * Adds click events to all the color picker options
   */
  setColorChangeEvent_() {
      let colorBtns =
          document.getElementsByClassName(InfoWindowTemplate.COLOR_BTN);
      for (const btn of colorBtns) {
        btn.addEventListener('click', () => this.switchSelectedColor_(btn));
      }
  }

  /**
   * @Private
   * Change which color is currently selected
   * @param {Element} clickedBtn the color btn that was just clicked
   */
   switchSelectedColor_(clickedBtn) {
     let pickedClass = InfoWindowTemplate.PICKED_COLOR;
     let prevSelectedBtn = document.getElementsByClassName(pickedClass)[0];
     prevSelectedBtn.classList.remove(pickedClass);
     clickedBtn.classList.add(pickedClass);

     let newColor = clickedBtn.id;
     this.setPreviewColor_(newColor);
     this.myMarker_.setColor(newColor);
   }


   /**
    * @Private
    * Changes the previewed color to the one given
    * @param {String} newColorName the name of the color to be shown
    */
   setPreviewColor_(newColorName) {
     let newColorCode = this.myMarker_.getMarkerColors()[newColorName];
     let previewBtn = document.getElementById(InfoWindowTemplate.COLOR_ID);
     previewBtn.style.backgroundColor = newColorCode;
   }

  /**
   * @Private
   * Returns the html string to be displayed in this info window
   */
  makeContent_() {
    let contentWrapper = myMap.makeEl("div", /* class= */ null, InfoWindowTemplate.CONTENT_WRAPPER);
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

     let markerColors = this.myMarker_.getMarkerColors();
     let colorNames = Object.keys(markerColors);

     colorNames.forEach(colorName => {
       let colorCode = markerColors[colorName];

       let colorBtn = myMap.makeEl("button", InfoWindowTemplate.COLOR_BTN,
            colorName);
       colorBtn.style.backgroundColor = colorCode;

       if (colorName === this.myMarker_.getColorName()) {
         colorBtn.classList.add(InfoWindowTemplate.PICKED_COLOR);
       }

       pickerWrapper.appendChild(colorBtn);
     });

     return pickerWrapper;
   }

  /**
   * @Private
   * Puts together info window buttons
   */
  makeLeftColumn_() {
    let leftCol = myMap.makeEl("div", /* class= */null,
        InfoWindowTemplate.LEFT_COLUMN);

    let deleteBtn = myMap.makeEl("button", /* class= */ null,
        InfoWindowTemplate.DELETE_ID);

    let editBtn = myMap.makeEl("button", /* class= */ null,
        InfoWindowTemplate.EDIT_ID);

    let colorBtn = myMap.makeEl("button", /* class= */ null,
        InfoWindowTemplate.COLOR_ID);
    colorBtn.style.backgroundColor = this.myMarker_.getColorCode();

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
