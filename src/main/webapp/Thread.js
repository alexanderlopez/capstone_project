class Thread {

  /** contains all Thread objects mapped as name: Thread*/
  static allThreads_ = {};

  /** the DOM element wrapping all the chat messages */
  static chatWrapper_;

  /** the DOM element where the thread menu will be */
  static threadMenu_;

  /** The Thread that is currently being used by the user */
  static visibleThread_;

  /** Name to be given to the first thread of every chatroom */
  static DEFAULT_THREAD_NAME = "General";

  /** Content of message used to initalize new threads */
  static DEFAULT_MESSAGE = " created this thread";

  /** Classes used to build thread-related HTML */
  static MESSAGE = "message";
  static MY_MESSAGE = "myMessage";
  static OTHER_MESSAGE = "OtherMessage";
  static THREAD_WRAPPER = "thread-wrapper";
  static THREAD_NAME = "thread-name";
  static THREAD_MENU_ITEM = "thread-menu-item";

  /** Initializes static fields and creates the default and temporary threads */
  static setupThreads() {
    Thread.chatWrapper_ = document.getElementById(CHAT_WRAPPER);
    Thread.threadMenu_ = document.getElementById(THREAD_MENU);
    Thread.addThread_(Thread.DEFAULT_THREAD_NAME);
    Thread.makeTempThread_();
  }

  /** Displays the default thread */
  static doneLoading() {
    let defaultThread = Thread.allThreads_[Thread.DEFAULT_THREAD_NAME];
    defaultThread.show();
    Thread.visibleThread_ = defaultThread;
  }

  /**
   * @Private
   * Hides the current thread and displays the given thread
   * @param {Thread} thread the thread to make visible
   */
  static changeThreads_(thread) {}

  /**
   * @Private
   * Returns the Thread object that is currently visible
   */
  static getVisibleThread_() {
    return Thread.visibleThread_;
  }

  /**
   * @Private
   * Returns the name of the current thread
   */
  static getCurrThreadName_() {
    return Thread.visibleThread_.getName();
  }

  /**
   * Adds and displays a given message to the given thread
   * @param {String} username the message author
   * @param {String} message the message text
   * @param {String} threadName the name of this message's thread
   * @param {Boolean} isCurrUser if the author is the current user
   */
  static addMessage(username, message, threadName, isCurrUser) {
    let threadObj = Thread.allThreads_[threadName];

    if (!threadObj) {
      threadObj = Thread.addThread_(threadName);
    }

    threadObj.showMessage(username, message, isCurrUser);
  }

  /**
   * @Private
   * Returns a new Thread object and creates the menu item for it
   * @param {String} threadName the name of the thread
   */
  static addThread_(threadName) {
    let threadObj = new Thread(threadName);
    Thread.allThreads_[threadName] = threadObj;
    Thread.createThreadMenuItem_(threadObj);
    return threadObj;
  }

  /**
   * @Private
   * Builds the menu item for the given thread wrapper
   * @param {Thread} thread the Thread associated with this menu item
   */
  static createThreadMenuItem_(thread) {}

  /**
   * @Private
   * Sends a default message from the current user in a new thread
   */
  static sendDefaultMessage_() {

  }

  /**
   * @Private
   * Makes the DOM element that allows users to create new elements
   */
  static makeTempThread_() {}

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
    this.createDiv_();
  }

  /**
   * Adds a message to the DOM
   * @param {String} username the message author
   * @param {String} message the message text
   * @param {Boolean} isCurrUser if the author is the current user
   */
  showMessage(username, message, isCurrUser) {
    let node = makeEl("div", Thread.MESSAGE);
    node.innerHTML = username + ": " + message;

    let messageType = isCurrUser? Thread.MY_MESSAGE: Thread.OTHER_MESSAGE;
    node.classList.add(messageType);

    this.div_.appendChild(node);
  }

  /**
   * @Private
   * Creates a new wrapper for this thread and adds the title
   */
  createDiv_() {
    let wrapper = makeEl("div", Thread.THREAD_WRAPPER);
    let title = makeEl("h1", Thread.THREAD_NAME);
    title.innerHTML = this.name_;

    wrapper.appendChild(title);
    this.div_ = wrapper;
    Thread.chatWrapper_.appendChild(wrapper);
  }

  /** Returns this thread's DOM wrapper */
  getDiv() {
    return this.div_;
  }

  /** Returns the thread's name */
  getName() {
    return this.name_;
  }

  /** Hides this thread from the user */
  hide() {
    this.div_.style.display = 'none';
  }

  /** Displays this thread for the user */
  show() {
    this.div_.style.display = 'block';
  }
}
