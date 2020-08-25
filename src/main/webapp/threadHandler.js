/** contains all Thread objects mapped as name: Thread*/
var allThreads = {};

/** the DOM element wrapping all the chat messages */
var chatWrapper;

/** the DOM element where the thread menu will be */
var menuWrapper;

/** The Thread that is currently being used by the user */
var visibleThread;

/** The name of the new thread that was just created by this user */
var newThread;

/** Name to be given to the first thread of every chatroom */
const DEFAULT_THREAD_NAME = "General";

/** Content of message used to initalize new threads */
const DEFAULT_MESSAGE = "created this thread";

/** Classes used to build thread-related HTML */
const MENU_WRAPPER = "menu-items";
const CHAT_WRAPPER = "chat-wrapper";
const THREAD_FORM = "thread-form";
const THREAD_INPUT = "thread-input";
const NEW_THREAD = "new-thread";
const SUBMIT_THREAD = "submit-thread";

/** Initializes function fields and creates the default and temporary threads */
function initThreads() {
  chatWrapper = document.getElementById(CHAT_WRAPPER);
  menuWrapper = document.getElementById(MENU_WRAPPER);
  addThread(DEFAULT_THREAD_NAME);
  menuOpen = false;
}

/** Displays the default thread */
function doneLoading() {
  let defaultThread = allThreads[DEFAULT_THREAD_NAME];
  defaultThread.show();
  visibleThread = defaultThread;
}

/**
 * Adds and displays a given message to the given thread
 * @param {String} username the message author
 * @param {String} message the message text
 * @param {String} threadName the name of this message's thread
 * @param {Boolean} isCurrUser if the author is the current user
 */
function addMessage(username, message, threadName, isCurrUser) {
  if (!(threadName in allThreads)) {
    addThread(threadName);
  }

  let threadObj = allThreads[threadName];
  threadObj.showMessage(username, message, isCurrUser);
}

/**
 * Creates and stores a new Thread object
 * @param {String} threadName the name of the thread
 */
function addThread(threadName) {
  let threadObj = new Thread(threadName);
  allThreads[threadName] = threadObj;

  chatWrapper.appendChild(threadObj.getThreadWrapper());

  if (threadName ===  newThread) {
    changeThreads(threadObj);
  }
}

/**
 * Hides the current thread and displays the given thread
 * @param {Thread} thread the thread to make visible
 */
 function changeThreads(thread) {
   visibleThread.hide();
   thread.show();
   visibleThread = thread;
   toggleThreadMenu();
   hideTempThread();
 }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CREATE THREAD

/** Displays the temp thread with a textarea and submit button */
function showTempThread() {
  setDisplay(THREAD_FORM, 'block');
  setDisplay(NEW_THREAD, 'none');
  setDisplay(SUBMIT_THREAD, 'block');
}

/** Hides the temp thread with a textarea and submit button */
function hideTempThread() {
  setDisplay(THREAD_FORM, 'none');
  setDisplay(SUBMIT_THREAD, 'none');
  setDisplay(NEW_THREAD, 'block');
  let input = document.getElementById(THREAD_INPUT);
  input.value = "";
}

/** Returns if the given thread name only contains alphanumeric characters
 * and - or _
 * @param {String} name the name of the new thread
 */
function hasValidCharacters(name) {
  var regex = /^[a-zA-Z0-9-_]+$/;
  return regex.test(name);
}

/**
 * Retrieves the given thread name, checks if it is valid, and sends the
 * information to the server and hides the temp thread
 */
function submitThread() {
  let input = document.getElementById(THREAD_INPUT);
  let threadName = input.value.trim();
  
  if (!hasValidCharacters(threadName)) {
    alert("Thread name must be one word containing only alphanumeric characters and dashes. Try again.");
    return;
  }

  if (threadName in allThreads) {
    alert("Thread already exists");
    return;
  }

  newThread = threadName;
  sendMessage(DEFAULT_MESSAGE, threadName);
  input.value = "";
  hideTempThread();
}

/**
 * Sets the display of the DOM element with a certain id to the given value
 * @param {String} id the id of the DOM element
 * @param {String} val the value of the DOM element
 */
function setDisplay(id, val) {
  document.getElementById(id).style.display = val;
}
