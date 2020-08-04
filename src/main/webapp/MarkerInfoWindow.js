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

class MarkerInfoWindow {

    // classes and  default values for infoWindow components
    static DEFAULT_TITLE = "Title";
    static DEFAULT_BODY = "Body";
    static TITLE_CLASS = "markerTitle";
    static BODY_CLASS = "markerBody";
    static DELETE_ID = "markerDelete";
    static CONTENT_WRAPPER = "contentWrapper";
    static LEFT_COLUMN = "leftColumn";
    static RIGHT_COLUMN = "rightColumn";
    static TITLE_INPUT = "titleInput";
    static BODY_INPUT = "bodyInput";
    static SUBMIT_BTN = "mySubmitBtn";

    /** google.maps.InfoWindow displayed on the page */
    googleInfoWindow;

    myMarker;

    /** Returns the html of the DOM element for the title of the info window */
    makeTitle() {
      let title = document.createElement("h1");
      title.classList.add(MarkerInfoWindow.TITLE_CLASS);
      title.innerHTML = this.myMarker.title;
      return title;
    }

    /** Returns the html of the DOM element for the body of the info window */
    makeBody() {
      let body  = document.createElement("p");
      body.classList.add(MarkerInfoWindow.BODY_CLASS);
      body.innerHTML = this.myMarker.body;
      return body;
    }

    /** Returns the delete button for this marker */
    makeDeleteButton() {//TODO: Finish delete button.
      let btn = document.createElement("button");
      btn.id = MarkerInfoWindow.DELETE_ID;
      return btn;
    }

    /** Puts together info window buttons */
    makeLeftColumn() {
      let leftCol = document.createElement("div");
      leftCol.classList.add(MarkerInfoWindow.LEFT_COLUMN);
      leftCol.appendChild(this.makeDeleteButton());
      return leftCol;
    }

    /** Passes the form input to the marker and refreshes the info window*/
    updateContent() {
      let inputTitle = document.getElementById(MarkerInfoWindow.TITLE_INPUT);
      let inputBody = document.getElementById(MarkerInfoWindow.BODY_INPUT);

      if (inputTitle  && inputBody) {
          this.myMarker.setContent(inputTitle.value, inputBody.value);

          inputTitle.value = "";
          inputBody.value = "";
      }
      this.open(this.myMarker);
    }

    /** Builds the HTML for the input form for the marker description*/
    makeContentForm() {
      let form = document.createElement("div");

      let titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.id = MarkerInfoWindow.TITLE_INPUT;
      titleInput.placeholder = MarkerInfoWindow.DEFAULT_TITLE;

      let bodyInput = document.createElement("textarea");
      bodyInput.id = MarkerInfoWindow.BODY_INPUT;
      bodyInput.placeholder = MarkerInfoWindow.DEFAULT_BODY;

      let submitBtn = document.createElement("button");
      submitBtn.id = MarkerInfoWindow.SUBMIT_BTN;
      submitBtn.innerHTML = "Enter";

      form.appendChild(titleInput);
      form.appendChild(bodyInput);
      form.appendChild(submitBtn);
      return form;
    }

    /**
     * Puts together the title and body of the info window
     */
    makeRightColumn() {
      let rightCol = document.createElement("div");
      rightCol.classList.add(MarkerInfoWindow.RIGHT_COLUMN);
      if (this.myMarker.isNew()) {
        rightCol.appendChild(this.makeContentForm());
      } else {
        rightCol.appendChild(this.makeTitle());
        rightCol.appendChild(this.makeBody());
      }
      return rightCol;
    }

    /**
     * Returns the html string to be displayed in this info window
     */
    makeContent() {
      let contentWrapper = document.createElement("div");
      contentWrapper.classList.add(MarkerInfoWindow.CONTENT_WRAPPER);
      contentWrapper.appendChild(this.makeLeftColumn());
      contentWrapper.appendChild(this.makeRightColumn());
      let result = contentWrapper.outerHTML;
      contentWrapper.remove();
      return result;
    }

    /** Closes the displayed info window */
    close() {
      this.googleInfoWindow.close();
      this.googleInfoWindow.setContent(null);
    }

    /** Sets the click event on the delete button*/
    setEvents() {
      let btn = document.getElementById(MarkerInfoWindow.DELETE_ID);
      btn.onclick = () => myMap.deletePermMarker();

      let submitBtn = document.getElementById(MarkerInfoWindow.SUBMIT_BTN);
      if (submitBtn) {
        submitBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          this.updateContent();
        });
      }
    }

    /** Displays the info window on the map */
    open(myMarker) {
      this.close();
      this.myMarker = myMarker;
      this.googleInfoWindow.setContent(this.makeContent());
      this.googleInfoWindow.open(myMap.googleMap, this.myMarker.googleMarker);
    }

    /**
     * @param {PermMarker} marker marker associated with this info window
     */
    constructor() {
      this.googleInfoWindow = new google.maps.InfoWindow();
      this.googleInfoWindow.addListener('domready', () => {
        this.setEvents();
      });
    }
}
