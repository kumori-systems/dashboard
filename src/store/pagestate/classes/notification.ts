/**
 * Notification for the user.
 */
export class Notification {

  /**  <Notification.LEVEL> Importance of the debug message. */
  level: Notification.LEVEL = Notification.LEVEL.DEBUG;

  /** <string> Text sumerizing the notification's message. */
  title: string = null;

  /** <string> Long text explaining the notification. */
  text: string = null;

  /** <Date> Time where the notification was received. */
  time: Date = null;

  /**
   * Notification for the user.
   * @param title <string> Text sumerizing the notification.
   * @param text <string> Long text explaining the notification.
   */
  constructor(
    level: Notification.LEVEL, title: string, text: string, time?: Date
  ) {
    if (level) this.level = level;
    if (title) this.title = title;
    if (text) this.text = text;
    if (time) this.time = time;
    else this.time = new Date();
  }
}

export module Notification {
  export enum LEVEL {
    ERROR = 'red', WARNING = 'yellow', INFO = 'blue', DEBUG = 'grey'
  };
}