/**
 * User properties.
 */
export class User {
  /** <string> Path to icon representing the user */
  avatar: string = '/static/default_user_avatar.png';
  /** <string> Real id of the user. */
  id: string = null;
  /** <string> Name representing the user. */
  name: string = null;
  /** <string> Token which autentifies the user. */
  token: string = null;
  /**
   * <User.State> Represents if the user has been authenticated or is a guest
   * in the system.
   */
  state: User.State = User.State.UNAUTHENTICATED;

  /**
   * If no parameters are passed default values are taken for each param.
   * @param id <string> User's id.
   * @param name <string> User's name.
   * @param token <string> Token which autentifies the user.
   * @param state <User.State> User's state Unauthorized | Authenticated |
   * On_validation. Default Unauthorized
   * @param avatar <string> Url to user's avatar. Default
   * /static/default_user_avatar.png
   */
  constructor(id?: string, name?: string, state?: User.State, token?: string,
    avatar?: string) {
    if (id) this.id = id;
    if (name) this.name = name;
    if (state && state !== null) this.state = state;
    if (token) this.token = token;
    if (avatar && avatar !== null && avatar.length > 0) this.avatar = avatar;
  }
}

export module User {
  /**
   * Represents if the user has been authenticated or is a guest in the system.
   */
  export enum State {
    UNAUTHENTICATED = 'unauthenticated',
    AUTHENTICATED = 'authenticated'
  };
}