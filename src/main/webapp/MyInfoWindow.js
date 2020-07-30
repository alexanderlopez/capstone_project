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

class MyInfoWindow {

    // classes and  default values for infoWindow components
    static DEFAULT_TITLE = "Title";
    static DEFAULT_BODY = "Body";
    static TITLE_CLASS = "markerTitle";
    static BODY_CLASS = "markerBody";

    /** google.maps.InfoWindow displayed on the page */
    googleInfoWindow;

    /** MyMarker object associated with this info window */
    myMarker;

    /** Returns the html of the DOM element for the title of the info window */
    makeTitle() {
      let title = document.createElement("h1");
      title.classList.add(MyInfoWindow.TITLE_CLASS);
      title.innerHTML = MyInfoWindow.DEFAULT_TITLE;
      return title.outerHTML;
    }

    /** Returns the html of the DOM element for the body of the info window */
    makeBody() {
      let body  = document.createElement("p");
      body.classList.add(MyInfoWindow.BODY_CLASS);
      body.innerHTML = MyInfoWindow.DEFAULT_BODY;
      return body.outerHTML;
    }

    /** Returns the html string to be displayed in this info window */
    makeContent() {
      return this.makeTitle()+this.makeBody();
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
     * @param {MyMarker} marker marker associated with this info window
     */
    constructor(myMarker) {
      this.myMarker = myMarker;
      let myContent = this.makeContent();
      this.googleInfoWindow = new google.maps.InfoWindow({
        content: myContent
      });
    }
}
