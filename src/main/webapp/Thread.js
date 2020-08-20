class Thread {

  /** Classes used for identifying thread components */
  static MESSAGE = "message";
  static MY_MESSAGE = "myMessage";
  static OTHER_MESSAGE = "OtherMessage";
  static THREAD_WRAPPER = "thread-wrapper";
  static THREAD_NAME = "thread-name";
  static THREAD_MESSAGES = "thread-messages";
  static MENU_ITEM = "thread-menu-item";

  /** The name of this thread */
  name_;

  /** The DOM element containing this thread's content */
  threadWrapper_;

  /** The DOM element containing this thread's messages */
  messageWrapper_;

  constructor(name) {
    this.name_ = name;
    this.createWrapper_();
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

    this.messageWrapper_.appendChild(node);
  }

  /**
   * @Private
   * Creates a new wrapper for this thread and adds the title
   */
  createWrapper_() {
    let wrapper = makeEl("div", Thread.THREAD_WRAPPER);
    this.threadWrapper_ = wrapper;

    let title = makeEl("h1", Thread.THREAD_NAME);
    title.innerHTML = this.name_;

    let messages = makeEl("div", Thread.THREAD_MESSAGES);
    this.messageWrapper_ = messages;

    wrapper.appendChild(title);
    wrapper.appendChild(messages);
  }

  /** Returns the menu item for this thread */
  createMenuItem() {
    let btn = makeEl("btn", Thread.MENU_ITEM);
    btn.innerHTML = this.name_;
    btn.addEventListener('click', () => changeThreads(this));
    return btn;
  }

  /** Returns this thread's DOM wrapper */
  getThreadWrapper() {
    return this.threadWrapper_;
  }

  /** Returns the thread's name */
  getName() {
    return this.name_;
  }

  /** Hides this thread from the user */
  hide() {
    this.threadWrapper_.style.display = 'none';
  }

  /** Displays this thread for the user */
  show() {
    this.threadWrapper_.style.display = 'block';
  }
}
