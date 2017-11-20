/**
 * Notification for the user.
 */
export default class Notification {
  /** <string> Text sumerizing the notification's message. */
  title: string = null;
  /** <string> Long text explaining the notification. */
  text: string = null;

  /**
   * Notification for the user.
   * @param title <string> Text sumerizing the notification.
   * @param text <string> Long text explaining the notification.
   */
  constructor(title: string, text: string) {
    if (title) this.title = title;
    if (text) this.text = text;
  }
}