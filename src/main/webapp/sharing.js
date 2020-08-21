function initSharing() {
  setMapShareEvents();
}

/** Sets the events related to sharing the map with another user */
function setMapShareEvents() {
  addClickEvent("shareBtnWrapper", () => openSharePopup());
  addClickEvent("addEmail", () => addEmail());
  addClickEvent("share", () => submitSharing());
  addClickEvent("close", () => closeSharePopup());
}

/** Opens the sharing popup and prevents the client from clicking on the map */
function openSharePopup() {
  let overlay = document.getElementById("share-popup");
  overlay.classList.add("cover");
}

/** Closes the pop and allows clients to click on the map again */
function closeSharePopup() {
  let overlay = document.getElementById("share-popup");
  overlay.classList.remove("cover");
  clearPopupInput();
}

/** Adds the given email to the email bank */
function addEmail() {
  let input = document.getElementById("email");
  let emailDiv = createEmailDiv(input.value);
  input.value="";
  let emailBank = document.getElementById("email-bank");
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
  let emailInput = document.getElementById("email");
  emailInput.value = "";

  let emailBank = document.getElementById("email-bank");
  emailBank.innerHTML = "";
}

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
       myMap.clearPopupInput();
     }
     else {
       alert("Submit failed, please try again");
     }
   });
}

/** Retrieves all the emails the email bank in the sharing popup */
function getEmailsFromBank() {
  let emailBank = document.getElementById("email-bank");
  var emailWrappers = emailBank.childNodes;
  let emails = [];
  emailWrappers.forEach(function(node) {
    emails.push(node.getAttribute("data-email"));
  });
  return emails;
}
