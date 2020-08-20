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
const THREAD_MENU = "thread-menu";
const CHAT_WRAPPER = "chat-wrapper";

/** Initializes function fields and creates the default and temporary threads */
function setupThreads() {
  chatWrapper = document.getElementById(CHAT_WRAPPER);
  threadMenu = document.getElementById(THREAD_MENU);
  addThread(DEFAULT_THREAD_NAME);
  // makeTempThread();
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
}

/** Makes the DOM element that allows users to create new elements */
// TODO: function makeTempThread() {}

/**
 * Hides the current thread and displays the given thread
 * @param {Thread} thread the thread to make visible
 */
// TODO: function changeThreads(thread) {}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CREATE THREAD

/** Displays the temp thread with a textarea and submit button */
// TODO: function createTempThread() {}

/** Returns if the given thread name is a) one word, b) unique for this
 * chatroom, and c) only contains alphanumeric characters
 * @param {String} name the name of the new thread
 */
// TODO: function isValidThreadName(name) {}

/**
 * Retrieves the given thread name, checks if it is valid, and sends the
 * information to the server and hides the temp thread
 */
// TODO: function submitThread() {}

/** Sends a default message from the current user in a new thread */
// TODO: function sendDefaultMessage() {}

/** Hides the temporary thread */
// TODO: function hideTempThread() {}
