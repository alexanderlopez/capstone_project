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
    static EDIT_ID = "markerEdit";
    static CONTENT_WRAPPER = "contentWrapper";
    static LEFT_COLUMN = "leftColumn";
    static RIGHT_COLUMN = "rightColumn";
    static TITLE_INPUT = "titleInput";
    static BODY_INPUT = "bodyInput";
    static SUBMIT_BTN = "mySubmitBtn";

    /** google.maps.InfoWindow displayed on the page */
    googleInfoWindow_;

    /** PermMarker object this info window is anchored to */
    myMarker_;

    /**
     * @Private
     * Returns the html of the DOM element for the title of the info window
     */
    makeTitle_() {
      let title = document.createElement("h1");
      title.classList.add(MarkerInfoWindow.TITLE_CLASS);
      title.innerHTML = this.myMarker_.getTitle();
      return title;
    }

    /**
     * @Private
     * Returns the html of the DOM element for the body of the info window
     */
    makeBody_() {
      let body  = document.createElement("p");
      body.classList.add(MarkerInfoWindow.BODY_CLASS);
      body.innerHTML = this.myMarker_.getBody();
      return body;
    }

    /**
     * @Private
     * Returns the delete button for this marker
     */
    makeDeleteButton_() {
      let btn = document.createElement("button");
      btn.id = MarkerInfoWindow.DELETE_ID;
      return btn;
    }

    /**
     * @Private
     * Returns the edit button for this marker
     */
    makeEditButton_() {
      let btn = document.createElement("button");
      btn.id = MarkerInfoWindow.EDIT_ID;
      return btn;
    }

    /**
     * @Private
     * Puts together info window buttons
     */
    makeLeftColumn_() {
      let leftCol = document.createElement("div");
      leftCol.classList.add(MarkerInfoWindow.LEFT_COLUMN);
      leftCol.appendChild(this.makeDeleteButton_());
      leftCol.appendChild(this.makeEditButton_());
      return leftCol;
    }

    /**
     * @Private
     * Passes the form input to the marker and refreshes the info window
     */
    updateContent_() {
      let inputTitle = document.getElementById(MarkerInfoWindow.TITLE_INPUT);
      let inputBody = document.getElementById(MarkerInfoWindow.BODY_INPUT);

      if (inputTitle) {
          this.myMarker_.setTitle(inputTitle.value);
          this.myMarker_.setEditing(false);
          inputTitle.value = "";
      }

      if (inputBody) {
        this.myMarker_.setBody(inputBody.value);
        this.myMarker_.setEditing(false);
        inputBody.value = "";
      }

      this.open(this.myMarker_);
    }

    /**
     * @Private
     * Builds the HTML for the input form for the marker description
     */
    makeContentForm_() {
      let form = document.createElement("div");

      let titleInput = document.createElement("textarea");
      titleInput.id = MarkerInfoWindow.TITLE_INPUT;
      titleInput.placeholder = MarkerInfoWindow.DEFAULT_TITLE;

      let bodyInput = document.createElement("textarea");
      bodyInput.id = MarkerInfoWindow.BODY_INPUT;
      bodyInput.placeholder = MarkerInfoWindow.DEFAULT_BODY;

      // if this marker not new, populate the form with the current information
      if (this.myMarker_.isEditing()) {
        let title = this.myMarker_.getTitle();
        titleInput.innerHTML = title? title: "";

        let body = this.myMarker_.getBody();
        bodyInput.innerHTML = body? body: "";
      }

      let submitBtn = document.createElement("button");
      submitBtn.id = MarkerInfoWindow.SUBMIT_BTN;
      submitBtn.innerHTML = "Enter";

      form.appendChild(titleInput);
      form.appendChild(bodyInput);
      form.appendChild(submitBtn);
      return form;
    }

    /**
     * @Private
     * Puts together the title and body of the info window
     */
    makeRightColumn_() {
      let rightCol = document.createElement("div");
      rightCol.classList.add(MarkerInfoWindow.RIGHT_COLUMN);
      if (this.myMarker_.isEditing()) {
        rightCol.appendChild(this.makeContentForm_());
      } else {
        rightCol.appendChild(this.makeTitle_());
        rightCol.appendChild(this.makeBody_());
      }
      return rightCol;
    }

    /**
     * @Private
     * Returns the html string to be displayed in this info window
     */
    makeContent_() {
      let contentWrapper = document.createElement("div");
      contentWrapper.classList.add(MarkerInfoWindow.CONTENT_WRAPPER);
      contentWrapper.appendChild(this.makeLeftColumn_());
      contentWrapper.appendChild(this.makeRightColumn_());
      let result = contentWrapper.outerHTML;
      contentWrapper.remove();
      return result;
    }

    /** Closes the displayed info window */
    close() {
      this.googleInfoWindow_.close();
      this.googleInfoWindow_.setContent(null);
    }

    /**
     * @Private
     * Sets the click event for the information window buttons*/
    setEvents_() {
      let deleteBtn = document.getElementById(MarkerInfoWindow.DELETE_ID);
      deleteBtn.onclick = () => myMap.deletePermMarker(this.myMarker_);

      let editBtn = document.getElementById(MarkerInfoWindow.EDIT_ID);
      editBtn.onclick = () => {
        this.myMarker_.setEditing(true);
        this.open(this.myMarker_);
      };

      let submitBtn = document.getElementById(MarkerInfoWindow.SUBMIT_BTN);
      if (submitBtn) {
        submitBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          this.updateContent_();
        });
      }
    }

    /**
     * Displays the info window on the map
     * @param {PermMarker} marker marker associated with this info window
     */
    open(myMarker) {
      this.close();
      this.myMarker_ = myMarker;
      this.googleInfoWindow_.setContent(this.makeContent_());
      this.googleInfoWindow_.open
          (myMap.getGoogleMap(), this.myMarker_.getGoogleMarker());
    }

    constructor() {
      this.googleInfoWindow_ = new google.maps.InfoWindow();
      this.googleInfoWindow_.addListener('domready', () => {
        this.setEvents_();
      });
    }
}
