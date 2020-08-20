
/** contains all Thread objects mapped as name: Thread*/
var allThreads = {};

/** the DOM element wrapping all the chat messages */
var chatWrapper;

/** the DOM element where the thread menu will be */
var threadMenu;

/** The Thread that is currently being used by the user */
var visibleThread;

/** Name to be given to the first thread of every chatroom */
const DEFAULT_THREAD_NAME = "General";

/** Content of message used to initalize new threads */
const DEFAULT_MESSAGE = " created this thread";

/** Classes used to build thread-related HTML */
const MESSAGE = "message";
const MY_MESSAGE = "myMessage";
const OTHER_MESSAGE = "OtherMessage";
const THREAD_WRAPPER = "thread-wrapper";
const THREAD_NAME = "thread-name";
const THREAD_MENU_ITEM = "thread-menu-item";

/** Initializes function fields and creates the default and temporary threads */
function setupThreads() {
  chatWrapper = document.getElementById(CHAT_WRAPPER);
  threadMenu = document.getElementById(THREAD_MENU);
  addThread(DEFAULT_THREAD_NAME);
  makeTempThread();
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
  let threadObj = allThreads[threadName];

  if (!threadObj) {
    threadObj = addThread(threadName);
  }

  threadObj.showMessage(username, message, isCurrUser);
}

/**
 * Returns a new Thread object and creates the menu item for it
 * @param {String} threadName the name of the thread
 */
function addThread(threadName) {
  let threadObj = new Thread(threadName);
  allThreads[threadName] = threadObj;
  createThreadMenuItem(threadObj);
  return threadObj;
}

/**
 * @Private
 * Builds the menu item for the given thread wrapper
 * @param {Thread} thread the Thread associated with this menu item
 */
function createThreadMenuItem(thread) {}

/**
 * @Private
 * Makes the DOM element that allows users to create new elements
 */
function makeTempThread() {}

/**
 * @Private
 * Hides the current thread and displays the given thread
 * @param {Thread} thread the thread to make visible
 */
function changeThreads(thread) {}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CREATE THREAD

/** Displays the temp thread with a textarea and submit button */
function createTempThread() {}

/** Returns if the given thread name is a) one word, b) unique for this
 * chatroom, and c) only contains alphanumeric characters
 * @param {String} name the name of the new thread
 */
function isValidThreadName(name) {}

/**
 * Retrieves the given thread name, checks if it is valid, and sends the
* information to the server and hides the temp thread
 */
function submitThread() {}

/**
 * @Private
 * Sends a default message from the current user in a new thread
 */
function sendDefaultMessage() {}

/** Hides the temporary thread */
function hideTempThread() {}
