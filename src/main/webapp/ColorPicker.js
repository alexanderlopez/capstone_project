class ColorPicker {

  /** All the possible colors that can be chosen */
  static colors_ = {
      yellow: "#FDF569",
      red: "#EA4335",
      purple: "#8E67FD",
      pink: "#E661AC",
      orange: "#FF9900",
      blue: "#6991FD",
      green: "#00E64D",
      lightblue: "#67DDDD"
  }

  /** The default color that should be used */
  static DEFAULT_COLOR = "red";

  /** the prefix of the url to access marker icons */
  static markerIconUrl = "http://maps.google.com/mapfiles/ms/micons/";

  /** IDs and classnames for color picker DOM elements */
  static COLOR_PICKER = "colorPicker";
  static COLOR_BTN = "colorBtn";
  static PICKED_COLOR = "picked";

  /**
   * Returns the url of the icon of a marker with a dot with the given color
   * @param {String} color the color that marker icon should be
   */
  static getPermMarkerIcon(color) {
    let urlColor = color == "lightblue"? "ltblue": color;
    return ColorPicker.markerIconUrl+urlColor+"-dot.png";
  }

  /**
   * Returns the url of the icon of a marker with no dot with the given color
   * @param {String} color the color that marker icon should be
   */
  static getTempMarkerIcon(color) {
    return ColorPicker.markerIconUrl+color+".png";
  }

  /**
   * @Private
   * Adds click events to all the existing color picker options
   * @param {*} the function that the new color should be applied to
   */
  static setColorChangeEvent(callback) {
      let colorBtns =
          document.getElementsByClassName(ColorPicker.COLOR_BTN);
      for (const btn of colorBtns) {
        btn.addEventListener('click',
            () => this.switchSelectedColor_(btn, callback));
      }
  }

  /**
   * @Private
   * Change which color is currently selected
   * @param {Element} clickedBtn the color btn that was just clicked
   * @param {*} callback function to call on the new color string
   */
   static switchSelectedColor_(clickedBtn, callback) {
     let pickedClass = ColorPicker.PICKED_COLOR;
     let prevSelectedBtn = this.getSelectedColor();

     prevSelectedBtn.classList.remove(pickedClass);
     clickedBtn.classList.add(pickedClass);

     let newColor = clickedBtn.id;
     callback(newColor);
   }

   /** Returns the color button currently selected */
   static getSelectedColor() {
     return document.getElementsByClassName(ColorPicker.PICKED_COLOR)[0];
   }

   /** Returns the name of the color currently selected */
   static getSelectedColorName() {
     return ColorPicker.getSelectedColor().id;
   }

   /**
    * Returns the HTML of a color picker
    * @param {String} prevSelectedColor color that should already be selected
    */
   static buildPicker(prevSelectedColor) {
     let pickerWrapper = makeEl("div", /* class= */ null,
          ColorPicker.COLOR_PICKER);

     let colorNames = Object.keys(ColorPicker.colors_);

     colorNames.forEach(colorName => {
       let colorBtn =
              ColorPicker.makeColorBtn_(colorName, prevSelectedColor)
       pickerWrapper.appendChild(colorBtn);
     });

     return pickerWrapper;
   }

   /**
    * @Private
    * Returns a color button that displays a certain color and checks if this
    * color should be pre-selected
    * @param {String} colorName the name of the color for this button
    * @param {Object} colorMap an object of color names mapped to color codes
    * @param {String} prevSelectedColor the color that has already been selected
    */
   static makeColorBtn_(colorName, prevSelectedColor) {
     let colorCode = ColorPicker.colors_[colorName];
     let colorBtn = makeEl("button", ColorPicker.COLOR_BTN,
          colorName);

     colorBtn.style.backgroundColor = colorCode;

     if (colorName === prevSelectedColor) {
       colorBtn.classList.add(ColorPicker.PICKED_COLOR);
     }

     return colorBtn;
   }

   /**
    * Sets the currently selected color to the given color name
    * @param {String} colorName the name of the color to be selected
    * @param {?*} callback function to call on the new color string
    */
   static setSelectedColor(colorName, callback) {
     let colorBtn = document.getElementById(colorName);
     ColorPicker.switchSelectedColor_(colorBtn, callback);
   }
}
