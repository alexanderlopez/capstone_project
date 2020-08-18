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
}
