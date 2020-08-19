class Thread {

  /** contains all Thread objects mapped as name: Thread*/
  static allThreads_ = {};

  /** the DOM element wrapping all the chat messages */
  static wrapperElement_;

  /** The name of the thread that is currently being used by the user */
  static visibleThread_;

  /** Name to be given to the first thread of every chatroom */
  static DEFAULT_THREAD_NAME = "General";

  static DEFAULT_MESSAGE = " created this thread";

  /** Checks if this chatroom is empty. If so, creates a default thread */
  static doneLoading() {}

  /**
   * @Private
   * Hides the current thread and displays the given thread
   * @param {Thread} thread the thread to make visible
   */
  static changeThreads_(thread) {}

  /** Returns the Thread object that is currently visible */
  static getVisibleThread_() {}

  /** Returns the name of the current thread */
  static getCurrThreadName_() {}

  /**
   * Adds and displays a given message to the given thread
   * @param {String} username the message author
   * @param {String} message the message text
   * @param {String} thread the name of this message's thread
   * @param {Boolean} isCurrUser if the author is the current user
   */
  static addMessage(username, message, thread, isCurrUser) {}

  /**
   * Adds a new Thread object to allThreads_ and creates the menu item for it
   * @param {String} threadName the name of the thread
   */
  static addThread_(threadName) {}

  /**
   * Returns the Thread object with the given name
   * @param {String} name the name of the thread
   */
  static getThread_(name) {}

  /** Creates and displays a default thread for this chatroom */
  static makeDefaultThread() {}

  /**
   * @Private
   * Sends a default message from the current user in a new thread
   */
  static sendDefaultMessage_() {}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CREATE THREAD

  /** Displays the temp thread with a textarea and submit button */
  static createTempThread() {}

  /** Returns if the given thread name is a) one word, b) unique for this
   * chatroom, and c) only contains alphanumeric characters
   * @param {String} name the name of the new thread
   */
  static isValidThreadName(name) {}

  /**
   * Retrieves the given thread name, checks if it is valid, and sends the
  * information to the server and hides the temp thread
   */
  static submitThread() {}

  /** Hides the temporary thread */
  static hideTempThread() {}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// NON-STATIC

  /** The name of this thread */
  name_;

  /** The DOM element containing this thread's messages */
  div_;

  constructor(name) {
    this.name_ = name;
  }

  /**
   * @Private
   * Adds a message to the DOM
   * @param {String} username the message author
   * @param {String} message the message text
   * @param {Boolean} isCurrUser if the author is the current user
   */
  showMessage_(username, message, isCurrUser) {
    var node = document.createElement("div");
    var textnode = document.createTextNode(username + ": " + message);

    if(isCurrUser) {
      node.classList.add("myMessage");
    } else {
      node.classList.add("otherMessage");
    }
    node.classList.add("message");

    node.appendChild(textnode);
    this.div_.appendChild(node);
  }

  /** Creates a new wrapper for this thread and adds the title */
  createDiv_() {}

  /** Returns this thread's DOM wrapper */
  getDiv() {}

  /** Returns the thread's name */
  getName() {}

  /** Hides this thread from the user */
  hide() {}

  /** Displays this thread for the user */
  show() {}
}
