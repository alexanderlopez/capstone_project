// Material Design classnames and element content
const LIST = "mdc-list";
const FORM = "mdc-form-field";
const ITEM = "-item";
const TEXT = "__text";
const PRIMARY_TEXT = "__primary-text";
const SECONDARY_TEXT = "__secondary-text";
const RIPPLE = "__ripple";
const META = "__meta";
const BACKGROUND = "__background";
const DIVIDER = "-divider";
const INPUT = "__native-control";
const ICON = "material-icons";
const ICON_BUTTON = "mdc-icon-button";
const OPEN_ICON = "expand_more";
const CHECKBOX = "mdc-checkbox";
const CHECKBOX_BACKGROUND =
`<svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
  <path class="mdc-checkbox__checkmark-path" fill="none"
        d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
</svg>
<div class="mdc-checkbox__mixedmark"></div>`

/**
 * Returns a material design text element with primary and secondary text
 * @param {String} primary the primary text
 * @param {String} secondary the secondary text
 */
function makeMaterialTextElement(primary, secondary) {
  let textItem = makeEl("span", LIST+ITEM+TEXT);

  let primaryTextItem = makeEl("span", LIST+ITEM+PRIMARY_TEXT);
  primaryTextItem.innerText = primary;
  textItem.appendChild(primaryTextItem);

  let secondaryTextItem = makeEl("span", LIST+ITEM+SECONDARY_TEXT);
  secondaryTextItem.innerText = secondary;
  textItem.appendChild(secondaryTextItem);

  return textItem;
}

/**
 * Returns a MDC icon element with a click property
 * @param {String} name the name of the icon
 * @param {String} iconClass the classname for the icon
 * @param {*} callback the function to be called onclick
 */
function makeMaterialIconBtn(name, iconClass, callback) {
  let icon = makeEl("span", ICON);
  icon.classList.add(iconClass);
  icon.innerHTML = name;
  icon.addEventListener('click', callback);
  return icon;
}

/**
 * Returns a MDC checkbox and its input element with an onclick listener
 * @param {*} callback the function to be called with new checkbox states
 */
function makeMaterialCheckbox(callback) {
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
