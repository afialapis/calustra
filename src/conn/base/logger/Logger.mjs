import { blue, cyan, gray, magenta, red, yellow } from "tinguir"

const LEVELS = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

class Logger {
  constructor(level) {
    this.set_level(level)
  }

  set_level(level) {
    this.level = LEVELS[level !== undefined ? level : "none"]
  }

  _log(color, lvl, msg) {
    if (this.level >= LEVELS[lvl]) {
      console.log(color(msg))
    }
  }

  silly(msg) {
    this._log(gray, "silly", msg)
  }

  debug(msg) {
    this._log(magenta, "debug", msg)
  }

  verbose(msg) {
    this._log(cyan, "verbose", msg)
  }

  info(msg) {
    this._log(blue, "info", msg)
  }

  warn(msg) {
    this._log(yellow, "warn", msg)
  }

  error(msg) {
    this._log(red, "error", msg)
  }
}

export default Logger
