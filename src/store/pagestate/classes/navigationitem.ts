/**
 * Item for Navigation component's list.
 */
export default class NavigationItem {
  /** <string> Path to the icon representing the item. */
  icon: string = null;
  /** <string> Name representing the item. */
  title: string = null;
  /** <string> Path to the destination of the item. */
  path: string = null;
  /** <NavigationItem[]> Other items contained by this item. If length>0 this
   * item's path should be useless. */
  children: NavigationItem[] = [];
  /**
   * <boolean> If the item has got children, marks if it should be expanded or
   * not. Default false.
   */
  expanded: boolean = false;

  /**
   * Item for Navigation component's list.
   * @param icon <string> Path to the icon representing the item
   * @param title <string> Name representing the item
   * @param path <string> Path to the destination of the item. Useless if this
   * item has children.
   * @param children <NavigationItem[]> Other items contained by this item. If
   * length>0 this item's path should be useless.
   */
  constructor(icon: string, title: string, path: string,
    children?: NavigationItem[]) {
    if (icon) this.icon = icon;
    if (title) this.title = title;
    if (path) this.path = path;
    if (children) this.children = children;
  }
}