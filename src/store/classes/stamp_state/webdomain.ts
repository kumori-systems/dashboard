export class Webdomain {
    url: string;
    state: Webdomain.State;
    constructor(url: string, state: Webdomain.State) {
        this.url = url;
        this.state = state;
    }
}

export module Webdomain {
    export enum State { VALIDATED, ON_VALIDATION, ERRONEUS }
}