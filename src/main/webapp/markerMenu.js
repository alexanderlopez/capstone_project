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

/** boolean whether the menu is open or not */
var menuOpen;

const MD_LIST_ITEM = "mdc-list-item";
const MD_TEXT = "__text";
const MD_RIPPLE = "__ripple";

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
    menuList.appendChild(colorWrapper);
    colorHeaders[color] = colorWrapper;
  });
}

/**
 * Builds a sublist for a color category
 * @param {String} color the color name of this group
 */
function makeColorList(color) {
    let li = makeEl("li", MD_LIST_ITEM);
    if (Object.keys(colorHeaders).length == "0") {
      li.tabIndex="0";
    }

    let ripple = makeEl("span", MD_LIST_ITEM+MD_RIPPLE);

    let el = makeEl("span", MD_LIST_ITEM+MD_TEXT);
    el.innerHTML = color;

    li.appendChild(ripple);
    li.appendChild(el);

    return li;
}

/** Opens and closes the marker menu */
function toggleMarkerMenu() {
  if (menuOpen) {
    openBtn.style.display='none';
    closeBtn.style.display='block';
    menu.classList.add("open");
  } else {
    openBtn.style.display='block';
    closeBtn.style.display='none';
    menu.classList.remove("open");
  }

  menuOpen = !menuOpen;
}
