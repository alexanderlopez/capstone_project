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
     * Puts together the title and body of the info window
     */
    makeRightColumn_() {
      let rightCol = makeEl("div", InfoWindowTemplate.RIGHT_COLUMN);

      let title = makeEl("h1", PermInfoWindow.TITLE_CLASS);
      let currTitle = this.myMarker_.getTitle();
      title.innerHTML = currTitle? currTitle: "";
      rightCol.appendChild(title);

      let body  = makeEl("p", PermInfoWindow.BODY_CLASS);
      let currBody = this.myMarker_.getBody();
      body.innerHTML = currBody? currBody: "";
      rightCol.appendChild(body);

      return rightCol;
    }

    /** No left column visible for perm info windows */
    makeLeftColumn_() {
      return makeEl("div", InfoWindowTemplate.LEFT_COLUMN);
    }
}
