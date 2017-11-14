/**
 * Element for the Floating Action Button.
 */
export default class FabElement {
  /** <string> Name representing the item. His length should be > 0*/
  title: string = null;
  /** <string> Path to the destination. */
  to: string = null;

  /**
   * Element for the Floating Action Button
   * @param title <string> Name representing the item. Can't be undefined or
   * null. Length must be > 0.
   * @param to <string> Path to the destination.
   */
  constructor(title: string, to: string) {
    if (!title || title.length === 0)
      throw new Error('Invalid title for FabElement: ' + title);
    this.title = title;
    if (to) this.to = to;
  }
}