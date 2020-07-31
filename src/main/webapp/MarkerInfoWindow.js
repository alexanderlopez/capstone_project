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
    static DELETE_CLASS = "markerDelete";
    static CONTENT_WRAPPER = "contentWrapper";
    static LEFT_COLUMN = "leftColumn";
    static RIGHT_COLUMN = "rightColumn";

    /** google.maps.InfoWindow displayed on the page */
    googleInfoWindow;

    /** PermMarker object associated with this info window */
    myMarker;

    /** Returns the html of the DOM element for the title of the info window */
    makeTitle() {
      let title = document.createElement("h1");
      title.classList.add(MarkerInfoWindow.TITLE_CLASS);
      title.innerHTML = MarkerInfoWindow.DEFAULT_TITLE;
      return title;
    }

    /** Returns the html of the DOM element for the body of the info window */
    makeBody() {
      let body  = document.createElement("p");
      body.classList.add(MarkerInfoWindow.BODY_CLASS);
      body.innerHTML = MarkerInfoWindow.DEFAULT_BODY;
      return body;
    }

    /** Returns the delete button for this marker */
    makeDeleteButton() {//TODO: Finish delete button.
      let btn = document.createElement("div");
      btn.setAttribute("role", "button");
      btn.classList.add(MarkerInfoWindow.DELETE_CLASS);
      return btn;
    }

    /** Puts together info window buttons */
    makeLeftColumn() {
      let leftCol = document.createElement("div");
      leftCol.classList.add(MarkerInfoWindow.LEFT_COLUMN);
      leftCol.appendChild(this.makeDeleteButton());
      return leftCol;
    }

    /** Puts together the title and body of the info window */
    makeRightColumn() {
      let rightCol = document.createElement("div");
      rightCol.classList.add(MarkerInfoWindow.RIGHT_COLUMN);
      rightCol.appendChild(this.makeTitle());
      rightCol.appendChild(this.makeBody());
      return rightCol;
    }

    /** Returns the html string to be displayed in this info window */
    makeContent() {
      let contentWrapper = document.createElement("div");
      contentWrapper.classList.add(MarkerInfoWindow.CONTENT_WRAPPER);
      contentWrapper.appendChild(this.makeLeftColumn());
      contentWrapper.appendChild(this.makeRightColumn());
      return contentWrapper.outerHTML;
    }

    /** Displays the info window on the map */
    open() {
      this.googleInfoWindow.open(myMap.googleMap, this.myMarker.googleMarker);
    }

    /** Closes the displayed info window */
    close() {
      this.googleInfoWindow.close();
    }

    /**
     * @param {PermMarker} marker marker associated with this info window
     */
    constructor(myMarker) {
      this.myMarker = myMarker;
      // myMarker must be initialized before makeContent() is called
      let myContent = this.makeContent();
      this.googleInfoWindow = new google.maps.InfoWindow({
        content: myContent
      });
    }
}
