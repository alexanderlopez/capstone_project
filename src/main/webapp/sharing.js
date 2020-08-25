var overlay;

var emailInput;

var emailBank;

var memberEmails = new Set();

var shareEmails = {};

/** sets */
function initSharing() {
  overlay = document.getElementById("share-popup");
  emailInput = textFields[0];
  emailBank = document.getElementById("share-list");
  setMapShareEvents();
  loadSharedUsers();
}

function setMapShareEvents() {
  addClickEvent("shareBtnWrapper", () => openSharePopup());
  addClickEvent("share-add-button", () => addEmail());
  addClickEvent("share-button", () => submitSharing());
  addClickEvent("close", () => closeSharePopup());
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// POPUP

/** Opens the sharing popup and prevents the client from clicking on the map */
function openSharePopup() {
  loadSharedUsers();
  overlay.classList.add("cover");
}

/** Closes the pop and allows clients to click on the map again */
function closeSharePopup() {
  overlay.classList.remove("cover");
  clearPopupInput();
}

/** Adds the given email to the email bank */
function addEmail() {
  let email = emailInput.value;
  if (!(email in shareEmails) && !(memberEmails.has(email))) {
    let newEmail = createEmailDiv(email, "To share", () => removeEmail(email));
    emailInput.value="";
    shareEmails[email] = newEmail;

    let firstEmail = emailBank.firstElementChild;
    emailBank.insertBefore(newEmail, firstEmail);
  }
}

/**
 * Removes an email from the email bank and from shareEmails
 * @param {String} email the email that needs to be removed
 */
function removeEmail(email) {
  shareEmails[email].remove();
  delete shareEmails[email];
}

/**
 * Returns a DOM element with the email and a remove button
 * @param {String} email the user's email
 * @param {String} userStatus whether this is a new user or existing member
 * @param {*} callback function called when the div is deleted by the user
 */
function createEmailDiv(email, userStatus, callback) {
  let listItem = makeEl("li", LIST+ITEM);
  let rippleItem = makeEl("span", LIST+ITEM+RIPPLE);
  let graphicElement = makeEl("span", LIST+ITEM+META);

  let buttonElement = makeMaterialIconBtn("person_remove", ICON_BUTTON, callback);
  graphicElement.appendChild(buttonElement);

  let buttonRipple = new MDCRipple(buttonElement);
  buttonRipple.unbounded = true;

  let textItem = makeMaterialTextElement(email, userStatus);

  listItem.appendChild(rippleItem);
  listItem.appendChild(textItem);
  listItem.appendChild(graphicElement);

  return listItem;
}

/** Clears the email input and email bank in the sharing popup */
function clearPopupInput() {
  emailInput.value = "";
  emailBank.innerHTML = "";
  shareEmails = {};
}

/** Updates the email bank with the given member emails */
function parseEmails(emails) {
  //clear previously stored emails
  memberEmails.clear();
  emailBank.innerHTML = "";

  emails.forEach((email) => {
    memberEmails.add(email);
    let emailDiv = createEmailDiv(email, "Member", () => removeMember(email));
    emailBank.appendChild(emailDiv);
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SERVER INTERACTIONS

/** Shares the map with all the emails in the email bank */
function submitSharing() {
  let newEmails = Array.from(Object.keys(shareEmails));
  let params = buildFetchParams({emails: newEmails});

  fetch("/share-server", buildFetchContent('POST', params))
    .then((response) => response.text())
    .then((worked) => {
     if (worked == 'true') {
       clearPopupInput();
       loadSharedUsers();
     }
     else {
       alert("Submit failed, please try again");
     }
   });
}

/** Retrieves all the users shared to this map */
function loadSharedUsers() {
  // fetchStr initialized in main.js
  fetch("/share-server"+fetchStr)
      .then((response) => response.json())
      .then((emails) => parseEmails(emails));
}

/**
 * Removes the member from the chatroom
 * @param {String} email email to be removed from the chatroom
 */
function removeMember(email) {
  if (!memberEmails.has(email)) return;

  let callback = () => window.location.href = '/';
  let params = buildFetchParams({});
  let server = "/room-server";

  // room is not being deleted
  if (memberEmails.size !== 1) {
    params.email = email;
    server = "/share-server";
  }

  //userEmail is initalized in main.js
  // user is not removing themselves from the chatroom
  if (email != userEmail) {
    callback = () => loadSharedUsers();
  }

  fetch(server, buildFetchContent('DELETE', params))
        .then(callback);
}
