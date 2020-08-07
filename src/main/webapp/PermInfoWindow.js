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

/** Creates an info window for clients to see a marker's description */
class PermInfoWindow extends InfoWindowTemplate {

    static TITLE_CLASS = "markerTitle";
    static BODY_CLASS = "markerBody";

    constructor() {
      super();
      this.googleInfoWindow_.addListener('domready', () => {
          this.setEditEvent_();
        });
    }

    /** Sets edit button click event to edit this permanent marker */
    setEditEvent_() {
      let editBtn = document.getElementById(InfoWindowTemplate.EDIT_ID);
      editBtn.onclick = () => myMap.editPermMarker(this.myMarker_);
    }

    /**
     * Opens and customizes this info window for this permanent marker
     * @param {PermMarker} permMarker marker that needs an info window to open
     */
    open(permMarker) {
      this.myMarker_ = permMarker;
      super.open();
    }

    /**
     * @Private
     * Returns the html of the DOM element for the title of the info window
     */
    makeTitle_() {
      let title = document.createElement("h1");
      title.classList.add(PermInfoWindow.TITLE_CLASS);
      title.innerHTML = this.myMarker_.getTitle();
      return title;
    }

    /**
     * @Private
     * Returns the html of the DOM element for the body of the info window
     */
    makeBody_() {
      let body  = document.createElement("p");
      body.classList.add(PermInfoWindow.BODY_CLASS);
      body.innerHTML = this.myMarker_.getBody();
      return body;
    }


    /**
     * @Private
     * Puts together the title and body of the info window
     */
    makeRightColumn_() {
      let rightCol = document.createElement("div");
      rightCol.classList.add(InfoWindowTemplate.RIGHT_COLUMN);
      rightCol.appendChild(this.makeTitle_());
      rightCol.appendChild(this.makeBody_());
      return rightCol;
    }
}
