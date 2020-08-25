/** button to open and close the marker menu */
var toggleMenuBtn;

/** collapsible menu wrapper */
var menu;

/** menu component contianing all list items */
var menuList;

/**
 * map of color names to their header element, colored-markers wrapper,
 * checkbox input, the marker ids in their group, and the number of
 * those markers that are currently visible
 */
var markerGroups = {};

/**
 * object of marker ids to their marker element, menu item, and checkbox
 * input
 */
var storedMarkers = {};

// Material Design classnames and element content
const LIST = "mdc-list";
const FORM = "mdc-form-field";
const ITEM = "-item";
const TEXT = "__text";
const RIPPLE = "__ripple";
const BACKGROUND = "__background";
const DIVIDER = "-divider";
const INPUT = "__native-control";
const ICON = "material-icons";
const OPEN_ICON = "expand_more";
const CHECKBOX = "mdc-checkbox";
const CHECKBOX_BACKGROUND =
`<svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
  <path class="mdc-checkbox__checkmark-path" fill="none"
        d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
</svg>
<div class="mdc-checkbox__mixedmark"></div>`

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SETUP

/** Initialized variables relevent to marker menu maintenance */
function initMarkerMenu() {
  menuOpen = true;
  getMenuElements();
  setupMarkerMenu();
}

/** Stores relevant DOM elements for marker menu maintenance */
function getMenuElements() {
  let getEl = (id) => {return document.getElementById(id)};

  toggleMenuBtn = getEl("markerMenuClose");
  menu = getEl("markerMenu");
  menuList = getEl("markerMenuList");
}

/** Builds and stores all the color category wrappers */
function setupMarkerMenu() {
  let colors = ColorPicker.getColorNames();

  colors.forEach((color) => {
    let group = makeColorGroup(color);

    markerGroups[color] = {
      header: group.header,
      wrapper: group.wrapper,
      checkbox: group.checkbox,
      markerIds: new Set(),
      markersVisible: 0
    };
  });
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SETUP MAKERS

/** Builds a default item for an empty list category */
function makeDummyElement() {
  let elComponents = makeListElement("No markers of this color");
  let el = elComponents.item;
  el.tabIndex="0";
  el.classList.add("dummy");

  return el;
}

/**
 * Returns a new header, wrapper, and checkbox DOM elements for this color group
 * @param {String} color the color name of this group
 */
function makeColorGroup(color) {
  let divider = makeEl("hr", LIST+DIVIDER);

  // function to be called if the checkbox state changes
  let checkboxCallback =
      (isChecked) => toggleMarkerColorGroup(color, isChecked);

  // make color group header components
  let headerComponents = makeListElement(color, checkboxCallback);
  let groupHeader = headerComponents.item;
  let newCheckbox = headerComponents.checkbox;

  let markerIcon = makeIconBtn("place", "markerIcon");
  markerIcon.style.color = ColorPicker.getColorCode(color);
  groupHeader.appendChild(markerIcon);

  // add toggle button to group header
  let iconBtnCallback = () => collapseMenuGroup(color);
  let iconBtn = makeIconBtn(OPEN_ICON, "toggleIcon", iconBtnCallback);
  groupHeader.appendChild(iconBtn);

  // build the group content and add dummy element
  let groupWrapper = makeEl("ul", LIST);
  let dummyItem = makeDummyElement();
  groupWrapper.append(dummyItem);

  // add new components in appropriate order to the menu list
  menuList.appendChild(divider);
  menuList.appendChild(groupHeader);
  menuList.appendChild(groupWrapper);

  // wrap resulting content in a object to be returned
  let result = {
    header: groupHeader,
    wrapper: groupWrapper,
    checkbox: newCheckbox
  }

  return result;
}

/**
 * Returns a MDC icon element with a click property
 * @param {String} name the name of the icon
 * @param {String} iconClass the classname for the icon
 * @param {*} callback the function to be called onclick
 */
function makeIconBtn(name, iconClass, callback) {
  let icon = makeEl("span", ICON);
  icon.classList.add(iconClass);
  icon.innerHTML = name;
  icon.addEventListener('click', callback);
  return icon;
}

/**
 * Returns the list elements and checkbox DOM elements of a new list element
 * The checkbox is not required so if no callback is given, no checkbox is added
 * @param {String} name the name of the list element
 * @param {?*} callback function to be called when the checkbox state changes
 */
function makeListElement(name, callback) {
  let listItem = makeEl("li", LIST+ITEM);

  // make and add checkbox if a callback is given
  let checkboxInput;
  if (callback) {
    let checkboxInfo = makeCheckbox(callback);
    let newCheckbox = checkboxInfo.wrapper;
    checkboxInput = checkboxInfo.checkbox;
    listItem.appendChild(newCheckbox);
  }

  // add the list item name
  let itemText = makeEl("span", LIST+ITEM+TEXT);
  itemText.innerHTML = name? name: "No name";
  listItem.appendChild(itemText);

  // wrap resulting elements
  let result = {
    item: listItem,
    checkbox: checkboxInput
  }

  return result;
}

/**
 * Returns a MDC checkbox and its input element with an onclick listener
 * @param {*} callback the function to be called with new checkbox states
 */
function makeCheckbox(callback) {
  let form = makeEl("div", FORM);
  let checkbox = makeEl("div", CHECKBOX);

  let input = makeEl("input", CHECKBOX+INPUT);
  input.type = "checkbox";
  input.checked = true;
  checkbox.appendChild(input);

  let background = makeEl("div", CHECKBOX+BACKGROUND);
  background.innerHTML = CHECKBOX_BACKGROUND;
  checkbox.appendChild(background);

  let ripple = makeEl("div", CHECKBOX+RIPPLE);
  checkbox.appendChild(ripple);

  form.appendChild(checkbox);
  form.addEventListener('click', () => callback(input.checked));

  let result = {
    wrapper: form,
    checkbox: input
  }

  return result;
}

/**
 * Returns a new menu item and its checkbox for a given marker
 * @param {permMarker} marker the marker for which to make a new menu item
 */
function makeMarkerMenuItem(marker) {
  let title = marker.getTitle();
  let color = marker.getColorName();

  // Build the menu item and checkbox
  let callback = (isChecked) => toggleMarker(marker, isChecked)
  let elementComponents = makeListElement(title, callback);
  let menuItem = elementComponents.item;

  menuItem.classList.add("marker-item");

  // make the marker icon button with the same color as the PermMarker
  let markerCallback = () => goToMarker(marker);
  let markerIcon = makeIconBtn("north_east", "goToIcon", markerCallback);
  menuItem.appendChild(markerIcon);

  return elementComponents;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ACTIONS

/**
 * Removes and returns a list's dummy element if it exists
 * @param {Object} groupDetails the group details that could have a dummy item
 */
function removeDummyElement(groupDetails) {
  if (groupDetails.markerIds.size === 0) {
    let wrapper = groupDetails.wrapper;
    let dummy = wrapper.firstElementChild;
    wrapper.removeChild(dummy);
    dummy.remove();
    return dummy;
  }
}

/**
 * Opens and closes the wrapper for markers under the given header
 * @param {String} color the color of the group to be toggled
 */
function collapseMenuGroup(color) {
  let groupDetails = markerGroups[color];
  let groupHeader = groupDetails.header;
  let groupWrapper = groupDetails.wrapper;

  let atMaxHeight = groupWrapper.style.maxHeight;
  let maxHeight = `${groupWrapper.scrollHeight}px`;
  groupWrapper.style.maxHeight = atMaxHeight? null: maxHeight;

  let toggleIcon = groupHeader.getElementsByClassName("toggleIcon")[0];
  toggleIcon.classList.toggle("rotate");
}

/**
 * Updates the height of a menu group if it is open
 * @param {String} color the color name of the menu group
 */
function updateMenuGroupHeight(color) {
  let groupDetails = markerGroups[color];
  let groupWrapper = groupDetails.wrapper;

  let maxHeight = `${groupWrapper.scrollHeight}px`;
  let currHeight = groupWrapper.style.maxHeight;
  if (currHeight && (currHeight !== maxHeight)) {
    groupWrapper.style.maxHeight = maxHeight;
  }
}

/**
 * Changes the visibility of all the markers in the group with the given color
 * @param {String} color the color name for this group
 * @param {boolean} showGroup whether the group should be displayed or hidden
 */
function toggleMarkerColorGroup(color, showGroup) {
  let colorGroupDetails = markerGroups[color];

  let markerIds = colorGroupDetails.markerIds;
  markerIds.forEach((id) => changeMarkerVisibility(id, showGroup));

  let groupCheckbox = colorGroupDetails.checkbox;
  groupCheckbox.checked = showGroup;
}

/**
 * Changes a marker's visibility on the map and updates the menu checkboxes
 * accordingly
 * @param {permMarker} marker the marker to be shown/hidden
 * @param {boolean} showMarker whether the show or hide the marker
 */
function toggleMarker(marker, showMarker) {
  let markerColor = marker.getColorName();
  changeMarkerVisibility(marker.getId(), showMarker);
  updateGroupCheckbox(markerColor, showMarker);
}

/**
 * Changes the visibility of a marker on the map and updates its checkbox and
 * its menu group visibility count accordingly
 * @param {permMarker} markerId the markerId to be shown/hidden
 * @param {boolean} showMarker whether to show or hide the marker
 */
function changeMarkerVisibility(markerId, showMarker) {
  let marker = myMap.getPermMarker(markerId);
  let groupColor = marker.getColorName();

  let newMap = showMarker? myMap.getGoogleMap(): null;
  marker.setMap(newMap);

  let checkbox = storedMarkers[markerId].checkbox;
  checkbox.checked = showMarker;

  let change = showMarker? 1: -1;
  markerGroups[groupColor].markersVisible += change;
}

/**
 * Changes the checkbox for a color group when a marker inside this group was
 * toggled
 * @param {String} color the color name of the group
 * @param {boolean} markerShown whether the marker was shown or hidden
 */
function updateGroupCheckbox(color, markerShown) {
  let groupDetails = markerGroups[color];
  let groupCheckbox = groupDetails.checkbox;

  if (!markerShown) {
    groupCheckbox.checked = false;
  } else if (groupDetails.markersVisible === groupDetails.markerIds.size){
      groupCheckbox.checked = true;
  }
}

/**
 * Builds a list item for the perm marker and adds it to a color group
 * @param {PermMarker} marker the marker to be added to the list
 */
function addToMarkerMenu(marker) {
  let markerId = marker.getId();
  let markerColor = marker.getColorName();

  let menuItemComponents = makeMarkerMenuItem(marker);
  let menuItem = menuItemComponents.item;

  let groupDetails = markerGroups[markerColor];
  let wrapper = groupDetails.wrapper;

  let isFirstElement = removeDummyElement(groupDetails);
  if(isFirstElement) {
    menuItem.tabIndex = "0";
  }

  storedMarkers[markerId] = menuItemComponents;
  wrapper.appendChild(menuItem);
  updateMenuGroupHeight(markerColor);

  groupDetails.markersVisible += 1;
  groupDetails.markerIds.add(markerId);
}

/**
 * If the marker is visible on the map, pans the map to the marker and opens
 * its information window
 * @param {PermMarker} marker the marker to be highlighted
 */
function goToMarker(marker) {
  if (marker.isVisible()) {
      myMap.highlightMarker(marker);
  }
}

/**
 * Removes this marker's existing menu item and updates the marker's group
 * @param {PermMarker} marker the marker to look for
 */
function removeMarkerFromMenu(marker) {
  let markerId = marker.getId();
  let markerDetails = storedMarkers[markerId];
  let item = markerDetails.item;
  let color = marker.getColorName();

  let groupDetails = markerGroups[color];
  groupDetails.markerIds.delete(markerId);
  groupDetails.markersVisible -= 1;

  let wrapper = groupDetails.wrapper;
  wrapper.removeChild(item);
  item.remove();
  delete storedMarkers[markerId];

  if (groupDetails.markerIds.size === 0) {
    wrapper.appendChild(makeDummyElement());
  }
  updateGroupCheckbox(marker.getColorName(), /* showGroup= */ true);
  updateMenuGroupHeight(color);
}

/** Closes the marker menu */
function closeMarkerMenu() {
  toggleMenuBtn.classList.remove("rotate");
  menu.classList.remove("open");
}

/** Opens and closes the marker menu */
function toggleMarkerMenu() {
  toggleMenuBtn.classList.toggle("rotate");
  menu.classList.toggle("open");
}
