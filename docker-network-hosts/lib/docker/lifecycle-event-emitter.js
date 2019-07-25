const { EventEmitter } = require("events");

const DockerEvents = require("docker-events");

const EVENTS = ["create", "start", "stop", "die", "destroy"];

class LifecycleEventEmitter extends EventEmitter {
  constructor(docker) {
    super();

    this._started = false;
    this._dockerEvents = new DockerEvents({ docker });
  }

  start() {
    if (this._started) return;

    this._dockerEvents.start();
    this._started = true;

    EVENTS.forEach(event => {
      this._dockerEvents.on(event, message => {
        this.emit("change", {
          type: event,
          message
        });
      });
    });
  }

  stop() {
    if (!this._started) return;

    this._dockerEvents.stop();
    this._dockerEvents.removeAllListeners();
    this._started = false;
  }
}

module.exports = LifecycleEventEmitter;
