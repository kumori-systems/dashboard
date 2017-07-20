import StampElement from './stampelement';
export abstract class Resource implements StampElement {
    uri: string;
    name: string;
    owner: string;
    version: string;
    constructor(uri: string) {
        this.uri = uri;
        let splitted: Array<string> = this.uri.split('/');
        this.owner = splitted[2];
        this.name = splitted[5];
        for (let i = 6; i < splitted.length; i++) {
            this.name += '.' + splitted[i];
        }
        this.version = '';
    }
}

export class Webdomain extends Resource {
    state: Webdomain.State;
    domain: string;
    constructor(uri: string, domain: string, state: Webdomain.State) {
        super(uri);
        this.domain = domain;
        this.state = state;
    }
}

export module Webdomain {
    export enum State { VALIDATED, ON_VALIDATION, ERRONEUS }
}

export class DataVolume extends Resource {
    constructor(uri: string) {
        super(uri);
    }
}

export class Cert extends Resource {
    constructor(uri: string) {
        super(uri);
    }
}