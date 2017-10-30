import StampElement from './stampelement';
export abstract class Resource implements StampElement {
    readonly uri: string;
    name: string = null;
    owner: string = null;
    version: string = null;
    inUse: Function = () => { this.inUseBy.length === 0; };
    inUseBy: string[] = [];
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

    addUsedBy(uri: string) {
        this.inUseBy.push(uri);
    }

    removeUsedBy(uri: string) {
        this.inUseBy.splice(this.inUseBy.indexOf(uri));
    }
}

export class Domain extends Resource {
    state: Domain.State;
    domain: string;
    constructor(uri: string, domain: string, state: Domain.State) {
        super(uri);
        this.domain = domain;
        this.state = state;
    }
}

export module Domain {
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