/** button to open the marker menu */
var openBtn;

/** button to close the marker menu */
var closeBtn;

/** collapsible menu wrapper */
var menu;

/** menu component contianing all list items */
var menuList;

/** map of color names to colored-markers wrapper */
var colorHeaders = {};

/** map of markers to their wrapper and menu item  */
var storedMarkers = {};

/** boolean whether the menu is open or not */
var menuOpen;

const LIST = "mdc-list";
const ITEM = "-item";
const GROUP = "-group";
const SUBHEADER = "__subheader";
const TEXT = "__text";
const RIPPLE = "__ripple";

/** Initialized variables relevent to marker menu maintenance */
function initMarkerMenu() {
  menuOpen = true;
  getMenuElements();
  setupMarkerMenu();
}

/** Stores relevant DOM elements for marker menu maintenance */
function getMenuElements() {
  let getEl = (id) => {return document.getElementById(id)};

  openBtn = getEl("markerMenuOpen");
  closeBtn = getEl("markerMenuClose");
  menu = getEl("markerMenu");
  menuList = getEl("markerMenuList");
}

/** Builds and stores all the color category wrappers */
function setupMarkerMenu() {
  let colors = ColorPicker.getColorNames();
  colors.forEach((color) => {
    let colorWrapper = makeColorList(color);
    colorHeaders[color] = colorWrapper;
  });
}

/**
 * Builds a sublist for a color category
 * @param {String} color the color name of this group
 */
function makeColorList(color) {
    let header = makeEl("h3", LIST+GROUP+SUBHEADER);
    header.innerHTML = color;

    let group = makeEl("ul", LIST);

    let first = makeDummyElement();
    group.append(first);

    menuList.appendChild(header);
    menuList.appendChild(group);

    return group;
}

/** Builds a default item for an empty list category */
function makeDummyElement() {
  let el = makeListElement("No markers of this color");
  el.tabIndex="0";
  el.classList.add("dummy");

  return el;
}

/**
 * Returns and removes a list's dummy element if applicable
 * @param {Element} wrapper DOM element to check for a dummy
 */
function removeDummyElement(wrapper) {
  let potentialDummy = wrapper.firstChild;
  if (potentialDummy.classList.contains("dummy")) {
    wrapper.removeChild(potentialDummy);
    potentialDummy.remove();
    return potentialDummy;
  }
}

/**
 * Returns an individual list element with the given name
 * @param {String} name the name of the list element
 */
function makeListElement(name) {
  let li = makeEl("li", LIST+ITEM);

  let ripple = makeEl("span", LIST+ITEM+RIPPLE);

  let el = makeEl("span", LIST+ITEM+TEXT);
  el.innerHTML = name? name: "No name";

  li.appendChild(ripple);
  li.appendChild(el);

  return li;
}

/**
 * Builds a list item for the perm marker and adds it to a color group
 * @param {PermMarker} marker the marker to be added to the list
 */
function addToMarkerMenu(marker) {
  if (marker in storedMarkers) {
    removeMarkerFromMenu(marker);
  }

  let wrapper = colorHeaders[marker.getColorName()];

  let title = marker.getTitle();
  let li = makeListElement(title);
  li.onclick = () => myMap.highlightMarker(marker);

  let oneListElement = wrapper.childNodes.length === 1;
  if(oneListElement && removeDummyElement(wrapper)) {
    li.tabIndex="0";
  }

  storedMarkers[marker.getId()] = {
    group: wrapper,
    item: li
  }

  wrapper.appendChild(li);
}

/**
 * Removes this marker's existing menu item if applicable
 * @param {PermMarker} marker the marker to look for
 */
function removeMarkerFromMenu(marker) {
  let details = storedMarkers[marker.getId()];
  let wrapper = details.group;
  let item = details.item;

  wrapper.removeChild(item);
  item.remove();
  delete storedMarkers[marker];

  if (wrapper.childNodes.length === 0) {
    wrapper.appendChild(makeDummyElement());
  }
}

/** Closes the marker menu */
function closeMarkerMenu() {
  menuOpen = true;
  toggleMarkerMenu();
}

/** Opens and closes the marker menu */
function toggleMarkerMenu() {
  if (menuOpen) {
    openBtn.style.display='block';
    closeBtn.style.display='none';
    menu.classList.remove("open");
  } else {
    openBtn.style.display='none';
    closeBtn.style.display='block';
    menu.classList.add("open");
  }

  menuOpen = !menuOpen;
}
