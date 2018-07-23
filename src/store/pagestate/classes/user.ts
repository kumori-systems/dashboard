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
  token: User.Token = null;

  /**
   * <User.State> Represents if the user has been authenticated or is a guest
   * in the system.
   */
  state: User.State = User.State.UNAUTHENTICATED;

  /**
   * If no parameters are passed default values are taken for each param.
   * @param id <string> User's id.
   * @param name <string> User's name.
   * @param token <User.Token> Token which autentifies the user.
   * @param state <User.State> User's state Unauthorized | Authenticated |
   * On_validation. Default Unauthorized
   * @param avatar <string> Url to user's avatar. Default
   * /static/default_user_avatar.png
   */
  constructor(
    id?: string, name?: string, state?: User.State, token?: User.Token,
    avatar?: string
  ) {
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

  export class Token {

    /** Token user to authenticate the user without user-password needed. */
    readonly accessToken: string;

    /** Time in which the token is valid. */
    readonly expiresIn: number;

    /** Token used to refresh the actual access token. */
    readonly refreshToken: string;

    /** Type of token. */
    readonly tokenType: string;

    /** Date when the token has been created. */
    readonly creationDate: Date;

    /**
     * A user-related-token used to authenticate the user in the stamp.
     */
    constructor(
      accessToken: string, expiresIn: number, refreshToken: string,
      tokenType: string
    ) {
      if (!accessToken) {
        throw new Error('Required param accessToken');
      }
      this.accessToken = accessToken;
      if (!expiresIn) {
        throw new Error('Required param expiresIn');
      }
      this.expiresIn = expiresIn;
      if (!refreshToken) {
        throw new Error('Required param refreshToken');
      }
      this.refreshToken = refreshToken;
      if (!tokenType) {
        throw new Error('Required param tokenType');
      }
      this.tokenType = tokenType;

      this.creationDate = new Date();
    }

    /**
     * 
     * @param creationDate date of creation of the token
     * @param expiresIn seconds for the token to expire
     */
    static isTokenAlive(creationDate: Date, expiresIn: number): boolean {

      const actualDate: Date = new Date();
      const expirationDate: Date = new Date(
        creationDate.getTime() + expiresIn * 1000
      );
      return expirationDate > actualDate;

    }

  }
}