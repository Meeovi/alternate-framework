const ONE_SECONDS = 1000;

export default class Timer {
  constructor() {
    this.currentInSeconds = 0;
    this.timer = null
  }

  static convertToMillisecs(d = "0") {
    return d.split(":").reverse().map((e) => +e).map((e, i) => (i === 0 ? e : e * Math.pow(60, i)) * 1000).reduce((p, c) => p + c, 0);
  }

  static toTimeString(timeInMillisecs) {
    const c = new Date(timeInMillisecs);

    const t = [
      c.getHours() - 1,
      c.getMinutes(),
      c.getSeconds()
    ]
    return t.map((e) => ("" + e).padStart(2, "0")).join(":")
  }

  start(_at = 0, cb = (time) => {}) {
    let _atInMillisecs = _at
    if (typeof _at === "string") {
      _atInMillisecs = Timer.convertToMillisecs(_at)
    };
    this.currentInSeconds = _atInMillisecs;

    this.timer = setInterval(() => {
      this.currentInSeconds += ONE_SECONDS;
      cb(this.currentInSeconds)
    }, ONE_SECONDS)
  }

  stop() {
    clearInterval(this.timer)
  }

  reset () {
    this.currentInSeconds = 0;
  }
}