import teleapi from 'teleapi';

module.exports = class Bot {
  constructor(token, pollingRatio) {
    this.api = teleapi(token);
    this.pollingRatio = pollingRatio;
    this.offset = null;
    this.commands = [];
  }
  addCommand(regex, handler) {
    this.commands[this.commands.length] = (update) => {
      if (regex.test(update.text)) {
        handler(update.message, this);
      }
    };

    return this;
  }
  sendMessage(msg) {
    this.api.sendMessage(msg);
  }
  checkForUpdates() {
    this.api.getUpdates({ offset: this.offset })
      .then((result) => {
        result.forEach((update) => {
          this.commands.forEach(command => command(update));
          this.offset = update.update_id + 1;
        });
      });
  }
  Poll() {
    this.checkForUpdates();
    setTimeout(this.Poll.bind(this), this.pollingRatio);
  }
  startPolling() {
    (this.Poll.bind(this))();
  }
};
