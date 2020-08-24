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

  /**
   * @param {TempMarker} tempmarker temp marker linked to this TempInfoWindow
   */
  constructor(tempMarker) {
    super();
    this.myMarker_ = tempMarker;
    this.googleInfoWindow_.addListener('domready', () => {
        this.setSubmitEvent_();
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

  /** Sends form input to the temporary marker */
  sendFormInfo() {
    let inputTitle = document.getElementById(TempInfoWindow.TITLE_INPUT);
    let inputBody = document.getElementById(TempInfoWindow.BODY_INPUT);

    this.myMarker_.setPermMarkerInfo(inputTitle.value, inputBody.value);

    inputTitle.value = "";
    inputBody.value = "";
  }

  /**
   * @Private
   * Returns the HTML of the right section of the information window
   * @returns {Promise} Promise object represents right column of info window
   */
  makeRightColumn_() {

    return new Promise((resolve) => {
      let rightCol = document.createElement("div");
      rightCol.classList.add(InfoWindowTemplate.RIGHT_COLUMN);
      rightCol.appendChild(this.makeContentForm_());
      
      resolve (rightCol);
    });
  }

  /**
   * @Private
   * Returns the HTML for the input form for the marker description
   */
  makeContentForm_() {
    let form = document.createElement("div");

    //get the marker that is currently being edited to populate the form
    let editedMarker = myMap.editingPermMarker();

    form.appendChild(this.makeTitleInput_(editedMarker));
    form.appendChild(this.makeBodyInput_(editedMarker));
    form.appendChild(this.makeSubmitBtn_());
    return form;
  }

  /**
   * @Private
   * Builds the HTML for the textarea to input the title for the marker
   * @param {PermMarker} editedMarker perm marker that is being edited
   */
  makeTitleInput_(editedMarker) {
    let titleInput = document.createElement("textarea");
    titleInput.id = TempInfoWindow.TITLE_INPUT;
    titleInput.placeholder = TempInfoWindow.DEFAULT_TITLE;

    if (editedMarker) {
      let title = editedMarker.getTitle();
      titleInput.innerHTML = title? title: "";
    }

    return titleInput;
  }

  /**
   * @Private
   * Returns the HTML for the body input textarea for the marker
   * @param {PermMarker} editedMarker perm marker that is being edited
   */
  makeBodyInput_(editedMarker) {
    let bodyInput = document.createElement("textarea");
    bodyInput.id = TempInfoWindow.BODY_INPUT;
    bodyInput.placeholder = TempInfoWindow.DEFAULT_BODY;

    if (editedMarker) {
      let body = editedMarker.getBody();
      bodyInput.innerHTML = body? body: "";
    }

    return bodyInput;
  }

  /**
   * @Private
   * Returns the HTML for the submit button for the form for the markers
   */
  makeSubmitBtn_() {
    let submitBtn = document.createElement("button");
    submitBtn.id = TempInfoWindow.SUBMIT_BTN;
    submitBtn.innerHTML = "Enter";
    return submitBtn;
  }
}
