class Thread {
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
    let node = makeEl("div", MESSAGE);
    node.innerHTML = username + ": " + message;

    let messageType = isCurrUser? MY_MESSAGE: OTHER_MESSAGE;
    node.classList.add(messageType);

    this.div_.appendChild(node);
  }

  /**
   * @Private
   * Creates a new wrapper for this thread and adds the title
   */
  createDiv_() {
    let wrapper = makeEl("div", THREAD_WRAPPER);
    let title = makeEl("h1", THREAD_NAME);
    title.innerHTML = this.name_;

    wrapper.appendChild(title);
    this.div_ = wrapper;
    chatWrapper.appendChild(wrapper);
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
