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

/** Creates an information window for clients to create/customize markers */
class TempInfoWindow extends InfoWindowTemplate {

  static TITLE_INPUT = "titleInput";
  static BODY_INPUT = "bodyInput";
  static SUBMIT_BTN = "mySubmitBtn";
  static DEFAULT_TITLE = "Title";
  static DEFAULT_BODY = "Body";
  static COLOR_PICKER = "colorPicker";
  static COLOR_BTN = "colorBtn";
  static PICKED_COLOR = "picked";
  static WIDE = "wide";

  /**
   */
  constructor(tempMarker) {
    super();
    this.myMarker_ = tempMarker;
    this.googleInfoWindow_.addListener('domready', () => {
        this.setColorChangeEvent_();
        this.setSubmitEvent_();
        this.adjustWindow_();
      });
  }

  /**
   * @Private
   * Sets the click event for the info window and submit button
   */
  setSubmitEvent_() {
    let submitBtn = document.getElementById(TempInfoWindow.SUBMIT_BTN);
    submitBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        this.sendFormInfo();
      });
  }

  /**
   * @Private
   * Adds click events to all the color picker options
   */
  setColorChangeEvent_() {
      let colorBtns =
          document.getElementsByClassName(TempInfoWindow.COLOR_BTN);
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
     let pickedClass = TempInfoWindow.PICKED_COLOR;
     let prevSelectedBtn = this.getSelectedColor_();

     prevSelectedBtn.classList.remove(pickedClass);
     clickedBtn.classList.add(pickedClass);

     let newColor = clickedBtn.id;
     this.myMarker_.setColor(newColor);
   }

   /** Returns the color button currently selected */
   getSelectedColor_() {
     return document.getElementsByClassName(TempInfoWindow.PICKED_COLOR)[0];
   }

  /** Sends form input to the temporary marker */
  sendFormInfo() {
    let inputTitle = document.getElementById(TempInfoWindow.TITLE_INPUT).value;
    let inputBody = document.getElementById(TempInfoWindow.BODY_INPUT).value;

    this.myMarker_.setColor(MarkerTemplate.DEFAULT_COLOR);

    this.myMarker_.setPermMarkerInfo(inputTitle.value, inputBody.value);
  }

  /**
   * @Private
   * Returns the HTML of the right section of the information window
   */
  makeRightColumn_() {
    let rightCol = myMap.makeEl("div", /* class= */ null,
          InfoWindowTemplate.RIGHT_COLUMN);

    let editedMarker = myMap.editingPermMarker();
    let titleText = editedMarker? editedMarker.getTitle(): null;
    let bodyText = editedMarker? editedMarker.getBody(): null;

    let titleInput = this.makeForm_(TempInfoWindow.TITLE_INPUT,
        TempInfoWindow.DEFAULT_TITLE, titleText);
    rightCol.appendChild(titleInput);

    let bodyInput = this.makeForm_(TempInfoWindow.BODY_INPUT,
        TempInfoWindow.DEFAULT_BODY, bodyText);
    rightCol.appendChild(bodyInput);

    let submitBtn = myMap.makeEl("button", /* class= */ null,
        TempInfoWindow.SUBMIT_BTN);
    submitBtn.innerHTML = "Enter";
    rightCol.appendChild(submitBtn);

    return rightCol;
  }

  /**
   * Returns a textarea DOM element with given ID, placeholder, and value
   * @param {String} elId the id of the element
   * @param {String} elPlaceholder the placeholder text of the input
   * @param {String} elInnerHTML the innerHTML text of the textarea
   */
  makeForm_(elId, elPlaceholder, elInnerHTML) {
    let el = myMap.makeEl("textarea", /* class= */ null, elId);
    el.placeholder = elPlaceholder;
    el.innerHTML = elInnerHTML? elInnerHTML: "";
    return el;
  }

  /**
   * @Private
   * Builds the color picker for the marker
   */
   makeLeftColumn_() {
     let leftCol = myMap.makeEl("div", InfoWindowTemplate.LEFT_COLUMN);

     let pickerWrapper = myMap.makeEl("div", /* class= */ null, TempInfoWindow.COLOR_PICKER);
     let markerColors = this.myMarker_.getMarkerColors();
     let markerColor = this.myMarker_.getColorName();
     let colorNames = Object.keys(markerColors);

     colorNames.forEach(colorName => {
       let colorBtn = this.makeColorBtn_(colorName, markerColors, markerColor)
       pickerWrapper.appendChild(colorBtn);
     });

     leftCol.appendChild(pickerWrapper);

     return leftCol;
   }

   /**
    * @Private
    * Returns a color button that displays a certain color and checks if this
    * color should be pre-selected
    * @param {String} colorName the name of the color for this button
    * @param {Object} colorMap an object of color names mapped to color codes
    * @param {String} markerColor the color of this info window's marker
    */
   makeColorBtn_(colorName, colorMap, markerColor) {
     let colorCode = colorMap[colorName];
     let colorBtn = myMap.makeEl("button", TempInfoWindow.COLOR_BTN,
          colorName);

     colorBtn.style.backgroundColor = colorCode;

     if (colorName === markerColor) {
       colorBtn.classList.add(TempInfoWindow.PICKED_COLOR);
     }

     return colorBtn;
   }

   /**
    * @Private
    * Changes the dimensions and alignment of the info window components
    */
   adjustWindow_() {
     let components = [InfoWindowTemplate.CONTENT_WRAPPER, InfoWindowTemplate.MIDDLE_COLUMN,  InfoWindowTemplate.RIGHT_COLUMN];

     for (const id of components) {
       document.getElementById(id).classList.add(TempInfoWindow.WIDE);
     }
   }
}
