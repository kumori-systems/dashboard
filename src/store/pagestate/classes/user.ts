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
    readonly accessToken: string;
    readonly expiresIn: number;
    readonly refreshToken: string;
    readonly tokenType: string;
    readonly creationDate: Date;

    constructor(
      accessToken: string, expiresIn: number, refreshToken: string,
      tokenType: string
    ) {
      if (!accessToken) {
        console.error('Required param accessToken');
        throw new Error('Required param accessToken');
      }
      this.accessToken = accessToken;
      if (!expiresIn) {
        console.error('Required param expiresIn');
        throw new Error('Required param expiresIn');
      }
      this.expiresIn = expiresIn;
      if (!refreshToken) {
        console.error('Required param refreshToken');
        throw new Error('Required param refreshToken');
      }
      this.refreshToken = refreshToken;
      if (!tokenType) {
        console.error('Required param tokenType');
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