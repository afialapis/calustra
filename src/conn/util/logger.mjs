import {red, blue, cyan, magenta, yellow, gray} from 'tinguir'

const LEVELS= {
  none   : 0,
  error  : 1,
  warn   : 2,
  info   : 3,
  verbose: 4,
  debug  : 5,
  silly  : 6
}

class Logger {
  prefix = 'calustra-conn'

  constructor (level) {
    this.set_level(level)
  }

  set_level(level) {
    this.level= LEVELS[level != undefined ? level : 'none']
  }
  
  
  set_prefix(prefix) {
    this.prefix= prefix
  }

  _log(color, lvl, msg) {
    if (this.level>=lvl) {
      console.log(color(`[${this.prefix}] ${msg}`))
    }
  }

  silly(msg) {
    this._log(gray, 6, msg)
  }

  debug(msg) {
    this._log(magenta, 5, msg)
  }

  verbose(msg) {
    this._log(cyan, 4, msg)
  }

  info(msg) {
    this._log(blue, 3, msg)
  }

  warn(msg) {
    this._log(yellow, 2, msg)
  }

  error(msg) {
    this._log(red, 1, msg)
  }
}

export default Logger
