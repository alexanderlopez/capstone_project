var overlay;

var emailInput;

var emailBank;

var sharedBank;

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
  let emailDiv = createEmailDiv(emailInput.value);
  emailInput.value="";
  emailBank.appendChild(emailDiv);
}

/**
 * Creates a DOM element with the email and a delete button and adds it
 * to the email bank
 */
function createEmailDiv(email) {
  let emailWrapper = makeEl("div", "emailWrapper");
  emailWrapper.setAttribute("data-email", email);

  let emailText = document.createElement("p");
  emailText.innerHTML = email;

  let deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "x";
  deleteBtn.addEventListener('click', () => emailWrapper.remove());

  emailWrapper.appendChild(emailText);
  emailWrapper.appendChild(deleteBtn);

  return(emailWrapper);
}

/** Clears the email input and email bank in the sharing popup */
function clearPopupInput() {
  emailInput.value = "";
  emailBank.innerHTML = "";
}

/** Retrieves all the emails the email bank in the sharing popup */
function getEmailsFromBank() {
  var emailWrappers = emailBank.childNodes;
  let emails = [];
  emailWrappers.forEach(function(node) {
    emails.push(node.getAttribute("data-email"));
  });
  return emails;
}

/** Retrieves all the emails the email bank in the sharing popup */
function parseEmails(emails) {
  sharedBank.innerHTML="";
  emails.forEach((email) => {
    let emailDiv = createEmailDiv(email);
    sharedBank.appendChild(emailDiv);
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// SERVER INTERACTIONS

/** Shares the map with all the emails in the email bank */
function submitSharing() {
  let shareEmails = getEmailsFromBank();
  let currRoomId = roomId;
  let params = {
    emails: shareEmails,
    roomId: currRoomId,
    id: idToken
  };

  fetch("/share-server", {
    method:'POST',
    headers: { 'Content-Type': 'text/html' },
    body: JSON.stringify(params)
  }).then((response) => response.text())
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
  fetch(`/share-server?idToken=${idToken}&idRoom=${roomId}`)
      .then((response) => response.json())
      .then((emails) => parseEmails(emails));
}
