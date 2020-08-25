var overlay;

var emailInput;

var emailBank;

var sharedBank;

var memberEmails = new Set();

var shareEmails = {};

/** sets */
function initSharing() {
  overlay = document.getElementById("share-popup");
  emailInput = document.getElementById("email");
  emailBank = document.getElementById("email-bank");
  sharedBank = document.getElementById("shared-bank");
  loadSharedUsers();
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// POPUP

/** Opens the sharing popup and prevents the client from clicking on the map */
function openSharePopup() {
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
    let emailDiv = createEmailDiv(email, () => removeEmail(email));
    emailInput.value="";
    shareEmails[email] = emailDiv;
    emailBank.appendChild(emailDiv);
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
 * Creates a DOM element with the email and a delete button and adds it
 * to the email bank
 * @param{String} email the user's email
 * @param{*} callback function called when the div is deleted by the user
 */
function createEmailDiv(email, callback) {
  let emailWrapper = makeEl("div", "emailWrapper");
  emailWrapper.setAttribute("data-email", email);

  let emailText = document.createElement("p");
  emailText.innerHTML = email;

  let deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "x";
  deleteBtn.addEventListener('click', callback);

  emailWrapper.appendChild(emailText);
  emailWrapper.appendChild(deleteBtn);

  return(emailWrapper);
}

/** Clears the email input and email bank in the sharing popup */
function clearPopupInput() {
  emailInput.value = "";
  emailBank.innerHTML = "";
  shareEmails = {};
}

/** Retrieves all the emails the email bank in the sharing popup */
function parseEmails(emails) {
  //clear previously stored emails
  sharedBank.innerHTML="";
  memberEmails.clear();

  emails.forEach((email) => {
    memberEmails.add(email);
    let emailDiv = createEmailDiv(email, () => removeMember(email));
    sharedBank.appendChild(emailDiv);
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
